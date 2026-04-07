/**
 * 한국어: Audit 리졸버 — 감사 로그 조회 GraphQL Query 엔드포인트.
 *         PLATFORM_SUPER_ADMIN 또는 PLATFORM_SUPPORT_ENGINEER 역할이 접근 가능하다.
 *         감사 로그 기록(Mutation)은 서비스 내부 호출로만 수행하며, 외부 GraphQL로는 조회만 허용한다.
 * Tiếng Việt: Resolver Audit — endpoint GraphQL Query truy vấn log kiểm toán.
 *             Vai trò PLATFORM_SUPER_ADMIN hoặc PLATFORM_SUPPORT_ENGINEER được phép truy cập.
 *             Ghi log kiểm toán (Mutation) chỉ thực hiện qua gọi service nội bộ, bên ngoài GraphQL chỉ cho phép truy vấn.
 */
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogModel } from './models/audit-log.model';
import { AuditLogFilterArgs } from './dto/audit-log-filter.args';
import { AuditLogConnectionArgs } from './dto/audit-log-connection.args';
import { AuditLogConnectionModel } from './models/audit-log-connection.model';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleCode } from '../auth/constants/roles.constant';

@Resolver(() => AuditLogModel)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.PLATFORM_SUPPORT_ENGINEER)
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  /**
   * 한국어: 감사 로그 목록 조회 — AuditLogFilterArgs를 통해 다양한 필터 조건과 페이지네이션 적용.
   * Tiếng Việt: Truy vấn danh sách log kiểm toán — áp dụng các điều kiện lọc và phân trang qua AuditLogFilterArgs.
   */
  @Query(() => [AuditLogModel])
  async auditLogs(@Args() filter: AuditLogFilterArgs): Promise<AuditLogModel[]> {
    return this.auditService.findAll(filter);
  }

  @Query(() => AuditLogConnectionModel)
  async auditLogConnection(
    @Args() filter: AuditLogConnectionArgs,
  ): Promise<AuditLogConnectionModel> {
    return this.auditService.findConnection(filter);
  }

  /**
   * 한국어: 감사 로그 단건 조회 (ID 기준). 존재하지 않으면 null 반환.
   * Tiếng Việt: Truy vấn đơn lẻ log kiểm toán (theo ID). Trả về null nếu không tồn tại.
   */
  @Query(() => AuditLogModel, { nullable: true })
  async auditLog(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AuditLogModel | null> {
    return this.auditService.findById(id);
  }
}
