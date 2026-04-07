/**
 * 한국어: 브랜드(Brand) GraphQL 리졸버.
 *   브랜드 조회, 생성, 수정, 삭제를 위한 GraphQL Query 및 Mutation 엔드포인트를 정의한다.
 *   PLATFORM_SUPER_ADMIN과 REGIONAL_DISTRIBUTOR_ADMIN 역할이 접근 가능하다.
 *   DataLoader를 활용한 ResolveField로 하위 관계(branches, menuCategories, menuItems,
 *   pricePolicies, promotions)의 N+1 문제를 해결한다.
 *
 * Tiếng Việt: GraphQL resolver Thương hiệu (Brand).
 *   Định nghĩa các endpoint GraphQL Query và Mutation cho truy vấn, tạo, cập nhật, xóa thương hiệu.
 *   Vai trò PLATFORM_SUPER_ADMIN và REGIONAL_DISTRIBUTOR_ADMIN có quyền truy cập.
 *   Giải quyết vấn đề N+1 cho các quan hệ con (branches, menuCategories, menuItems,
 *   pricePolicies, promotions) bằng ResolveField sử dụng DataLoader.
 */
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BrandService } from '../services/brand.service';
import { BrandProfileModel } from '../models/brand-profile.model';
import { BranchModel } from '../models/branch.model';
import { BrandMenuCategoryModel } from '../../catalog/models/brand-menu-category.model';
import { BrandMenuItemModel } from '../../catalog/models/brand-menu-item.model';
import { PricePolicyModel } from '../../catalog/models/price-policy.model';
import { PromotionModel } from '../../catalog/models/promotion.model';
import { CreateBrandInput } from '../dto/create-brand.input';
import { UpdateBrandInput } from '../dto/update-brand.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { RoleCode } from '../../auth/constants/roles.constant';
import { CentralGraphQLContext } from '../../../common/loaders/graphql-context';

@Resolver(() => BrandProfileModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BrandResolver {
  constructor(private readonly brandService: BrandService) {}

  /**
   * 한국어: 브랜드에 소속된 지점 목록을 DataLoader로 해결하는 ResolveField.
   * Tiếng Việt: ResolveField giải quyết danh sách chi nhánh thuộc thương hiệu bằng DataLoader.
   */
  @ResolveField(() => [BranchModel])
  async branches(
    @Parent() brand: BrandProfileModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<BranchModel[]> {
    return context.loaders.branchesByBrandHQId.load(brand.id);
  }

  /**
   * 한국어: 브랜드의 메뉴 카테고리 목록을 DataLoader로 해결하는 ResolveField.
   * Tiếng Việt: ResolveField giải quyết danh sách danh mục menu của thương hiệu bằng DataLoader.
   */
  @ResolveField(() => [BrandMenuCategoryModel])
  async menuCategories(
    @Parent() brand: BrandProfileModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<BrandMenuCategoryModel[]> {
    return context.loaders.menuCategoriesByBrandHQId.load(brand.id);
  }

  /**
   * 한국어: 브랜드의 메뉴 항목 목록을 DataLoader로 해결하는 ResolveField.
   * Tiếng Việt: ResolveField giải quyết danh sách mục menu của thương hiệu bằng DataLoader.
   */
  @ResolveField(() => [BrandMenuItemModel])
  async menuItems(
    @Parent() brand: BrandProfileModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<BrandMenuItemModel[]> {
    return context.loaders.menuItemsByBrandHQId.load(brand.id);
  }

  /**
   * 한국어: 브랜드의 가격 정책 목록을 DataLoader로 해결하는 ResolveField.
   * Tiếng Việt: ResolveField giải quyết danh sách chính sách giá của thương hiệu bằng DataLoader.
   */
  @ResolveField(() => [PricePolicyModel])
  async pricePolicies(
    @Parent() brand: BrandProfileModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<PricePolicyModel[]> {
    return context.loaders.pricePoliciesByBrandHQId.load(brand.id);
  }

  /**
   * 한국어: 브랜드의 프로모션 목록을 DataLoader로 해결하는 ResolveField.
   * Tiếng Việt: ResolveField giải quyết danh sách khuyến mãi của thương hiệu bằng DataLoader.
   */
  @ResolveField(() => [PromotionModel])
  async promotions(
    @Parent() brand: BrandProfileModel,
    @Context() context: CentralGraphQLContext,
  ): Promise<PromotionModel[]> {
    return context.loaders.promotionsByBrandHQId.load(brand.id);
  }

  /**
   * 한국어: 브랜드 목록을 조회하는 Query.
   *   distributorId가 제공되면 해당 대리점 소속만, null이면 전체를 반환한다.
   *
   * Tiếng Việt: Query truy vấn danh sách thương hiệu.
   *   Nếu distributorId được cung cấp, chỉ trả về thuộc đại lý đó. Nếu null, trả về toàn bộ.
   */
  @Query(() => [BrandProfileModel])
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN)
  async brands(
    @Args('distributorId', { type: () => ID, nullable: true }) distributorId: string | null,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandProfileModel[]> {
    if (distributorId) {
      return this.brandService.findByDistributor(distributorId, pagination.skip, pagination.take, user);
    }
    return this.brandService.findAll(pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 브랜드를 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn thương hiệu cụ thể theo ID.
   */
  @Query(() => BrandProfileModel, { nullable: true })
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN)
  async brand(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandProfileModel | null> {
    return this.brandService.findById(id, user);
  }

  /**
   * 한국어: 새 브랜드를 생성하는 Mutation.
   * Tiếng Việt: Mutation tạo thương hiệu mới.
   */
  @Mutation(() => BrandProfileModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN)
  async createBrand(
    @Args('input') input: CreateBrandInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandProfileModel> {
    return this.brandService.create(input, user);
  }

  /**
   * 한국어: 기존 브랜드 정보를 수정하는 Mutation.
   * Tiếng Việt: Mutation cập nhật thông tin thương hiệu hiện tại.
   */
  @Mutation(() => BrandProfileModel)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN)
  async updateBrand(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBrandInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<BrandProfileModel> {
    return this.brandService.update(id, input, user);
  }

  /**
   * 한국어: 브랜드를 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm thương hiệu.
   */
  @Mutation(() => Boolean)
  @Roles(RoleCode.PLATFORM_SUPER_ADMIN, RoleCode.REGIONAL_DISTRIBUTOR_ADMIN)
  async deleteBrand(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.brandService.softDelete(id, user);
  }
}
