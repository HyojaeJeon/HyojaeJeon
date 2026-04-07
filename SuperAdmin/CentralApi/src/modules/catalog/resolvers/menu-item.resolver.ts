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
import { MenuItemService } from '../services/menu-item.service';
import { BrandMenuItemModel } from '../models/brand-menu-item.model';
import { CreateMenuItemInput, UpdateMenuItemInput } from '../dto/create-menu-item.input';
import { PaginationArgs } from '../../../common/dto/pagination.args';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../../common/decorators/current-user.decorator';
import { RoleCode } from '../../auth/constants/roles.constant';

@Resolver(() => BrandMenuItemModel)
@UseGuards(GqlAuthGuard, RolesGuard)
export class MenuItemResolver {
  constructor(private readonly service: MenuItemService) {}

  /**
   * 한국어: 특정 브랜드의 메뉴 항목 목록을 조회하는 Query.
   * Tiếng Việt: Query truy vấn danh sách mục menu của thương hiệu cụ thể.
   */
  @Query(() => [BrandMenuItemModel])
  @Roles(RoleCode.BRAND_HQ_ADMIN)
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
  @Query(() => BrandMenuItemModel, { nullable: true })
  @Roles(RoleCode.BRAND_HQ_ADMIN)
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
  @Mutation(() => BrandMenuItemModel)
  @Roles(RoleCode.BRAND_HQ_ADMIN)
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
  @Mutation(() => BrandMenuItemModel)
  @Roles(RoleCode.BRAND_HQ_ADMIN)
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
  @Mutation(() => Boolean)
  @Roles(RoleCode.BRAND_HQ_ADMIN)
  async deleteMenuItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(id, user);
  }
}
