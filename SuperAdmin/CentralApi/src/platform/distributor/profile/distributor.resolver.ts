/**
 * 한국어: 대리점(Distributor) GraphQL 리졸버.
 *   대리점 조회, 생성, 수정, 삭제를 위한 GraphQL Query 및 Mutation 엔드포인트를 정의한다.
 *   PLATFORM_SUPER_ADMIN 역할만 접근 가능하다.
 *   DataLoader를 활용한 brands ResolveField로 N+1 문제를 해결한다.
 *
 * Tiếng Việt: GraphQL resolver Đại lý (Distributor).
 *   Định nghĩa các endpoint GraphQL Query và Mutation cho truy vấn, tạo, cập nhật, xóa đại lý.
 *   Chỉ vai trò PLATFORM_SUPER_ADMIN mới có quyền truy cập.
 *   Giải quyết vấn đề N+1 bằng ResolveField brands sử dụng DataLoader.
 */
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DistributorService } from './distributor.service';
import { DistributorProfileModel } from './models/distributor-profile.model';
import { BrandProfileModel } from '@platform/brand/profile/models/brand-profile.model';
import { CreateDistributorInput } from './dto/create-distributor.input';
import { UpdateDistributorInput } from './dto/update-distributor.input';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { CentralGraphQLContext } from '@core/graphql/loaders/graphql-context';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const DistributorProfileModel__ListResp = createListResponse(DistributorProfileModel, 'DistributorProfileModelListResponse');
const DistributorProfileModel__Resp = createObjectResponse(DistributorProfileModel, 'DistributorProfileModelResponse');

@Resolver(() => DistributorProfileModel)

export class DistributorResolver {
  constructor(private readonly distributorService: DistributorService) {}

  /**
   * 한국어: 대리점에 소속된 브랜드 목록을 해결하는 ResolveField.
   *   DataLoader를 사용하여 대리점 ID별로 브랜드를 일괄 로딩하여 N+1 쿼리를 방지한다.
   *
   * Tiếng Việt: ResolveField giải quyết danh sách thương hiệu thuộc đại lý.
   *   Sử dụng DataLoader để tải hàng loạt thương hiệu theo ID đại lý, ngăn chặn truy vấn N+1.
   */
  @RequirePermission('brand.profile.read')
  @ResolveField(() => [BrandProfileModel])
  async brands(
    @Parent() distributor: DistributorProfileModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<BrandProfileModel[]> {
    return context.loaders.brandsByDistributorId.load(distributor.id) as unknown as Promise<BrandProfileModel[]>;
  }

  /**
   * 한국어: 전체 대리점 목록을 페이지네이션으로 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách tất cả đại lý với phân trang.
   */
  @RequirePermission('distributor.profile.read')
  @Query(() => DistributorProfileModel__ListResp)
  async distributors(
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ): Promise<DistributorProfileModel[]> {
    return this.distributorService.findAll(pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 대리점을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn đại lý cụ thể theo ID.
   */
  @RequirePermission('distributor.profile.read')
  @Query(() => DistributorProfileModel__Resp, { nullable: true })
  async distributor(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<DistributorProfileModel | null> {
    return this.distributorService.findById(id, user);
  }

  /**
   * 한국어: 새 대리점을 생성하는 Mutation.
   * Tiếng Việt: Mutation tạo đại lý mới.
   */
  @RequirePermission('distributor.profile.write')
  @Mutation(() => DistributorProfileModel__Resp)
  async createDistributor(
    @Args('input') input: CreateDistributorInput,
  ): Promise<DistributorProfileModel> {
    return this.distributorService.create(input);
  }

  /**
   * 한국어: 기존 대리점 정보를 수정하는 Mutation.
   * Tiếng Việt: Mutation cập nhật thông tin đại lý hiện tại.
   */
  @RequirePermission('distributor.profile.write')
  @Mutation(() => DistributorProfileModel__Resp)
  async updateDistributor(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDistributorInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<DistributorProfileModel> {
    return this.distributorService.update(id, input, user);
  }

  /**
   * 한국어: 대리점을 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm đại lý.
   */
  @RequirePermission('distributor.profile.write')
  @Mutation(() => BooleanResponse)
  async deleteDistributor(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.distributorService.softDelete(id, user);
  }
}
