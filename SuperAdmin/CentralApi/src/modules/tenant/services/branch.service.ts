/**
 * 한국어: 지점(Branch) 서비스.
 *   지점 엔티티의 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 Branch 테이블에 접근한다.
 *   브랜드 본사(BrandHQ) 소속별 필터링 조회를 지원한다.
 *
 * Tiếng Việt: Service Chi nhánh (Branch).
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD của entity chi nhánh.
 *   Truy cập bảng Branch trong PostgreSQL thông qua Prisma ORM.
 *   Hỗ trợ truy vấn lọc theo trụ sở thương hiệu (BrandHQ) sở thuộc.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';
import {
  branchScopeWhere,
  brandScopeWhere,
  combineWhere,
} from '../../../common/tenant/tenant-scope';
import { CreateBranchInput } from '../dto/create-branch.input';
import { UpdateBranchInput } from '../dto/update-branch.input';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAccessibleBranch(id: string, user?: JwtPayload) {
    const branch = await this.prisma.branch.findFirst({
      where: combineWhere<Prisma.BranchWhereInput>(
        { id, deletedAt: null },
        branchScopeWhere(user),
      ),
    });

    if (!branch) {
      throw new ForbiddenException('Branch is outside caller scope');
    }

    return branch;
  }

  private async ensureAccessibleBrand(brandHQId: string, distributorId: string, user?: JwtPayload) {
    const brand = await this.prisma.brandProfile.findFirst({
      where: combineWhere<Prisma.BrandProfileWhereInput>(
        { id: brandHQId, distributorId, deletedAt: null },
        brandScopeWhere(user),
      ),
    });

    if (!brand) {
      throw new ForbiddenException('Brand is outside caller scope');
    }

    return brand;
  }

  /**
   * 한국어: 전체 지점 목록을 페이지네이션으로 조회한다.
   *   소프트 삭제된 레코드는 제외하며, 생성일 기준 내림차순 정렬한다.
   *
   * Tiếng Việt: Truy vấn danh sách tất cả chi nhánh với phân trang.
   *   Loại trừ bản ghi đã bị xóa mềm, sắp xếp theo ngày tạo giảm dần.
   */
  async findAll(skip: number, take: number, user?: JwtPayload) {
    return this.prisma.branch.findMany({
      where: combineWhere<Prisma.BranchWhereInput>(
        { deletedAt: null },
        branchScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: ID로 지점을 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn chi nhánh theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.branch.findFirst({
      where: combineWhere<Prisma.BranchWhereInput>(
        { id, deletedAt: null },
        branchScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 특정 브랜드 본사에 소속된 지점 목록을 페이지네이션으로 조회한다.
   * Tiếng Việt: Truy vấn danh sách chi nhánh thuộc trụ sở thương hiệu cụ thể với phân trang.
   */
  async findByBrand(brandHQId: string, skip: number, take: number, user?: JwtPayload) {
    return this.prisma.branch.findMany({
      where: combineWhere<Prisma.BranchWhereInput>(
        { brandHQId, deletedAt: null },
        branchScopeWhere(user),
      ),
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 새 지점을 생성한다.
   *   branchType이 미지정이면 'Dine-In'을 기본값으로 사용한다.
   *
   * Tiếng Việt: Tạo chi nhánh mới.
   *   Nếu branchType không được chỉ định, sử dụng 'Dine-In' làm giá trị mặc định.
   */
  async create(input: CreateBranchInput, user?: JwtPayload) {
    const brand = await this.ensureAccessibleBrand(input.brandHQId, input.distributorId, user);

    return this.prisma.branch.create({
      data: {
        brandHQId: brand.id,
        distributorId: brand.distributorId,
        branchCode: input.branchCode,
        branchName: input.branchName,
        // 한국어: 지점 유형 미지정 시 'Dine-In'(매장 식사) 기본값 적용
        // Tiếng Việt: Áp dụng mặc định 'Dine-In' (ăn tại chỗ) nếu loại chi nhánh không được chỉ định
        branchType: input.branchType ?? 'Dine-In',
        countryCode: input.countryCode,
        regionCode: input.regionCode,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        postalCode: input.postalCode,
        timeZoneCode: input.timeZoneCode,
        defaultLanguageCode: input.defaultLanguageCode,
      },
    });
  }

  /**
   * 한국어: 기존 지점 정보를 부분 업데이트한다.
   *   undefined가 아닌 필드만 실제로 업데이트 대상에 포함된다 (부분 수정 패턴).
   *
   * Tiếng Việt: Cập nhật một phần thông tin chi nhánh hiện tại.
   *   Chỉ các trường không phải undefined mới được đưa vào đối tượng cập nhật (pattern cập nhật một phần).
   */
  async update(id: string, input: UpdateBranchInput, user?: JwtPayload) {
    await this.ensureAccessibleBranch(id, user);

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...(input.branchName !== undefined && { branchName: input.branchName }),
        ...(input.branchType !== undefined && { branchType: input.branchType }),
        ...(input.countryCode !== undefined && { countryCode: input.countryCode }),
        ...(input.regionCode !== undefined && { regionCode: input.regionCode }),
        ...(input.addressLine1 !== undefined && { addressLine1: input.addressLine1 }),
        ...(input.addressLine2 !== undefined && { addressLine2: input.addressLine2 }),
        ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
        ...(input.timeZoneCode !== undefined && { timeZoneCode: input.timeZoneCode }),
        ...(input.defaultLanguageCode !== undefined && { defaultLanguageCode: input.defaultLanguageCode }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.openingDate !== undefined && { openingDate: input.openingDate }),
        ...(input.closingDate !== undefined && { closingDate: input.closingDate }),
      },
    });
  }

  /**
   * 한국어: 지점을 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm chi nhánh. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    await this.ensureAccessibleBranch(id, user);

    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
