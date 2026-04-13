import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { UpsertNotificationChannelInput } from './dto/UpsertNotificationChannel.input';
import { UpsertNotificationPreferenceInput } from './dto/UpsertNotificationPreference.input';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async myChannels(userId: string, userType: string) {
    return this.prisma.notificationChannel.findMany({
      where: { userId, userType },
      orderBy: { channelType: 'asc' },
    });
  }

  async myPreferences(userId: string, userType: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId, userType },
      orderBy: { eventType: 'asc' },
    });
  }

  async upsertChannel(userId: string, userType: string, input: UpsertNotificationChannelInput) {
    return this.prisma.notificationChannel.upsert({
      where: {
        uq_notification_channel: { userId, userType, channelType: input.channelType },
      },
      create: {
        userId,
        userType,
        channelType: input.channelType,
        config: (input.config ?? {}) as object,
        isActive: input.isActive ?? true,
      },
      update: {
        ...(input.config !== undefined && { config: input.config as object }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  async upsertPreference(userId: string, userType: string, input: UpsertNotificationPreferenceInput) {
    return this.prisma.notificationPreference.upsert({
      where: {
        uq_notification_preference: { userId, userType, eventType: input.eventType },
      },
      create: {
        userId,
        userType,
        eventType: input.eventType,
        channels: input.channels,
        isEnabled: input.isEnabled ?? true,
      },
      update: {
        channels: input.channels,
        ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
      },
    });
  }

  async deleteChannel(userId: string, userType: string, channelType: string) {
    await this.prisma.notificationChannel.deleteMany({
      where: { userId, userType, channelType },
    });
    return true;
  }
}
