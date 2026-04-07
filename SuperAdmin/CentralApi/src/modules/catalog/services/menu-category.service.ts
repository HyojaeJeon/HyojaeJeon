/**
 * 한국어: 메뉴 카테고리 서비스.
 *   브랜드 본사(BrandHQ)의 메뉴 카테고리 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 BrandMenuCategory 테이블에 접근한다.
 *   카테고리는 displayOrder 기준 오름차순으로 정렬된다.
 *
 * Tiếng Việt: Service Danh mục Menu.
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD danh mục menu của trụ sở thương hiệu (BrandHQ).
 *   Truy cập bảng BrandMenuCategory trong PostgreSQL thông qua Prisma ORM.
 *   Danh mục được sắp xếp theo displayOrder tăng dần.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';
import {
  brandScopeWhere,
  combineWhere,
  menuCategoryScopeWhere,
} from '../../../common/tenant/tenant-scope';
import { CreateMenuCategoryInput, UpdateMenuCategoryInput } from '../dto/create-menu-category.input';

@Injectable()
export class MenuCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAccessibleBrand(brandHQId: string, user?: JwtPayload) {
    const brand = await this.prisma.brandProfile.findFirst({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { id: brandHQId, deletedAt: null },
        brandScopeWhere(user),
      ),
    });

    if (!brand) {
      throw new ForbiddenException('Brand is outside caller scope');
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
      throw new ForbiddenException('Menu category is outside caller scope');
    }

    return category;
  }

  /**
   * 한국어: 특정 브랜드의 메뉴 카테고리 목록을 displayOrder 오름차순으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách danh mục menu của thương hiệu cụ thể, sắp xếp theo displayOrder tăng dần.
   */
  async findByBrand(brandHQId: string, skip: number, take: number, user?: JwtPayload) {
    return this.prisma.brandMenuCategory.findMany({
      where: combineWhere<Prisma.BrandMenuCategoryWhereInput>(
        { brandHQId, deletedAt: null },
        menuCategoryScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * 한국어: ID로 메뉴 카테고리를 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn danh mục menu theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.brandMenuCategory.findFirst({
      where: combineWhere<Prisma.BrandMenuCategoryWhereInput>(
        { id, deletedAt: null },
        menuCategoryScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 새 메뉴 카테고리를 생성한다.
   *   displayOrder가 미지정이면 0을 기본값으로 사용한다.
   *
   * Tiếng Việt: Tạo danh mục menu mới.
   *   Nếu displayOrder không được chỉ định, sử dụng 0 làm giá trị mặc định.
   */
  async create(input: CreateMenuCategoryInput, user?: JwtPayload) {
    const brand = await this.ensureAccessibleBrand(input.brandHQId, user);

    if (input.parentCategoryId) {
      const parent = await this.ensureAccessibleCategory(input.parentCategoryId, user);
      if (parent.brandHQId !== brand.id) {
        throw new ForbiddenException('Parent category must belong to the same brand');
      }
    }

    return this.prisma.brandMenuCategory.create({
      data: {
        brandHQId: brand.id,
        categoryCode: input.categoryCode,
        categoryName: input.categoryName,
        parentCategoryId: input.parentCategoryId,
        displayOrder: input.displayOrder ?? 0,
      },
    });
  }

  /**
   * 한국어: 기존 메뉴 카테고리 정보를 부분 업데이트한다.
   *   undefined가 아닌 필드만 실제로 업데이트 대상에 포함된다 (부분 수정 패턴).
   *
   * Tiếng Việt: Cập nhật một phần thông tin danh mục menu hiện tại.
   *   Chỉ các trường không phải undefined mới được đưa vào đối tượng cập nhật (pattern cập nhật một phần).
   */
  async update(id: string, input: UpdateMenuCategoryInput, user?: JwtPayload) {
    const category = await this.ensureAccessibleCategory(id, user);

    if (input.parentCategoryId) {
      const parent = await this.ensureAccessibleCategory(input.parentCategoryId, user);
      if (parent.brandHQId !== category.brandHQId) {
        throw new ForbiddenException('Parent category must belong to the same brand');
      }
    }

    return this.prisma.brandMenuCategory.update({
      where: { id },
      data: {
        ...(input.categoryName !== undefined && { categoryName: input.categoryName }),
        ...(input.parentCategoryId !== undefined && { parentCategoryId: input.parentCategoryId }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  }

  /**
   * 한국어: 메뉴 카테고리를 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm danh mục menu. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    await this.ensureAccessibleCategory(id, user);

    await this.prisma.brandMenuCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
