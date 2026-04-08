/**
 * 한국어: 멀티테넌트 스코프 헬퍼.
 *
 *   ── P0 review 반영 ───
 *   이전 버전은 hardcoded RoleCode 집합으로 분기했으나, 동적 RBAC 로 전환되면서
 *   **JWT tenantContext** 만으로 scope 를 도출하도록 변경했다.
 *
 *   - distributorId/brandHQId/branchId/corporateId 가 모두 비어 있으면 = 플랫폼 와이드
 *   - branchId 가 있으면 = branch scope
 *   - brandHQId 가 있으면 = brand scope
 *   - distributorId 만 있으면 = distributor scope
 *
 *   미세 권한 (예: pos.menu.read) 은 별도의 PermissionGuard / service.require()
 *   가 검증한다. 본 헬퍼는 데이터 가시성(row-level filter) 만 책임진다.
 *
 * Tiếng Việt: Helper scope đa thuê bao — chỉ dựa vào tenantContext, không phụ thuộc role.
 */
import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { DomainError } from '@core/errors/domain-error';

type TenantKey = 'distributorId' | 'brandHQId' | 'branchId' | 'corporateId';

function tenantId(user: JwtPayload, key: TenantKey): string {
  const value = user.tenantContext?.[key];
  if (!value) {
    throw new DomainError({ code: 'INTERNAL_ERROR', details: { raw: '`Missing tenant context: ${key}`' } });
  }
  return value;
}

/**
 * 플랫폼 와이드 사용자: SUPER_ADMIN 이고 tenantContext 가 비어 있는 경우에만 true.
 *   이전 구현은 tenantContext 가 비면 무조건 platform-wide 로 판정하여 row-level filter 가 풀리는
 *   P0 버그(리뷰 참조)가 있었다. 이를 fail-closed 로 엄격화한다. 다른 userType 이 tenantContext 없이
 *   들어오면 `detectScope` 가 ForbiddenException 을 던진다.
 *
 * 한국어: 4축 tenancy — distributor/brand/branch 는 BrandHQ 트리, corporate 는 별개 축. 동시 혼용 금지.
 * Tiếng Việt: 4 trục — distributor/brand/branch thuộc cây BrandHQ, corporate là trục riêng. Không trộn.
 */
export function isPlatformWideUser(user?: JwtPayload): boolean {
  if (!user) return false;
  if (user.userType !== 'SUPER_ADMIN') return false;
  const tc = user.tenantContext;
  if (!tc) return true;
  return !tc.distributorId && !tc.brandHQId && !tc.branchId && !tc.corporateId;
}

type Scope = 'platform' | 'distributor' | 'brand' | 'branch' | 'corporate';

function assertNoAxisConflict(user: JwtPayload): void {
  const tc = user.tenantContext;
  if (!tc) return;
  const hasBrandAxis = !!(tc.distributorId || tc.brandHQId || tc.branchId);
  if (hasBrandAxis && tc.corporateId) {
    throw new DomainError({ code: 'TENANT_SCOPE_AXIS_CONFLICT', params: { detail: 'corporateId cannot be combined with distributor/brand/branch scope' } });
  }
}

function detectScope(user: JwtPayload): Scope {
  assertNoAxisConflict(user);
  const tc = user.tenantContext;
  if (!tc || (!tc.distributorId && !tc.brandHQId && !tc.branchId && !tc.corporateId)) {
    if (user.userType !== 'SUPER_ADMIN') {
      throw new DomainError({ code: 'TENANT_CONTEXT_MISSING', params: { userType: user.userType } });
    }
    return 'platform';
  }
  if (tc.branchId) return 'branch';
  if (tc.brandHQId) return 'brand';
  if (tc.distributorId) return 'distributor';
  return 'corporate';
}

export function combineWhere<T extends object>(...clauses: Array<T | undefined>): T {
  const filtered = clauses.filter(Boolean) as T[];
  if (filtered.length === 0) return {} as T;
  if (filtered.length === 1) return filtered[0];
  return { AND: filtered } as T;
}

export function distributorScopeWhere(user?: JwtPayload): Prisma.DistributorProfileWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return { id: tenantId(user, 'distributorId') };
    case 'brand':
      return {
        brands: {
          some: { id: tenantId(user, 'brandHQId'), deletedAt: null },
        },
      };
    case 'branch':
      return {
        brands: {
          some: {
            branches: {
              some: { id: tenantId(user, 'branchId'), deletedAt: null },
            },
          },
        },
      };
    default:
      return undefined;
  }
}

export function brandScopeWhere(user?: JwtPayload): Prisma.BrandProfileWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return { distributorId: tenantId(user, 'distributorId') };
    case 'brand':
      return { id: tenantId(user, 'brandHQId') };
    case 'branch':
      return {
        branches: {
          some: { id: tenantId(user, 'branchId'), deletedAt: null },
        },
      };
    default:
      return undefined;
  }
}

export function corporateScopeWhere(user?: JwtPayload): Prisma.MealCorporateWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'corporate':
      return { id: tenantId(user, 'corporateId') };
    default:
      return undefined;
  }
}

export function branchScopeWhere(user?: JwtPayload): Prisma.BranchWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return { distributorId: tenantId(user, 'distributorId') };
    case 'brand':
      return { brandHQId: tenantId(user, 'brandHQId') };
    case 'branch':
      return { id: tenantId(user, 'branchId') };
    default:
      return undefined;
  }
}

export function edgePosScopeWhere(user?: JwtPayload): Prisma.EdgePosTerminalWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return {
        branch: { distributorId: tenantId(user, 'distributorId'), deletedAt: null },
      };
    case 'brand':
      return {
        branch: { brandHQId: tenantId(user, 'brandHQId'), deletedAt: null },
      };
    case 'branch':
      return { branchId: tenantId(user, 'branchId') };
    default:
      return undefined;
  }
}

export function menuCategoryScopeWhere(
  user?: JwtPayload,
): Prisma.BrandMenuCategoryWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return {
        brand: { distributorId: tenantId(user, 'distributorId'), deletedAt: null },
      };
    case 'brand':
      return { brandHQId: tenantId(user, 'brandHQId') };
    case 'branch':
      return {
        brand: {
          branches: {
            some: { id: tenantId(user, 'branchId'), deletedAt: null },
          },
          deletedAt: null,
        },
      };
    default:
      return undefined;
  }
}

export function menuItemScopeWhere(user?: JwtPayload): Prisma.BrandMenuItemWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return {
        brand: { distributorId: tenantId(user, 'distributorId'), deletedAt: null },
      };
    case 'brand':
      return { brandHQId: tenantId(user, 'brandHQId') };
    case 'branch':
      return {
        brand: {
          branches: {
            some: { id: tenantId(user, 'branchId'), deletedAt: null },
          },
          deletedAt: null,
        },
      };
    default:
      return undefined;
  }
}

export function pricePolicyScopeWhere(user?: JwtPayload): Prisma.PricePolicyWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return {
        brand: { distributorId: tenantId(user, 'distributorId'), deletedAt: null },
      };
    case 'brand':
      return { brandHQId: tenantId(user, 'brandHQId') };
    default:
      return undefined;
  }
}

export function promotionScopeWhere(user?: JwtPayload): Prisma.PromotionWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;
  switch (detectScope(user)) {
    case 'distributor':
      return {
        brand: { distributorId: tenantId(user, 'distributorId'), deletedAt: null },
      };
    case 'brand':
      return { brandHQId: tenantId(user, 'brandHQId') };
    default:
      return undefined;
  }
}

export function sanitizePolicyScopeChain(
  user: JwtPayload,
  startScope: string,
  requestedScopeChain: Record<string, string | null>,
): Record<string, string | null> {
  if (isPlatformWideUser(user)) {
    return requestedScopeChain;
  }

  const sanitized: Record<string, string | null> = { ...requestedScopeChain };
  const tc = user.tenantContext ?? {};

  if (tc.distributorId) sanitized.REGIONAL_DISTRIBUTOR = tc.distributorId;
  if (tc.brandHQId) {
    sanitized.BRAND_HQ = tc.brandHQId;
    if (startScope === 'BRANCH' || startScope === 'EDGE_POS') {
      sanitized.BRANCH = tc.branchId ?? null;
    }
  }
  if (tc.branchId) sanitized.BRANCH = tc.branchId;
  if (tc.corporateId) sanitized.CORPORATE = tc.corporateId;

  return sanitized;
}
