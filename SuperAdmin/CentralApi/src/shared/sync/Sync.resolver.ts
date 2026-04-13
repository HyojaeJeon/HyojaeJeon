/**
 * 한국어: Sync 리졸버 — Edge POS 동기화 상태 조회 GraphQL Query 엔드포인트.
 *         PLATFORM_SUPER_ADMIN 역할만 접근 가능하며, 특정 Edge POS 단말의 동기화 상태를 조회한다.
 *         상향 동기화 수신은 REST webhook(SyncController)으로 처리하며, 이 리졸버는 조회 전용이다.
 * Tiếng Việt: Resolver Sync — endpoint GraphQL Query truy vấn trạng thái đồng bộ Edge POS.
 *             Chỉ vai trò PLATFORM_SUPER_ADMIN được phép truy cập, truy vấn trạng thái đồng bộ
 *             của terminal Edge POS cụ thể.
 *             Nhận đồng bộ hướng lên qua REST webhook (SyncController), resolver này chỉ dùng để truy vấn.
 */
import { Args, ID, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SyncService } from './Sync.service';
import { SyncStatusModel } from './models/SyncStatus.model';
import { SyncEventModel } from './models/SyncEvent.model';
import { SyncEventConnectionModel } from './models/SyncEventConnection.model';
import { SyncEventConnectionArgs } from './dto/SyncEventConnection.args';
import { createObjectResponse } from '@core/response/OperationResponse.factory';
import { GraphqlSubscriptionBusService } from '@core/graphql/subscriptions/GraphqlSubscriptionBus.service';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';

const SyncEventConnectionModel__Resp = createObjectResponse(SyncEventConnectionModel, 'SyncEventConnectionModelResponse');
const SyncStatusModel__Resp = createObjectResponse(SyncStatusModel, 'SyncStatusModelResponse');

@Resolver(() => SyncStatusModel)
export class SyncResolver {
  constructor(
    private readonly syncService: SyncService,
    private readonly subscriptionBus: GraphqlSubscriptionBusService,
  ) {}

  /**
   * 한국어: 특정 Edge POS 단말의 동기화 상태 조회 — lastSyncAt, lastHeartbeatAt, status 반환.
   * Tiếng Việt: Truy vấn trạng thái đồng bộ của terminal Edge POS cụ thể — trả về lastSyncAt, lastHeartbeatAt, status.
   */
  @Query(() => SyncStatusModel__Resp)
  async syncStatus(@Args('edgePosId', { type: () => ID }) edgePosId: string) {
    return this.syncService.getSyncStatus(edgePosId);
  }

  @Query(() => SyncEventConnectionModel__Resp)
  async syncEventConnection(
    @Args() filter: SyncEventConnectionArgs,
  ): Promise<SyncEventConnectionModel> {
    return this.syncService.findEventConnection(filter);
  }

  @RequirePermission('edgepos:read')
  @Subscription(() => SyncEventModel, {
    name: 'syncEventReceived',
    filter: (
      payload: { syncEventReceived?: SyncEventModel },
      variables: { edgePosId?: string; eventType?: string },
    ) => {
      const event = payload.syncEventReceived;
      if (!event) return false;
      if (variables.edgePosId && event.edgePosId !== variables.edgePosId) return false;
      if (variables.eventType && event.eventType !== variables.eventType) return false;
      return true;
    },
    resolve: (payload: { syncEventReceived?: SyncEventModel }) => payload.syncEventReceived,
  })
  syncEventReceived(
    @Args('edgePosId', { type: () => ID, nullable: true }) _edgePosId?: string,
    @Args('eventType', { type: () => String, nullable: true }) _eventType?: string,
  ) {
    return this.subscriptionBus.asyncIterator<SyncEventModel>('syncEventReceived');
  }
}
