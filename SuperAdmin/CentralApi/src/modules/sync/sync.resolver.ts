/**
 * 한국어: Sync 리졸버 — Edge POS 동기화 상태 조회 GraphQL Query 엔드포인트.
 *         PLATFORM_SUPER_ADMIN 역할만 접근 가능하며, 특정 Edge POS 단말의 동기화 상태를 조회한다.
 *         상향 동기화 수신은 REST webhook(SyncController)으로 처리하며, 이 리졸버는 조회 전용이다.
 * Tiếng Việt: Resolver Sync — endpoint GraphQL Query truy vấn trạng thái đồng bộ Edge POS.
 *             Chỉ vai trò PLATFORM_SUPER_ADMIN được phép truy cập, truy vấn trạng thái đồng bộ
 *             của terminal Edge POS cụ thể.
 *             Nhận đồng bộ hướng lên qua REST webhook (SyncController), resolver này chỉ dùng để truy vấn.
 */
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncStatusModel } from './models/sync-status.model';
import { SyncEventConnectionModel } from './models/sync-event-connection.model';
import { SyncEventConnectionArgs } from './dto/sync-event-connection.args';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleCode } from '../auth/constants/roles.constant';

@Resolver(() => SyncStatusModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class SyncResolver {
  constructor(private readonly syncService: SyncService) {}

  /**
   * 한국어: 특정 Edge POS 단말의 동기화 상태 조회 — lastSyncAt, lastHeartbeatAt, status 반환.
   * Tiếng Việt: Truy vấn trạng thái đồng bộ của terminal Edge POS cụ thể — trả về lastSyncAt, lastHeartbeatAt, status.
   */
  @Query(() => SyncStatusModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async syncStatus(@Args('edgePosId', { type: () => ID }) edgePosId: string) {
    return this.syncService.getSyncStatus(edgePosId);
  }

  @Query(() => SyncEventConnectionModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN)
  async syncEventConnection(
    @Args() filter: SyncEventConnectionArgs,
  ): Promise<SyncEventConnectionModel> {
    return this.syncService.findEventConnection(filter);
  }
}
