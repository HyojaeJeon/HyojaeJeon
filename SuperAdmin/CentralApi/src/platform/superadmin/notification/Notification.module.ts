import { Module } from '@nestjs/common';
import { NotificationResolver } from './Notification.resolver';
import { NotificationService } from './Notification.service';

@Module({
  providers: [NotificationResolver, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
