/**
 * 한국어: 메뉴 카테고리 GraphQL 리졸버.
 *   메뉴 카테고리 조회, 생성, 수정, 삭제를 위한 GraphQL 엔드포인트를 정의한다.
 *   BRAND_HQ_ADMIN 역할이 접근 가능하다.
 *   brandHQId를 기준으로 특정 브랜드의 카테고리를 관리한다.
 *
 * Tiếng Việt: GraphQL resolver Danh mục Menu.
 *   Định nghĩa các endpoint GraphQL cho truy vấn, tạo, cập nhật, xóa danh mục menu.
 *   Vai trò BRAND_HQ_ADMIN có quyền truy cập.
 *   Quản lý danh mục của thương hiệu cụ thể theo brandHQId.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MenuCategoryService } from './MenuCategory.service';
import { BrandMenuCategoryModel } from './models/BrandMenuCategory.model';
import { CreateMenuCategoryInput, UpdateMenuCategoryInput } from './dto/CreateMenuCategory.input';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

const BrandMenuCategoryModel__ListResp = createListResponse(BrandMenuCategoryModel, 'BrandMenuCategoryModelListResponse');
const BrandMenuCategoryModel__Resp = createObjectResponse(BrandMenuCategoryModel, 'BrandMenuCategoryModelResponse');

@Resolver(() => BrandMenuCategoryModel)

export class MenuCategoryResolver {
  constructor(private readonly service: MenuCategoryService) {}

  /**
   * 한국어: 특정 브랜드의 메뉴 카테고리 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách danh mục menu của thương hiệu cụ thể.
   */
  @RequirePermission('catalog:read')
  @Query(() => BrandMenuCategoryModel__ListResp)
  async menuCategories(
    @Args('brandHQId', { type: () => ID }) brandHQId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findByBrand(brandHQId, pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 메뉴 카테고리를 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh mục menu cụ thể theo ID.
   */
  @RequirePermission('catalog:read')
  @Query(() => BrandMenuCategoryModel__Resp, { nullable: true })
  async menuCategory(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(id, user);
  }

  /**
   * 한국어: 새 메뉴 카테고리를 생성하는 Mutation.
   * Tiếng Việt: Mutation tạo danh mục menu mới.
   */
  @RequirePermission('catalog:update')
  @Mutation(() => BrandMenuCategoryModel__Resp)
  async createMenuCategory(
    @Args('input') input: CreateMenuCategoryInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(input, user);
  }

  /**
   * 한국어: 기존 메뉴 카테고리를 수정하는 Mutation.
   * Tiếng Việt: Mutation cập nhật danh mục menu hiện tại.
   */
  @RequirePermission('catalog:update')
  @Mutation(() => BrandMenuCategoryModel__Resp)
  async updateMenuCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMenuCategoryInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, input, user);
  }

  /**
   * 한국어: 메뉴 카테고리를 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm danh mục menu.
   */
  @RequirePermission('catalog:update')
  @Mutation(() => BooleanResponse)
  async deleteMenuCategory(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(id, user);
  }
}
