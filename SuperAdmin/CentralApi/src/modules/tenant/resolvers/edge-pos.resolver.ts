/**
 * 한국어: Edge POS 터미널 GraphQL 리졸버.
 *   Edge POS 단말기 조회, 등록, 상태 변경, 삭제를 위한 GraphQL 엔드포인트를 정의한다.
 *   PLATFORM_SUPER_ADMIN, REGIONAL_DISTRIBUTOR_ADMIN, BRAND_HQ_ADMIN, BRANCH_MANAGER 역할이 접근 가능하다.
 *   branchId를 기준으로 해당 지점의 터미널 목록을 조회한다.
 *
 * Tiếng Việt: GraphQL resolver Terminal Edge POS.
 *   Định nghĩa các endpoint GraphQL cho truy vấn, đăng ký, thay đổi trạng thái, xóa thiết bị Edge POS.
 *   Vai trò PLATFORM_SUPER_ADMIN, REGIONAL_DISTRIBUTOR_ADMIN, BRAND_HQ_ADMIN, BRANCH_MANAGER có quyền truy cập.
 *   Truy vấn danh sách terminal theo branchId của chi nhánh tương ứng.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EdgePosService } from '../services/edge-pos.service';
import { EdgePosTerminalModel } from '../models/edge-pos-terminal.model';
import { RegisterEdgePosInput } from '../dto/register-edge-pos.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => EdgePosTerminalModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class EdgePosResolver {
  constructor(private readonly edgePosService: EdgePosService) {}

  /**
   * 한국어: 특정 지점(branchId)에 소속된 Edge POS 터미널 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách Edge POS terminal thuộc chi nhánh (branchId) cụ thể.
   */
  @Query(() => [EdgePosTerminalModel])
  @Roles(
    RoleCode.PLATFORM_SUPER_ADMIN,
    RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
    RoleCode.BRAND_HQ_ADMIN,
    RoleCode.BRANCH_MANAGER,
  )
  async edgePosTerminals(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ): Promise<EdgePosTerminalModel[]> {
    return this.edgePosService.findByBranch(branchId, pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 Edge POS 터미널을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn Edge POS terminal cụ thể theo ID.
   */
  @Query(() => EdgePosTerminalModel, { nullable: true })
  @Roles(
    RoleCode.PLATFORM_SUPER_ADMIN,
    RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
    RoleCode.BRAND_HQ_ADMIN,
    RoleCode.BRANCH_MANAGER,
  )
  async edgePosTerminal(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EdgePosTerminalModel | null> {
    return this.edgePosService.findById(id, user);
  }

  /**
   * 한국어: 새 Edge POS 터미널을 등록하는 Mutation.
   * Tiếng Việt: Mutation đăng ký Edge POS terminal mới.
   */
  @Mutation(() => EdgePosTerminalModel)
  @Roles(
    RoleCode.PLATFORM_SUPER_ADMIN,
    RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
    RoleCode.BRAND_HQ_ADMIN,
    RoleCode.BRANCH_MANAGER,
  )
  async registerEdgePos(
    @Args('input') input: RegisterEdgePosInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<EdgePosTerminalModel> {
    return this.edgePosService.create(input, user);
  }

  /**
   * 한국어: Edge POS 터미널의 상태를 변경하는 Mutation.
   *   예: 'Active' -> 'Offline' 또는 'Decommissioned'
   *
   * Tiếng Việt: Mutation thay đổi trạng thái Edge POS terminal.
   *   Ví dụ: 'Active' -> 'Offline' hoặc 'Decommissioned'
   */
  @Mutation(() => EdgePosTerminalModel)
  @Roles(
    RoleCode.PLATFORM_SUPER_ADMIN,
    RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
    RoleCode.BRAND_HQ_ADMIN,
    RoleCode.BRANCH_MANAGER,
  )
  async updateEdgePosStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EdgePosTerminalModel> {
    return this.edgePosService.updateStatus(id, status, user);
  }

  /**
   * 한국어: Edge POS 터미널을 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm Edge POS terminal.
   */
  @Mutation(() => Boolean)
  @Roles(
    RoleCode.PLATFORM_SUPER_ADMIN,
    RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
    RoleCode.BRAND_HQ_ADMIN,
    RoleCode.BRANCH_MANAGER,
  )
  async deleteEdgePos(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.edgePosService.softDelete(id, user);
  }
}
