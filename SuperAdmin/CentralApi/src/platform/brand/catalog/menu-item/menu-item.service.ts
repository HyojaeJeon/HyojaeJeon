/**
 * 한국어: 메뉴 항목(MenuItem) 서비스.
 *   브랜드 본사(BrandHQ)의 메뉴 항목 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 BrandMenuItem 테이블에 접근한다.
 *   브랜드별 조회와 카테고리별 조회를 모두 지원한다.
 *   Prisma Decimal 타입을 JavaScript number로 변환하는 normalizeMenuItem 헬퍼를 사용한다.
 *
 * Tiếng Việt: Service Mục Menu (MenuItem).
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD mục menu của trụ sở thương hiệu (BrandHQ).
 *   Truy cập bảng BrandMenuItem trong PostgreSQL thông qua Prisma ORM.
 *   Hỗ trợ cả truy vấn theo thương hiệu và theo danh mục.
 *   Sử dụng helper normalizeMenuItem để chuyển đổi kiểu Prisma Decimal sang JavaScript number.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/prisma.service';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import {
  brandScopeWhere,
  combineWhere,
  menuCategoryScopeWhere,
  menuItemScopeWhere,
} from '@core/tenancy/tenant-scope';
import { CreateMenuItemInput, UpdateMenuItemInput } from './dto/create-menu-item.input';
import { BrandMenuItemModel } from './models/brand-menu-item.model';

/**
 * 한국어: Prisma BrandMenuItem 행의 타입을 추출한다.
 * Tiếng Việt: Trích xuất kiểu của hàng BrandMenuItem từ Prisma.
 */
type BrandMenuItemRow = Awaited<ReturnType<PrismaService['brandMenuItem']['findMany']>>[number];

/**
 * 한국어: Prisma Decimal 타입인 basePrice, taxRate를 JavaScript number로 변환한다.
 *   GraphQL Float 스칼라와 호환되도록 정규화하는 헬퍼 함수이다.
 *
 * Tiếng Việt: Chuyển đổi basePrice, taxRate từ kiểu Prisma Decimal sang JavaScript number.
 *   Hàm helper chuẩn hóa để tương thích với GraphQL Float scalar.
 */
function normalizeMenuItem(
  row: BrandMenuItemRow,
): BrandMenuItemModel {
  return {
    ...row,
    basePrice: Number(row.basePrice),
    taxRate: Number(row.taxRate),
  };
}

import { PermissionService } from '@core/rbac/permission.service';
import { EntitlementService } from '@shared/entitlement/entitlement.service';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class MenuItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
    private readonly entitlement: EntitlementService,
  ) {}

  /**
   * 평가 컨텍스트는 항상 **target row 의 brandHqId** 를 기준으로 한다.
   * (호출자 JWT 의 tenantContext 가 아니라.)
   * BrandHQ-scoped UserRoleAssignment 가 올바르게 매칭되도록 강제한다.
   */
  private evalCtxFor(user: JwtPayload, brandHqId: string) {
    return {
      userType: user.userType,
      userId: user.sub,
      distributorId: user.tenantContext?.distributorId ?? null,
      brandHqId,
      branchId: user.tenantContext?.branchId ?? null,
      corporateId: user.tenantContext?.corporateId ?? null,
    };
  }

  /**
   * capability(BrandHQ 가 'POS' 구독) ∩ permission(user 가 'brand.catalog.write') 교집합 검증.
   * target row 의 brandHqId 를 항상 명시 전달한다.
   */
  private async ensureCapabilityAndPermission(
    user: JwtPayload,
    brandHqId: string,
    permissionKey: string,
  ) {
    await this.entitlement.requireCapability({ brandHqId }, 'POS');
    await this.permission.require(this.evalCtxFor(user, brandHqId), permissionKey);
  }

  private async ensureAccessibleBrand(brandHQId: string, user?: JwtPayload) {
    const brand = await this.prisma.brandProfile.findFirst({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { id: brandHQId, deletedAt: null },
        brandScopeWhere(user),
      ),
    });

    if (!brand) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Brand is outside caller scope' } });
    }

    return brand;
  }

  private async ensureAccessibleCategory(id: string, user?: JwtPayload) {
    const category = await this.prisma.brandMenuCategory.findFirst({
      where: combineWhere<Prisma.BrandMenuCategoryWhereInput>(
        { id, deletedAt: null },
        menuCategoryScopeWhere(user),
      ),
    });

    if (!category) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Menu category is outside caller scope' } });
    }

    return category;
  }

  private async ensureAccessibleMenuItem(id: string, user?: JwtPayload) {
    const menuItem = await this.prisma.brandMenuItem.findFirst({
      where: combineWhere<Prisma.BrandMenuItemWhereInput>(
        { id, deletedAt: null },
        menuItemScopeWhere(user),
      ),
    });

    if (!menuItem) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Menu item is outside caller scope' } });
    }

    return menuItem;
  }

  /**
   * 한국어: 특정 브랜드의 메뉴 항목 목록을 displayOrder 오름차순으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách mục menu của thương hiệu cụ thể, sắp xếp theo displayOrder tăng dần.
   */
  async findByBrand(brandHQId: string, skip: number, take: number, user?: JwtPayload) {
    const rows = await this.prisma.brandMenuItem.findMany({
      where: combineWhere<Prisma.BrandMenuItemWhereInput>(
        { brandHQId, deletedAt: null },
        menuItemScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { displayOrder: 'asc' },
    });
    return rows.map(normalizeMenuItem);
  }

  /**
   * 한국어: 특정 카테고리의 메뉴 항목 목록을 displayOrder 오름차순으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách mục menu của danh mục cụ thể, sắp xếp theo displayOrder tăng dần.
   */
  async findByCategory(categoryId: string, skip: number, take: number, user?: JwtPayload) {
    const rows = await this.prisma.brandMenuItem.findMany({
      where: combineWhere<Prisma.BrandMenuItemWhereInput>(
        { categoryId, deletedAt: null },
        menuItemScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { displayOrder: 'asc' },
    });
    return rows.map(normalizeMenuItem);
  }

  /**
   * 한국어: ID로 메뉴 항목을 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn mục menu theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    const row = await this.prisma.brandMenuItem.findFirst({
      where: combineWhere<Prisma.BrandMenuItemWhereInput>(
        { id, deletedAt: null },
        menuItemScopeWhere(user),
      ),
    });
    return row ? normalizeMenuItem(row) : null;
  }

  /**
   * 한국어: 새 메뉴 항목을 생성한다.
   *   각 선택 필드의 기본값: itemType='Standard', basePrice=0, taxRate=0,
   *   unitType='EA', displayOrder=0.
   *
   * Tiếng Việt: Tạo mục menu mới.
   *   Giá trị mặc định cho các trường tùy chọn: itemType='Standard', basePrice=0,
   *   taxRate=0, unitType='EA', displayOrder=0.
   */
  async create(input: CreateMenuItemInput, user: JwtPayload) {
    await this.ensureCapabilityAndPermission(user, input.brandHQId, 'brand.catalog.write');
    const brand = await this.ensureAccessibleBrand(input.brandHQId, user);
    const category = await this.ensureAccessibleCategory(input.categoryId, user);

    if (category.brandHQId !== brand.id) {
      throw new DomainError({ code: 'MENU_CATEGORY_BRAND_MISMATCH', details: { reason: 'Menu category must belong to the same brand' } });
    }

    const row = await this.prisma.brandMenuItem.create({
      data: {
        brandHQId: brand.id,
        itemCode: input.itemCode,
        itemName: input.itemName,
        categoryId: category.id,
        itemType: input.itemType ?? 'STANDARD',
        basePrice: input.basePrice ?? 0,
        taxRate: input.taxRate ?? 0,
        unitType: input.unitType ?? 'EA',
        displayOrder: input.displayOrder ?? 0,
        searchKeywords: input.searchKeywords,
      },
    });
    return normalizeMenuItem(row);
  }

  /**
   * 한국어: 기존 메뉴 항목 정보를 부분 업데이트한다.
   *   undefined가 아닌 필드만 실제로 업데이트 대상에 포함된다 (부분 수정 패턴).
   *
   * Tiếng Việt: Cập nhật một phần thông tin mục menu hiện tại.
   *   Chỉ các trường không phải undefined mới được đưa vào đối tượng cập nhật (pattern cập nhật một phần).
   */
  async update(id: string, input: UpdateMenuItemInput, user: JwtPayload) {
    const menuItem = await this.ensureAccessibleMenuItem(id, user);
    await this.ensureCapabilityAndPermission(user, menuItem.brandHQId, 'brand.catalog.write');

    if (input.categoryId) {
      const category = await this.ensureAccessibleCategory(input.categoryId, user);
      if (category.brandHQId !== menuItem.brandHQId) {
        throw new DomainError({ code: 'MENU_CATEGORY_BRAND_MISMATCH', details: { reason: 'Menu category must belong to the same brand' } });
      }
    }

    const row = await this.prisma.brandMenuItem.update({
      where: { id },
      data: {
        ...(input.itemName !== undefined && { itemName: input.itemName }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.itemType !== undefined && { itemType: input.itemType }),
        ...(input.basePrice !== undefined && { basePrice: input.basePrice }),
        ...(input.taxRate !== undefined && { taxRate: input.taxRate }),
        ...(input.unitType !== undefined && { unitType: input.unitType }),
        ...(input.isSoldOut !== undefined && { isSoldOut: input.isSoldOut }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.searchKeywords !== undefined && { searchKeywords: input.searchKeywords }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
    return normalizeMenuItem(row);
  }

  /**
   * 한국어: 메뉴 항목을 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm mục menu. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user: JwtPayload) {
    const menuItem = await this.ensureAccessibleMenuItem(id, user);
    await this.ensureCapabilityAndPermission(user, menuItem.brandHQId, 'brand.catalog.write');

    await this.prisma.brandMenuItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
