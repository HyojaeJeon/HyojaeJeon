import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { SelfAction } from '@core/rbac/decorators/SelfAction.decorator';
import { createListResponse, createObjectResponse, BooleanResponse } from '@core/response/OperationResponse.factory';
import { NotificationService } from './Notification.service';
import { NotificationChannelModel } from './models/NotificationChannel.model';
import { NotificationPreferenceModel } from './models/NotificationPreference.model';
import { UpsertNotificationChannelInput } from './dto/UpsertNotificationChannel.input';
import { UpsertNotificationPreferenceInput } from './dto/UpsertNotificationPreference.input';

const ChannelListResp = createListResponse(NotificationChannelModel, 'NotificationChannelListResponse');
const ChannelResp = createObjectResponse(NotificationChannelModel, 'NotificationChannelResponse');
const PreferenceListResp = createListResponse(NotificationPreferenceModel, 'NotificationPreferenceListResponse');
const PreferenceResp = createObjectResponse(NotificationPreferenceModel, 'NotificationPreferenceResponse');

@Resolver()
export class NotificationResolver {
  constructor(private readonly service: NotificationService) {}

  @SelfAction()
  @Query(() => ChannelListResp, { name: 'myNotificationChannels' })
  myChannels(@CurrentUser() user: JwtPayload) {
    return this.service.myChannels(user.sub, user.userType);
  }

  @SelfAction()
  @Query(() => PreferenceListResp, { name: 'myNotificationPreferences' })
  myPreferences(@CurrentUser() user: JwtPayload) {
    return this.service.myPreferences(user.sub, user.userType);
  }

  @SelfAction()
  @Mutation(() => ChannelResp)
  upsertNotificationChannel(
    @Args('input') input: UpsertNotificationChannelInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.upsertChannel(user.sub, user.userType, input);
  }

  @SelfAction()
  @Mutation(() => PreferenceResp)
  upsertNotificationPreference(
    @Args('input') input: UpsertNotificationPreferenceInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.upsertPreference(user.sub, user.userType, input);
  }

  @SelfAction()
  @Mutation(() => BooleanResponse)
  deleteNotificationChannel(
    @Args('channelType') channelType: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.deleteChannel(user.sub, user.userType, channelType);
  }
}
