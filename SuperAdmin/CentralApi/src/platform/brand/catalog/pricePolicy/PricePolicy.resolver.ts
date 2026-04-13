/**
 * 한국어: 가격 정책(PricePolicy) GraphQL 리졸버.
 *   가격 정책 조회 및 삭제를 위한 GraphQL 엔드포인트를 정의한다.
 *   BRAND_HQ_ADMIN 역할이 접근 가능하다.
 *   brandHQId를 기준으로 특정 브랜드의 가격 정책을 관리한다.
 *   (생성 Mutation은 별도 서비스 계층에서 호출, 여기서는 조회/삭제만 노출)
 *
 * Tiếng Việt: GraphQL resolver Chính sách Giá (PricePolicy).
 *   Định nghĩa các endpoint GraphQL cho truy vấn và xóa chính sách giá.
 *   Vai trò BRAND_HQ_ADMIN có quyền truy cập.
 *   Quản lý chính sách giá của thương hiệu cụ thể theo brandHQId.
 *   (Mutation tạo mới được gọi từ tầng service riêng, ở đây chỉ cung cấp truy vấn/xóa)
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PricePolicyService } from './PricePolicy.service';
import { PricePolicyModel } from './models/PricePolicy.model';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

const PricePolicyModel__ListResp = createListResponse(PricePolicyModel, 'PricePolicyModelListResponse');
const PricePolicyModel__Resp = createObjectResponse(PricePolicyModel, 'PricePolicyModelResponse');

@Resolver(() => PricePolicyModel)

export class PricePolicyResolver {
  constructor(private readonly service: PricePolicyService) {}

  /**
   * 한국어: 특정 브랜드의 가격 정책 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách chính sách giá của thương hiệu cụ thể.
   */
  @RequirePermission('catalog:read')
  @Query(() => PricePolicyModel__ListResp)
  async pricePolicies(
    @Args('brandHQId', { type: () => ID }) brandHQId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findByBrand(brandHQId, pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 가격 정책을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn chính sách giá cụ thể theo ID.
   */
  @RequirePermission('catalog:read')
  @Query(() => PricePolicyModel__Resp, { nullable: true })
  async pricePolicy(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(id, user);
  }

  /**
   * 한국어: 가격 정책을 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm chính sách giá.
   */
  @RequirePermission('catalog:update')
  @Mutation(() => BooleanResponse)
  async deletePricePolicy(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(id, user);
  }
}
