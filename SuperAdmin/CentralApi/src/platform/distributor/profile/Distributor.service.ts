/**
 * 한국어: 대리점(Distributor) 서비스.
 *   대리점/유통사 엔티티의 CRUD 비즈니스 로직을 담당한다.
 *   Prisma ORM을 통해 PostgreSQL의 DistributorProfile 테이블에 접근한다.
 *   소프트 삭제(deletedAt) 패턴을 사용하여 데이터 보존성을 보장한다.
 *
 * Tiếng Việt: Service Đại lý (Distributor).
 *   Chịu trách nhiệm cho logic nghiệp vụ CRUD của entity đại lý/nhà phân phối.
 *   Truy cập bảng DistributorProfile trong PostgreSQL thông qua Prisma ORM.
 *   Sử dụng pattern xóa mềm (deletedAt) để đảm bảo tính bảo toàn dữ liệu.
 */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/Prisma.service';
import { JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { combineWhere, distributorScopeWhere } from '@core/tenancy/tenantScope';
import { CreateDistributorInput } from './dto/CreateDistributor.input';
import { UpdateDistributorInput } from './dto/UpdateDistributor.input';
import { DomainError } from '@core/errors/DomainError';

@Injectable()
export class DistributorService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureAccessibleDistributor(id: string, user?: JwtPayload) {
    const distributor = await this.prisma.distributorProfile.findFirst({
      where: combineWhere<Prisma.DistributorProfileWhereInput>(
        { id, deletedAt: null },
        distributorScopeWhere(user),
      ),
    });

    if (!distributor) {
      throw new DomainError({ code: 'CROSS_TENANT_ACCESS_DENIED', details: { reason: 'Distributor is outside caller scope' } });
    }

    return distributor;
  }

  /**
   * 한국어: 전체 대리점 목록을 페이지네이션으로 조회한다.
   *   소프트 삭제된 레코드는 제외하며, 생성일 기준 내림차순 정렬한다.
   *
   * Tiếng Việt: Truy vấn danh sách tất cả đại lý với phân trang.
   *   Loại trừ bản ghi đã bị xóa mềm, sắp xếp theo ngày tạo giảm dần.
   */
  async findAll(skip: number, take: number, user?: JwtPayload) {
    const where = combineWhere<Prisma.DistributorProfileWhereInput>(
      { deletedAt: null },
      distributorScopeWhere(user),
    );
    const [data, totalCount] = await Promise.all([
      this.prisma.distributorProfile.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.distributorProfile.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * 한국어: ID로 대리점을 조회한다. 소프트 삭제된 레코드는 제외한다.
   * Tiếng Việt: Truy vấn đại lý theo ID. Loại trừ bản ghi đã bị xóa mềm.
   */
  async findById(id: string, user?: JwtPayload) {
    return this.prisma.distributorProfile.findFirst({
      where: combineWhere<Prisma.DistributorProfileWhereInput>(
        { id, deletedAt: null },
        distributorScopeWhere(user),
      ),
    });
  }

  /**
   * 한국어: 새 대리점을 생성한다.
   *   defaultLanguageCode가 미지정이면 'ko'(한국어)를 기본값으로 사용한다.
   *
   * Tiếng Việt: Tạo đại lý mới.
   *   Nếu defaultLanguageCode không được chỉ định, sử dụng 'ko' (tiếng Hàn) làm giá trị mặc định.
   */
  async create(input: CreateDistributorInput) {
    return this.prisma.distributorProfile.create({
      data: {
        distributorCode: input.distributorCode,
        companyName: input.companyName,
        legalName: input.legalName,
        businessNumber: input.businessNumber,
        countryCode: input.countryCode,
        territoryName: input.territoryName,
        // 한국어: 기본 언어 미지정 시 'ko' 사용
        // Tiếng Việt: Sử dụng 'ko' nếu ngôn ngữ mặc định không được chỉ định
        defaultLanguageCode: input.defaultLanguageCode ?? 'ko',
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      },
    });
  }

  /**
   * 한국어: 기존 대리점 정보를 부분 업데이트한다.
   *   undefined가 아닌 필드만 실제로 업데이트 대상에 포함된다 (부분 수정 패턴).
   *
   * Tiếng Việt: Cập nhật một phần thông tin đại lý hiện tại.
   *   Chỉ các trường không phải undefined mới được đưa vào đối tượng cập nhật (pattern cập nhật một phần).
   */
  async update(id: string, input: UpdateDistributorInput, user?: JwtPayload) {
    await this.ensureAccessibleDistributor(id, user);

    return this.prisma.distributorProfile.update({
      where: { id },
      data: {
        ...(input.companyName !== undefined && { companyName: input.companyName }),
        ...(input.legalName !== undefined && { legalName: input.legalName }),
        ...(input.businessNumber !== undefined && { businessNumber: input.businessNumber }),
        ...(input.countryCode !== undefined && { countryCode: input.countryCode }),
        ...(input.territoryName !== undefined && { territoryName: input.territoryName }),
        ...(input.defaultLanguageCode !== undefined && { defaultLanguageCode: input.defaultLanguageCode }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.contactName !== undefined && { contactName: input.contactName }),
        ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
        ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone }),
      },
    });
  }

  /**
   * 한국어: 대리점을 소프트 삭제한다. deletedAt 필드를 현재 시각으로 설정한다.
   * Tiếng Việt: Xóa mềm đại lý. Đặt trường deletedAt thành thời gian hiện tại.
   */
  async softDelete(id: string, user?: JwtPayload) {
    await this.ensureAccessibleDistributor(id, user);

    await this.prisma.distributorProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
