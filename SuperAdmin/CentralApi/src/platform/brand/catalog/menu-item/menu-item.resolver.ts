/**
 * 한국어: 메뉴 항목(MenuItem) GraphQL 리졸버.
 *   메뉴 항목 조회, 생성, 수정, 삭제를 위한 GraphQL 엔드포인트를 정의한다.
 *   BRAND_HQ_ADMIN 역할이 접근 가능하다.
 *   brandHQId를 기준으로 특정 브랜드의 메뉴 항목을 관리한다.
 *
 * Tiếng Việt: GraphQL resolver Mục Menu (MenuItem).
 *   Định nghĩa các endpoint GraphQL cho truy vấn, tạo, cập nhật, xóa mục menu.
 *   Vai trò BRAND_HQ_ADMIN có quyền truy cập.
 *   Quản lý mục menu của thương hiệu cụ thể theo brandHQId.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { BrandMenuItemModel } from './models/brand-menu-item.model';
import { CreateMenuItemInput, UpdateMenuItemInput } from './dto/create-menu-item.input';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { GqlAuthGuard } from '@core/auth/guards/gql-auth.guard';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const BrandMenuItemModel__ListResp = createListResponse(BrandMenuItemModel, 'BrandMenuItemModelListResponse');
const BrandMenuItemModel__Resp = createObjectResponse(BrandMenuItemModel, 'BrandMenuItemModelResponse');

@Resolver(() => BrandMenuItemModel)

export class MenuItemResolver {
  constructor(private readonly service: MenuItemService) {}

  /**
   * 한국어: 특정 브랜드의 메뉴 항목 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách mục menu của thương hiệu cụ thể.
   */
  @Query(() => BrandMenuItemModel__ListResp)
  @RequirePermission('brand.catalog.read')
  async menuItems(
    @Args('brandHQId', { type: () => ID }) brandHQId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findByBrand(brandHQId, pagination.skip, pagination.take, user);
  }

  /**
   * 한국어: 특정 메뉴 항목을 ID로 조회하는 Query.
   * Tiếng Việt: Query truy vấn mục menu cụ thể theo ID.
   */
  @Query(() => BrandMenuItemModel__Resp, { nullable: true })
  @RequirePermission('brand.catalog.read')
  async menuItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(id, user);
  }

  /**
   * 한국어: 새 메뉴 항목을 생성하는 Mutation.
   * Tiếng Việt: Mutation tạo mục menu mới.
   */
  @Mutation(() => BrandMenuItemModel__Resp)
  @RequirePermission('brand.catalog.write')
  async createMenuItem(
    @Args('input') input: CreateMenuItemInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(input, user);
  }

  /**
   * 한국어: 기존 메뉴 항목을 수정하는 Mutation.
   * Tiếng Việt: Mutation cập nhật mục menu hiện tại.
   */
  @Mutation(() => BrandMenuItemModel__Resp)
  @RequirePermission('brand.catalog.write')
  async updateMenuItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMenuItemInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, input, user);
  }

  /**
   * 한국어: 메뉴 항목을 소프트 삭제하는 Mutation.
   * Tiếng Việt: Mutation xóa mềm mục menu.
   */
  @Mutation(() => BooleanResponse)
  @RequirePermission('brand.catalog.write')
  async deleteMenuItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(id, user);
  }
}
