/**
 * 한국어: 브랜드(Brand) 서비스.
 *   브랜드 프로필 엔티티의 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 BrandProfile 테이블에 접근한다.
 *   대리점(Distributor) 소속별 필터링 조회를 지원한다.
 *
 * Tiếng Việt: Service Thương hiệu (Brand).
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD của entity hồ sơ thương hiệu.
 *   Truy cập bảng BrandProfile trong PostgreSQL thông qua Prisma ORM.
 *   Hỗ trợ truy vấn lọc theo đại lý (Distributor) sở thuộc.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';
import {
  brandScopeWhere,
  combineWhere,
  distributorScopeWhere,
} from '../../../common/tenant/tenant-scope';
import { CreateBrandInput } from '../dto/create-brand.input';
import { UpdateBrandInput } from '../dto/update-brand.input';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAccessibleBrand(id: string, user?: JwtPayload) {
    const brand = await this.prisma.brandProfile.findFirst({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { id, deletedAt: null },
        brandScopeWhere(user),
      ),
    });

    if (!brand) {
      throw new ForbiddenException('Brand is outside caller scope');
    }

    return brand;
  }

  private async ensureAccessibleDistributor(id: string, user?: JwtPayload) {
    const distributor = await this.prisma.distributorProfile.findFirst({
      where: combineWhere<Prisma.DistributorProfileWhereInput>(
        { id, deletedAt: null },
        distributorScopeWhere(user),
      ),
    });

    if (!distributor) {
      throw new ForbiddenException('Distributor is outside caller scope');
    }

    return distributor;
  }

  /**
   * 한국어: 전체 브랜드 목록을 페이지네이션으로 조회한다.
   *   소프트 삭제된 레코드는 제외하며, 생성일 기준 내림차순 정렬한다.
   *
   * Tiếng Việt: Truy vấn danh sách tất cả thương hiệu với phân trang.
   *   Loại trừ bản ghi đã bị xóa mềm, sắp xếp theo ngày tạo giảm dần.
   */
  async findAll(skip: number, take: number, user?: JwtPayload) {
    return this.prisma.brandProfile.findMany({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { deletedAt: null },
        brandScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: ID로 브랜드를 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn thương hiệu theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.brandProfile.findFirst({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { id, deletedAt: null },
        brandScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 특정 대리점에 소속된 브랜드 목록을 페이지네이션으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách thương hiệu thuộc đại lý cụ thể với phân trang.
   */
  async findByDistributor(
    distributorId: string,
    skip: number,
    take: number,
    user?: JwtPayload,
  ) {
    return this.prisma.brandProfile.findMany({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { distributorId, deletedAt: null },
        brandScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 새 브랜드를 생성한다.
   * Tiếng Việt: Tạo thương hiệu mới.
   */
  async create(input: CreateBrandInput, user?: JwtPayload) {
    const distributor = await this.ensureAccessibleDistributor(input.distributorId, user);

    return this.prisma.brandProfile.create({
      data: {
        distributorId: distributor.id,
        brandCode: input.brandCode,
        brandName: input.brandName,
        countryCode: input.countryCode,
        defaultLanguageCode: input.defaultLanguageCode,
        businessNumber: input.businessNumber,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      },
    });
  }

  /**
   * 한국어: 기존 브랜드 정보를 부분 업데이트한다.
   *   undefined가 아닌 필드만 실제로 업데이트 대상에 포함된다 (부분 수정 패턴).
   *
   * Tiếng Việt: Cập nhật một phần thông tin thương hiệu hiện tại.
   *   Chỉ các trường không phải undefined mới được đưa vào đối tượng cập nhật (pattern cập nhật một phần).
   */
  async update(id: string, input: UpdateBrandInput, user?: JwtPayload) {
    await this.ensureAccessibleBrand(id, user);

    return this.prisma.brandProfile.update({
      where: { id },
      data: {
        ...(input.brandName !== undefined && { brandName: input.brandName }),
        ...(input.countryCode !== undefined && { countryCode: input.countryCode }),
        ...(input.defaultLanguageCode !== undefined && { defaultLanguageCode: input.defaultLanguageCode }),
        ...(input.businessNumber !== undefined && { businessNumber: input.businessNumber }),
        ...(input.contactName !== undefined && { contactName: input.contactName }),
        ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
        ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });
  }

  /**
   * 한국어: 브랜드를 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm thương hiệu. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    await this.ensureAccessibleBrand(id, user);

    await this.prisma.brandProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
