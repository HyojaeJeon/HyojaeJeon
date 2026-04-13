/**
 * License 서비스
 * 한국어: 플랫폼 라이선스의 CRUD를 담당한다. scope-polymorphic 패턴 적용
 *         (scopeType + scopeId로 Distributor/BrandHQ/Branch 등에 공통 적용).
 *         모든 조회에 soft-delete 필터(deletedAt: null)를 적용한다.
 * Tiếng Việt: Phụ trách CRUD license nền tảng. Áp dụng mẫu scope-polymorphic
 *             (scopeType + scopeId áp dụng chung cho Distributor/BrandHQ/Branch v.v.).
 *             Tất cả truy vấn áp dụng bộ lọc soft-delete (deletedAt: null).
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { AuditService } from '@core/audit/Audit.service';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { DomainError } from '@core/errors/DomainError';
import { ErrorCode } from '@core/errors/errorCodes';

export interface LicenseActor {
  userType: string;
  userId: string;
}

@Injectable()
export class LicenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: CacheService,
  ) {}

  /**
   * 한국어: 특정 스코프(scopeType + scopeId)의 라이선스 목록 조회. soft-delete 필터 적용.
   * Tiếng Việt: Truy vấn danh sách license của scope cụ thể. Áp dụng bộ lọc soft-delete.
   */
  async findByScope(scopeType: string, scopeId: string) {
    return this.prisma.platformLicense.findMany({
      where: { scopeType, scopeId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 한국어: 라이선스 단건 조회 (ID 기준). soft-delete 필터 적용 — deletedAt이 null인 레코드만 반환.
   * Tiếng Việt: Truy vấn đơn lẻ license (theo ID). Áp dụng bộ lọc soft-delete — chỉ trả về bản ghi deletedAt là null.
   */
  async findById(id: string) {
    return this.prisma.platformLicense.findFirst({ where: { id, deletedAt: null } });
  }

  /**
   * 한국어: 전체 라이선스 페이지네이션 조회. soft-delete 필터 적용.
   * Tiếng Việt: Truy vấn phân trang tất cả license. Áp dụng bộ lọc soft-delete.
   */
  async findAll(skip: number, take: number) {
    const where = { deletedAt: null };
    const [data, totalCount] = await Promise.all([
      this.prisma.platformLicense.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.platformLicense.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * 한국어: scopeType 기준 라이선스 페이지네이션 조회. soft-delete 필터 적용.
   * Tiếng Việt: Truy vấn phân trang license theo scopeType. Áp dụng bộ lọc soft-delete.
   */
  async findByScopeType(scopeType: string, skip: number, take: number) {
    return this.prisma.platformLicense.findMany({
      where: { scopeType, deletedAt: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ───────────────────────────────────────── Enforcement

  /**
   * 한국어: 특정 브랜드에 할당된 활성 라이선스 조회. status=ACTIVE, 유효기간 내, soft-delete 필터.
   * Tiếng Việt: Truy vấn license đang hoạt động gán cho BrandHQ cụ thể.
   */
  async findActiveLicenseForBrand(brandHqId: string) {
    const now = new Date();
    return this.prisma.platformLicense.findFirst({
      where: {
        scopeType: 'BRAND_HQ',
        scopeId: brandHqId,
        status: 'ACTIVE',
        deletedAt: null,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
    });
  }

  /**
   * 한국어: 지점 생성 전 maxBranchCount 제한 체크. 0은 무제한.
   * Tiếng Việt: Kiểm tra giới hạn maxBranchCount trước khi tạo chi nhánh. 0 = không giới hạn.
   */
  async enforceBranchLimit(brandHqId: string) {
    const license = await this.findActiveLicenseForBrand(brandHqId);
    if (!license || license.maxBranchCount === 0) return;

    const currentCount = await this.prisma.branch.count({
      where: { brandHQId: brandHqId, deletedAt: null },
    });
    if (currentCount >= license.maxBranchCount) {
      throw new DomainError({
        code: ErrorCode.LICENSE_BRANCH_LIMIT_EXCEEDED,
        params: { current: currentCount, max: license.maxBranchCount },
      });
    }
  }

  /**
   * 한국어: 터미널 등록 전 maxTerminalCount 제한 체크. 0은 무제한.
   * Tiếng Việt: Kiểm tra giới hạn maxTerminalCount trước khi đăng ký terminal. 0 = không giới hạn.
   */
  async enforceTerminalLimit(brandHqId: string) {
    const license = await this.findActiveLicenseForBrand(brandHqId);
    if (!license || license.maxTerminalCount === 0) return;

    const currentCount = await this.prisma.edgePosTerminal.count({
      where: {
        branch: { brandHQId: brandHqId },
        deletedAt: null,
      },
    });
    if (currentCount >= license.maxTerminalCount) {
      throw new DomainError({
        code: ErrorCode.LICENSE_TERMINAL_LIMIT_EXCEEDED,
        params: { current: currentCount, max: license.maxTerminalCount },
      });
    }
  }

  // ───────────────────────────────────────── Mutation API

  /**
   * 한국어: 새 라이선스 생성. maxBranchCount/maxTerminalCount 미지정 시 기본값 0.
   *         licensePayloadJson 미지정 시 빈 객체 {}로 초기화한다.
   * Tiếng Việt: Tạo license mới. maxBranchCount/maxTerminalCount mặc định 0 nếu không chỉ định.
   *             licensePayloadJson khởi tạo bằng đối tượng rỗng {} nếu không chỉ định.
   */
  /**
   * 한국어: licenseCode 자동생성 — LIC-{scopeType약어}-{YYYYMMDD}-{4자리 랜덤}
   * Tiếng Việt: Tự động sinh licenseCode — LIC-{viết tắt scopeType}-{YYYYMMDD}-{4 ký tự ngẫu nhiên}
   */
  private generateLicenseCode(scopeType: string): string {
    const scopeAbbr: Record<string, string> = {
      GLOBAL: 'GLB',
      REGIONAL_DISTRIBUTOR: 'RD',
      BRAND_HQ: 'BHQ',
      BRANCH: 'BR',
      EDGE_POS: 'EP',
    };
    const abbr = scopeAbbr[scopeType] ?? scopeType.slice(0, 3).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `LIC-${abbr}-${date}-${rand}`;
  }

  async create(
    data: {
      scopeType: string;
      scopeId: string;
      licenseType: string;
      effectiveFrom: Date;
      effectiveTo?: Date;
      maxBranchCount?: number;
      maxTerminalCount?: number;
      allowedCountryCode?: string;
      licensePayloadJson?: object;
    },
    actor?: LicenseActor,
  ) {
    const licenseCode = this.generateLicenseCode(data.scopeType);
    const created = await this.prisma.platformLicense.create({
      data: {
        scopeType: data.scopeType,
        scopeId: data.scopeId,
        licenseCode,
        licenseType: data.licenseType,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        maxBranchCount: data.maxBranchCount ?? 0,
        maxTerminalCount: data.maxTerminalCount ?? 0,
        allowedCountryCode: data.allowedCountryCode,
        licensePayloadJson: data.licensePayloadJson ?? {},
      },
    });
    await this.audit.log({
      actorType: actor?.userType ?? 'SYSTEM',
      actorId: actor?.userId,
      actionType: 'LICENSE_CREATE',
      targetType: 'PlatformLicense',
      targetId: created.id,
      afterDataJson: created as unknown as Record<string, unknown>,
    });
    return created;
  }

  /**
   * 한국어: 라이선스 상태 변경 (예: 'Active' → 'Suspended').
   * Tiếng Việt: Thay đổi trạng thái license (ví dụ: 'Active' → 'Suspended').
   */
  async updateStatus(id: string, status: string, actor?: LicenseActor) {
    const before = await this.prisma.platformLicense.findUnique({
      where: { id },
      include: { entitlements: { select: { brandHqId: true } } },
    });
    const updated = await this.prisma.platformLicense.update({ where: { id }, data: { status } });
    await this.audit.log({
      actorType: actor?.userType ?? 'SYSTEM',
      actorId: actor?.userId,
      actionType: 'LICENSE_UPDATE_STATUS',
      targetType: 'PlatformLicense',
      targetId: id,
      beforeDataJson: before as unknown as Record<string, unknown>,
      afterDataJson: updated as unknown as Record<string, unknown>,
    });

    // 연결된 entitlement 캐시 무효화
    const brandHqIds = new Set(before?.entitlements?.map((e) => e.brandHqId) ?? []);
    await Promise.all(
      [...brandHqIds].map((bId) => this.cache.del(CachePolicies.entitlementBrand(bId).key)),
    );

    return updated;
  }

  /**
   * 한국어: 논리적 삭제 — deletedAt 타임스탬프를 기록하여 레코드를 비활성화한다.
   * Tiếng Việt: Xóa logic — ghi timestamp deletedAt để vô hiệu hóa bản ghi.
   */
  async softDelete(id: string, actor?: LicenseActor) {
    const before = await this.prisma.platformLicense.findUnique({ where: { id } });
    await this.prisma.platformLicense.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({
      actorType: actor?.userType ?? 'System',
      actorId: actor?.userId,
      actionType: 'LICENSE_DELETE',
      targetType: 'PlatformLicense',
      targetId: id,
      beforeDataJson: before as unknown as Record<string, unknown>,
    });
    return true;
  }
}
