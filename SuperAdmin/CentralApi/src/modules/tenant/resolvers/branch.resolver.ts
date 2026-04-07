/**
 * 한국어: 지점(Branch) GraphQL 리졸버.
 *   지점 조회, 생성, 수정, 삭제를 위한 GraphQL Query 및 Mutation 엔드포인트를 정의한다.
 *   PLATFORM_SUPER_ADMIN, REGIONAL_DISTRIBUTOR_ADMIN, BRAND_HQ_ADMIN 역할이 접근 가능하다.
 *   DataLoader를 활용한 edgePosTerminals ResolveField로 N+1 문제를 해결한다.
 *
 * Tiếng Việt: GraphQL resolver Chi nhánh (Branch).
 *   Định nghĩa các endpoint GraphQL Query và Mutation cho truy vấn, tạo, cập nhật, xóa chi nhánh.
 *   Vai trò PLATFORM_SUPER_ADMIN, REGIONAL_DISTRIBUTOR_ADMIN, BRAND_HQ_ADMIN có quyền truy cập.
 *   Giải quyết vấn đề N+1 bằng ResolveField edgePosTerminals sử dụng DataLoader.
 */
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BranchService } from '../services/branch.service';
import { BranchModel } from '../models/branch.model';
import { EdgePosTerminalModel } from '../models/edge-pos-terminal.model';
import { CreateBranchInput } from '../dto/create-branch.input';
import { UpdateBranchInput } from '../dto/update-branch.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { RoleCode } from '../../auth/constants/roles.constant';
import { CentralGraphQLContext } from '../../../common/loaders/graphql-context';

@Resolver(() => BranchModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BranchResolver {
  constructor(private readonly branchService: BranchService) {}

  /**
   * 한국어: 지점에 소속된 Edge POS 터미널 목록을 DataLoader로 해결하는 ResolveField.
   *   N+1 쿼리 문제를 방지하기 위해 branchId별로 일괄 로딩한다.
   *
   * Tiếng Việt: ResolveField giải quyết danh sách Edge POS terminal thuộc chi nhánh bằng DataLoader.
   *   Tải hàng loạt theo branchId để ngăn chặn vấn đề truy vấn N+1.
   */
  @ResolveField(() => [EdgePosTerminalModel])
  async edgePosTerminals(
    @Parent() branch: BranchModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<EdgePosTerminalModel[]> {
    return context.loaders.edgePosTerminalsByBranchId.load(branch.id);
  }

  /**
   * 한국어: 특정 브랜드 본사(brandHQId)에 소속된 지점 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách chi nhánh thuộc trụ sở thương hiệu (brandHQId) cụ thể.
   */
  @Query(() => [BranchModel])
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN, RoleCode.BRAND_HQ_ADMIN)
  async branches(
    @Args('brandHQId', { type: () => ID }) brandHQId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ): Promise<BranchModel[]> {
    return this.branchService.findByBrand(brandHQId, pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 지점을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn chi nhánh cụ thể theo ID.
   */
  @Query(() => BranchModel, { nullable: true })
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN, RoleCode.BRAND_HQ_ADMIN)
  async branch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BranchModel | null> {
    return this.branchService.findById(id, user);
  }

  /**
   * 한국어: 새 지점을 생성하는 Mutation.
   * Tiếng Việt: Mutation tạo chi nhánh mới.
   */
  @Mutation(() => BranchModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN, RoleCode.BRAND_HQ_ADMIN)
  async createBranch(
    @Args('input') input: CreateBranchInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<BranchModel> {
    return this.branchService.create(input, user);
  }

  /**
   * 한국어: 기존 지점 정보를 수정하는 Mutation.
   * Tiếng Việt: Mutation cập nhật thông tin chi nhánh hiện tại.
   */
  @Mutation(() => BranchModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN, RoleCode.BRAND_HQ_ADMIN)
  async updateBranch(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBranchInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<BranchModel> {
    return this.branchService.update(id, input, user);
  }

  /**
   * 한국어: 지점을 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm chi nhánh.
   */
  @Mutation(() => Boolean)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN, RoleCode.BRAND_HQ_ADMIN)
  async deleteBranch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.branchService.softDelete(id, user);
  }
}
