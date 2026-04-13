/**
 * 한국어: EntitlementService — BrandHQ capability 가드의 단일 원본.
 *
 *   - hasCapability(brandHqId, capability)        : boolean
 *   - requireCapability(ctx, capability)          : void | throw
 *   - getActiveCapabilities(brandHqId)            : Set<BrandHqCapability>
 *   - grant / suspend / resume / revoke           : 상태 전이 mutation
 *
 * 규칙 (기준서 §100):
 *   1. 가드는 resolver 가 아니라 service layer 에서 호출한다.
 *   2. SuperAdmin / RegionalDistributor 는 cross-tenant 지원을 위해 가드를 우회한다.
 *   3. Redis 캐시 TTL 30초. grant/revoke/suspend/resume 시 명시적으로 무효화한다.
 *   4. MealTicket merchant 의 조회 성격 API 는 이 service 호출 없이 허용된다.
 *      enrollment.isActive=true 전이 시에는 MEAL_TICKET capability 필수.
 */
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/Prisma.service';
import { AuditService } from '@core/audit/Audit.service';
import { DomainError } from '@core/errors/DomainError';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';

export type BrandHqCapability = 'POS' | 'MEAL_TICKET';
export type BrandHqEntitlementStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TRIAL'
  | 'EXPIRED'
  | 'REVOKED';

/**
 * 호출 context — capability 가드는 오직 brandHqId 만 본다.
 * SuperAdmin 의 cross-tenant 권한은
 * RBAC permission (`platform.entitlement.write` 등) 으로만 표현된다.
 */
export interface EntitlementCallerCtx {
  brandHqId?: string | null;
}

@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: CacheService,
  ) {}

  private async writeAudit(
    actionType: string,
    targetId: string,
    actor: { userType?: string; userId?: string },
    before: unknown,
    after: unknown,
  ) {
    await this.audit.log({
      actorType: actor.userType ?? 'SYSTEM',
      actorId: actor.userId,
      actionType,
      targetType: 'BrandHqEntitlement',
      targetId,
      beforeDataJson: (before as Record<string, unknown>) ?? undefined,
      afterDataJson: (after as Record<string, unknown>) ?? undefined,
    });
  }

  // ───────────────────────────────────────── Read API

  async hasCapability(
    brandHqId: string,
    capability: BrandHqCapability,
  ): Promise<boolean> {
    const set = await this.getActiveCapabilities(brandHqId);
    return set.has(capability);
  }

  /**
   * 가드 진입점. 도메인 service 메서드 첫 줄에서 호출.
   *
   *   await this.entitlement.requireCapability(ctx, 'MEAL_TICKET');
   */
  async requireCapability(
    ctx: EntitlementCallerCtx,
    capability: BrandHqCapability,
  ): Promise<void> {
    if (!ctx.brandHqId) {
      throw new DomainError({ code: 'CAPABILITY_REQUIRED', params: { capability,
        message: 'No BrandHQ scope on caller context' } });
    }
    const ok = await this.hasCapability(ctx.brandHqId, capability);
    if (!ok) {
      throw new DomainError({ code: 'CAPABILITY_REQUIRED', params: { capability,
        brandHqId: ctx.brandHqId } });
    }
  }

  /**
   * 활성 capability 집합. Redis 캐시 우선, 미스 시 DB 조회.
   * 만료(`expiresAt < now`)는 자동으로 EXPIRED 취급한다.
   */
  async getActiveCapabilities(
    brandHqId: string,
  ): Promise<Set<BrandHqCapability>> {
    const descriptor = CachePolicies.entitlementBrand(brandHqId);
    const cached = await this.cache.rememberJson(descriptor, async () => {
      const now = new Date();
      const rows = await this.prisma.brandHqEntitlement.findMany({
        where: {
          brandHqId,
          status: { in: ['ACTIVE', 'TRIAL'] },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        select: { capability: true, licenseId: true },
      });

      // 연결된 라이선스가 비활성이면 해당 entitlement 제외
      const licenseIds = rows
        .map((r) => r.licenseId)
        .filter((id): id is string => id != null);
      let activeLicenseIds: Set<string> | null = null;
      if (licenseIds.length > 0) {
        const activeLicenses = await this.prisma.platformLicense.findMany({
          where: {
            id: { in: licenseIds },
            status: 'ACTIVE',
            deletedAt: null,
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
          },
          select: { id: true },
        });
        activeLicenseIds = new Set(activeLicenses.map((l) => l.id));
      }

      return rows
        .filter((r) => !r.licenseId || activeLicenseIds?.has(r.licenseId))
        .map((r) => r.capability as BrandHqCapability);
    });

    return new Set(cached);
  }

  async invalidate(brandHqId: string): Promise<void> {
    await this.cache.del(CachePolicies.entitlementBrand(brandHqId).key);
  }

  // ───────────────────────────────────────── Mutation API

  async listForBrand(brandHqId: string) {
    return this.prisma.brandHqEntitlement.findMany({
      where: { brandHqId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async grant(input: {
    brandHqId: string;
    capability: BrandHqCapability;
    expiresAt?: Date | null;
    contractRef?: string | null;
    licenseId?: string | null;
    startAsTrial?: boolean;
    grantedBySuperAdminId: string;
    actorUserType?: string;
  }) {
    // 동일 BrandHq + capability 에 대해 ACTIVE/TRIAL 레코드가 있으면 거절.
    const existing = await this.prisma.brandHqEntitlement.findFirst({
      where: {
        brandHqId: input.brandHqId,
        capability: input.capability,
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
    });
    if (existing) {
      throw new DomainError({ code: 'ENTITLEMENT_ALREADY_ACTIVE', params: { existingId: existing.id } });
    }

    const created = await this.prisma.brandHqEntitlement.create({
      data: {
        brandHqId: input.brandHqId,
        capability: input.capability,
        status: input.startAsTrial ? 'TRIAL' : 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: input.expiresAt ?? null,
        grantedBySuperAdminId: input.grantedBySuperAdminId,
        contractRef: input.contractRef ?? null,
        licenseId: input.licenseId ?? null,
      },
    });
    await this.invalidate(input.brandHqId);
    await this.writeAudit(
      'ENTITLEMENT_GRANT',
      created.id,
      { userType: input.actorUserType ?? 'SUPER_ADMIN', userId: input.grantedBySuperAdminId },
      null,
      created,
    );
    return created;
  }

  async suspend(entitlementId: string, reason: string, actor?: { userType?: string; userId?: string }) {
    const row = await this.prisma.brandHqEntitlement.findUnique({
      where: { id: entitlementId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Entitlement' }, details: { reason: 'Entitlement not found' } });
    const updated = await this.prisma.brandHqEntitlement.update({
      where: { id: entitlementId },
      data: { status: 'SUSPENDED', revokeReason: reason },
    });
    await this.invalidate(row.brandHqId);
    await this.writeAudit('ENTITLEMENT_SUSPEND', updated.id, actor ?? {}, row, updated);
    return updated;
  }

  async resume(entitlementId: string, actor?: { userType?: string; userId?: string }) {
    const row = await this.prisma.brandHqEntitlement.findUnique({
      where: { id: entitlementId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Entitlement' }, details: { reason: 'Entitlement not found' } });
    if (row.status !== 'SUSPENDED') {
      throw new DomainError({ code: 'ENTITLEMENT_NOT_SUSPENDED', params: { currentStatus: row.status } });
    }
    const updated = await this.prisma.brandHqEntitlement.update({
      where: { id: entitlementId },
      data: { status: 'ACTIVE', revokeReason: null },
    });
    await this.invalidate(row.brandHqId);
    await this.writeAudit('ENTITLEMENT_RESUME', updated.id, actor ?? {}, row, updated);
    return updated;
  }

  async revoke(entitlementId: string, reason: string, actor?: { userType?: string; userId?: string }) {
    const row = await this.prisma.brandHqEntitlement.findUnique({
      where: { id: entitlementId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Entitlement' }, details: { reason: 'Entitlement not found' } });
    const updated = await this.prisma.brandHqEntitlement.update({
      where: { id: entitlementId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
    await this.invalidate(row.brandHqId);
    await this.writeAudit('ENTITLEMENT_REVOKE', updated.id, actor ?? {}, row, updated);
    return updated;
  }
}
