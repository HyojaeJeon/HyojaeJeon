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
import { BranchService } from './Branch.service';
import { BranchModel } from './models/Branch.model';
import { EdgePosTerminalModel } from '@platform/edgePos/models/EdgePosTerminal.model';
import { CreateBranchInput } from './dto/CreateBranch.input';
import { UpdateBranchInput } from './dto/UpdateBranch.input';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { CentralGraphQLContext } from '@core/graphql/loaders/graphqlContext';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

const BranchModel__ListResp = createListResponse(BranchModel, 'BranchModelListResponse');
const BranchModel__Resp = createObjectResponse(BranchModel, 'BranchModelResponse');

@Resolver(() => BranchModel)

export class BranchResolver {
  constructor(private readonly branchService: BranchService) {}

  /**
   * 한국어: 지점에 소속된 Edge POS 터미널 목록을 DataLoader로 해결하는 ResolveField.
   *   N+1 쿼리 문제를 방지하기 위해 branchId별로 일괄 로딩한다.
   *
   * Tiếng Việt: ResolveField giải quyết danh sách Edge POS terminal thuộc chi nhánh bằng DataLoader.
   *   Tải hàng loạt theo branchId để ngăn chặn vấn đề truy vấn N+1.
   */
  @RequirePermission('edgepos:read')
  @ResolveField(() => [EdgePosTerminalModel])
  async edgePosTerminals(
    @Parent() branch: BranchModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<EdgePosTerminalModel[]> {
    return context.loaders.edgePosTerminalsByBranchId.load(branch.id) as unknown as Promise<EdgePosTerminalModel[]>;
  }

  /**
   * 한국어: 특정 브랜드 본사(brandHQId)에 소속된 지점 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách chi nhánh thuộc trụ sở thương hiệu (brandHQId) cụ thể.
   */
  @Query(() => BranchModel__ListResp)
  @RequirePermission('branches:read')
  async branches(
    @Args('brandHQId', { type: () => ID, nullable: true }) brandHQId: string | null,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    if (brandHQId) {
      return this.branchService.findByBrand(brandHQId, pagination.skip, pagination.take, user);
    }
    return this.branchService.findAll(pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 지점을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn chi nhánh cụ thể theo ID.
   */
  @Query(() => BranchModel__Resp, { nullable: true })
  @RequirePermission('branches:read')
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
  @Mutation(() => BranchModel__Resp)
  @RequirePermission('branches:update')
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
  @Mutation(() => BranchModel__Resp)
  @RequirePermission('branches:update')
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
  @Mutation(() => BooleanResponse)
  @RequirePermission('branches:update')
  async deleteBranch(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.branchService.softDelete(id, user);
  }
}
