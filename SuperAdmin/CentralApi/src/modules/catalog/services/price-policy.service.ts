/**
 * 한국어: 가격 정책(PricePolicy) 서비스.
 *   브랜드 본사(BrandHQ)의 가격 정책 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 PricePolicy 테이블에 접근한다.
 *   정책은 effectiveFrom 기준 내림차순으로 정렬된다.
 *
 * Tiếng Việt: Service Chính sách Giá (PricePolicy).
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD chính sách giá của trụ sở thương hiệu (BrandHQ).
 *   Truy cập bảng PricePolicy trong PostgreSQL thông qua Prisma ORM.
 *   Chính sách được sắp xếp theo effectiveFrom giảm dần.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';
import {
  brandScopeWhere,
  combineWhere,
  pricePolicyScopeWhere,
} from '../../../common/tenant/tenant-scope';

@Injectable()
export class PricePolicyService {
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

  private async ensureAccessiblePolicy(id: string, user?: JwtPayload) {
    const policy = await this.prisma.pricePolicy.findFirst({
      where: combineWhere<Prisma.PricePolicyWhereInput>(
        { id, deletedAt: null },
        pricePolicyScopeWhere(user),
      ),
    });

    if (!policy) {
      throw new ForbiddenException('Price policy is outside caller scope');
    }

    return policy;
  }

  /**
   * 한국어: 특정 브랜드의 가격 정책 목록을 시작일(effectiveFrom) 내림차순으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách chính sách giá của thương hiệu cụ thể, sắp xếp theo effectiveFrom giảm dần.
   */
  async findByBrand(brandHQId: string, skip: number, take: number, user?: JwtPayload) {
    return this.prisma.pricePolicy.findMany({
      where: combineWhere<Prisma.PricePolicyWhereInput>(
        { brandHQId, deletedAt: null },
        pricePolicyScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * 한국어: ID로 가격 정책을 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn chính sách giá theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.pricePolicy.findFirst({
      where: combineWhere<Prisma.PricePolicyWhereInput>(
        { id, deletedAt: null },
        pricePolicyScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 새 가격 정책을 생성한다.
   *   ruleJson이 미지정이면 빈 객체({})를 기본값으로 사용한다.
   *
   * Tiếng Việt: Tạo chính sách giá mới.
   *   Nếu ruleJson không được chỉ định, sử dụng đối tượng rỗng ({}) làm giá trị mặc định.
   */
  async create(data: {
    brandHQId: string;
    policyCode: string;
    policyName: string;
    policyType: string;
    ruleJson?: object;
    effectiveFrom: Date;
    effectiveTo?: Date;
  }, user?: JwtPayload) {
    const brand = await this.ensureAccessibleBrand(data.brandHQId, user);

    return this.prisma.pricePolicy.create({
      data: {
        brandHQId: brand.id,
        policyCode: data.policyCode,
        policyName: data.policyName,
        policyType: data.policyType,
        // 한국어: 규칙 JSON 미지정 시 빈 객체 기본값 적용
        // Tiếng Việt: Áp dụng đối tượng rỗng mặc định nếu JSON quy tắc không được chỉ định
        ruleJson: data.ruleJson ?? {},
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
      },
    });
  }

  /**
   * 한국어: 가격 정책을 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm chính sách giá. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    await this.ensureAccessiblePolicy(id, user);

    await this.prisma.pricePolicy.update({ where: { id }, data: { deletedAt: new Date() } });
    return true;
  }
}
