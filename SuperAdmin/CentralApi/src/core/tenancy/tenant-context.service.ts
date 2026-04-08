/**
 * 한국어: TenantContextService — 인증된 사용자의 tenantContext 를 DB 에서 재계산하는 서버 권위 경로.
 *   JwtStrategy.validate() 가 매 요청마다 호출하여 JWT 내 tenantContext 값을 무시/덮어쓴다.
 *   결과는 Redis 에 60초 캐시하여 hot path 오버헤드를 낮춘다.
 *
 *   계산 규칙 (4축):
 *     - SUPER_ADMIN          → undefined (platform-wide)
 *     - DISTRIBUTOR_USER     → { distributorId }
 *     - BRAND_ADMIN          → { distributorId, brandHQId }  (distributor 는 brand.distributorId 로 조상 채움)
 *     - CORPORATE_ADMIN      → { corporateId }
 *
 *   row-level filter 는 detectScope() 가 가장 좁은 축 하나만 선택하여 사용하므로
 *   distributor 조상을 같이 실어도 안전하다 (예: BrandAdmin 의 scope 는 'brand' 로 결정).
 *
 * Tiếng Việt: Dịch vụ tính lại tenantContext từ DB mỗi request (server-authoritative path).
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import type { AuthUserType } from '@core/auth/constants/user-types.constant';
import { CacheService } from '@core/cache/cache.service';
import { CachePolicies } from '@core/cache/cache-policies';

export interface TenantContext {
  distributorId?: string;
  brandHQId?: string;
  branchId?: string;
  corporateId?: string;
}

@Injectable()
export class TenantContextService {
  private readonly logger = new Logger(TenantContextService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * 한국어: 캐시된 tenantContext 를 조회하고, 없으면 DB 에서 재계산하여 캐시한다.
   *   undefined 를 반환하면 platform-wide (SUPER_ADMIN).
   */
  async resolve(userType: AuthUserType, userId: string): Promise<TenantContext | undefined> {
    const descriptor = CachePolicies.tenantContext(userType, userId);
    const cached = await this.cache.getJson<TenantContext | Record<string, never>>(descriptor.key);
    if (cached !== null) {
      return isNonEmptyTenantContext(cached) ? cached : undefined;
    }

    const fresh = await this.loadFromDb(userType, userId);
    // 캐시에는 platform-wide(undefined) 도 빈 객체로 저장해 hot path 를 피한다.
    await this.cache.setJson(descriptor.key, fresh ?? {}, descriptor.ttlSeconds);
    return fresh;
  }

  /**
   * 한국어: tenantContext 캐시를 무효화한다. 계정 권한 변경 / 소속 이전 시 호출.
   */
  async invalidate(userType: AuthUserType, userId: string): Promise<void> {
    await this.cache.del(CachePolicies.tenantContext(userType, userId).key);
  }

  private async loadFromDb(userType: AuthUserType, userId: string): Promise<TenantContext | undefined> {
    switch (userType) {
      case 'SUPER_ADMIN':
        return undefined;

      case 'DISTRIBUTOR_USER': {
        const row = await this.prisma.distributorUser.findFirst({
          where: { id: userId, deletedAt: null, status: 'ACTIVE' },
          select: { distributorId: true },
        });
        if (!row) return undefined;
        return { distributorId: row.distributorId };
      }

      case 'BRAND_ADMIN': {
        const row = await this.prisma.brandAdminUser.findFirst({
          where: { id: userId, deletedAt: null, status: 'ACTIVE' },
          select: {
            brandHQId: true,
            brand: { select: { distributorId: true } },
          },
        });
        if (!row) return undefined;
        return {
          brandHQId: row.brandHQId,
          ...(row.brand?.distributorId ? { distributorId: row.brand.distributorId } : {}),
        };
      }

      case 'CORPORATE_ADMIN': {
        const row = await this.prisma.corporateAdminUser.findFirst({
          where: { id: userId, deletedAt: null, status: 'ACTIVE' },
          select: { corporateId: true },
        });
        if (!row) return undefined;
        return { corporateId: row.corporateId };
      }

      default:
        return undefined;
    }
  }
}

function isNonEmptyTenantContext(
  value: TenantContext | Record<string, never>,
): value is TenantContext {
  const ctx = value as TenantContext;
  return !!(ctx.distributorId || ctx.brandHQId || ctx.branchId || ctx.corporateId);
}
