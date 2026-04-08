/**
 * 한국어: 프로모션(Promotion) 서비스.
 *   브랜드 본사(BrandHQ)의 프로모션 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 Promotion 테이블에 접근한다.
 *   프로모션은 startAt 기준 내림차순으로 정렬된다.
 *
 * Tiếng Việt: Service Khuyến mãi (Promotion).
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD khuyến mãi của trụ sở thương hiệu (BrandHQ).
 *   Truy cập bảng Promotion trong PostgreSQL thông qua Prisma ORM.
 *   Khuyến mãi được sắp xếp theo startAt giảm dần.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/prisma.service';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import {
  brandScopeWhere,
  combineWhere,
  promotionScopeWhere,
} from '@core/tenancy/tenant-scope';
import { PermissionService } from '@core/rbac/permission.service';
import { DomainError } from '@core/errors/domain-error';

@Injectable()
export class PromotionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permission: PermissionService,
  ) {}

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

  private async ensureAccessiblePromotion(id: string, user?: JwtPayload) {
    const promotion = await this.prisma.promotion.findFirst({
      where: combineWhere<Prisma.PromotionWhereInput>(
        { id, deletedAt: null },
        promotionScopeWhere(user),
      ),
    });

    if (!promotion) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Promotion is outside caller scope' } });
    }

    return promotion;
  }

  /**
   * 한국어: 특정 브랜드의 프로모션 목록을 시작일(startAt) 내림차순으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách khuyến mãi của thương hiệu cụ thể, sắp xếp theo startAt giảm dần.
   */
  async findByBrand(brandHQId: string, skip: number, take: number, user?: JwtPayload) {
    return this.prisma.promotion.findMany({
      where: combineWhere<Prisma.PromotionWhereInput>(
        { brandHQId, deletedAt: null },
        promotionScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { startAt: 'desc' },
    });
  }

  /**
   * 한국어: ID로 프로모션을 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn khuyến mãi theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.promotion.findFirst({
      where: combineWhere<Prisma.PromotionWhereInput>(
        { id, deletedAt: null },
        promotionScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 새 프로모션을 생성한다.
   *   ruleJson이 미지정이면 빈 객체({})를 기본값으로 사용한다.
   *
   * Tiếng Việt: Tạo khuyến mãi mới.
   *   Nếu ruleJson không được chỉ định, sử dụng đối tượng rỗng ({}) làm giá trị mặc định.
   */
  async create(data: {
    brandHQId: string;
    promotionCode: string;
    promotionName: string;
    promotionType: string;
    ruleJson?: object;
    startAt: Date;
    endAt?: Date;
  }, user?: JwtPayload) {
    const brand = await this.ensureAccessibleBrand(data.brandHQId, user);
    if (user) await this.permission.require(this.evalCtxFor(user, brand.id), 'brand.catalog.write');

    return this.prisma.promotion.create({
      data: {
        brandHQId: brand.id,
        promotionCode: data.promotionCode,
        promotionName: data.promotionName,
        promotionType: data.promotionType,
        // 한국어: 규칙 JSON 미지정 시 빈 객체 기본값 적용
        // Tiếng Việt: Áp dụng đối tượng rỗng mặc định nếu JSON quy tắc không được chỉ định
        ruleJson: data.ruleJson ?? {},
        startAt: data.startAt,
        endAt: data.endAt,
      },
    });
  }

  /**
   * 한국어: 프로모션을 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm khuyến mãi. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    const promotion = await this.ensureAccessiblePromotion(id, user);
    if (user) await this.permission.require(this.evalCtxFor(user, promotion.brandHQId), 'brand.catalog.write');

    await this.prisma.promotion.update({ where: { id }, data: { deletedAt: new Date() } });
    return true;
  }
}
