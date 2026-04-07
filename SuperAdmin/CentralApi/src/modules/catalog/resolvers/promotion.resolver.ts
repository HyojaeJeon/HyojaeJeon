/**
 * 한국어: 프로모션(Promotion) GraphQL 리졸버.
 *   프로모션 조회 및 삭제를 위한 GraphQL 엔드포인트를 정의한다.
 *   BRAND_HQ_ADMIN 역할이 접근 가능하다.
 *   brandHQId를 기준으로 특정 브랜드의 프로모션을 관리한다.
 *   (생성 Mutation은 별도 서비스 계층에서 호출, 여기서는 조회/삭제만 노출)
 *
 * Tiếng Việt: GraphQL resolver Khuyến mãi (Promotion).
 *   Định nghĩa các endpoint GraphQL cho truy vấn và xóa khuyến mãi.
 *   Vai trò BRAND_HQ_ADMIN có quyền truy cập.
 *   Quản lý khuyến mãi của thương hiệu cụ thể theo brandHQId.
 *   (Mutation tạo mới được gọi từ tầng service riêng, ở đây chỉ cung cấp truy vấn/xóa)
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PromotionService } from '../services/promotion.service';
import { PromotionModel } from '../models/promotion.model';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => PromotionModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class PromotionResolver {
  constructor(private readonly service: PromotionService) {}

  /**
   * 한국어: 특정 브랜드의 프로모션 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách khuyến mãi của thương hiệu cụ thể.
   */
  @Query(() => [PromotionModel])
  @Roles(RoleCode.BRAND_HQ_ADMIN)
  async promotions(
    @Args('brandHQId', { type: () => ID }) brandHQId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findByBrand(brandHQId, pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 프로모션을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn khuyến mãi cụ thể theo ID.
   */
  @Query(() => PromotionModel, { nullable: true })
  @Roles(RoleCode.BRAND_HQ_ADMIN)
  async promotion(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(id, user);
  }

  /**
   * 한국어: 프로모션을 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm khuyến mãi.
   */
  @Mutation(() => Boolean)
  @Roles(RoleCode.BRAND_HQ_ADMIN)
  async deletePromotion(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(id, user);
  }
}
