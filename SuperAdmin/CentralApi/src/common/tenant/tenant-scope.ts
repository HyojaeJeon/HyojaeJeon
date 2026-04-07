import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtPayload } from '../decorators/current-user.decorator';
import { RoleCode } from '../../modules/auth/constants/roles.constant';

const PLATFORM_WIDE_ROLES = new Set<string>([
  RoleCode.PLATFORM_SUPER_ADMIN,
  RoleCode.PLATFORM_SUPPORT_ENGINEER,
]);

const DISTRIBUTOR_SCOPED_ROLES = new Set<string>([
  RoleCode.REGIONAL_DISTRIBUTOR_ADMIN,
]);

const BRAND_SCOPED_ROLES = new Set<string>([
  RoleCode.BRAND_OWNER,
  RoleCode.BRAND_HQ_ADMIN,
  RoleCode.BRAND_HQ_OPERATOR,
]);

const BRANCH_SCOPED_ROLES = new Set<string>([
  RoleCode.BRANCH_MANAGER,
  RoleCode.STORE_OPERATOR,
]);

type TenantKey = 'distributorId' | 'brandHQId' | 'branchId';

function requireTenantId(user: JwtPayload, key: TenantKey): string {
  const value = user.tenantContext?.[key];
  if (!value) {
    throw new ForbiddenException(`Missing tenant context: ${key}`);
  }
  return value;
}

export function isPlatformWideUser(user?: JwtPayload): boolean {
  if (!user) return true;
  return PLATFORM_WIDE_ROLES.has(user.roleCode);
}

export function combineWhere<T extends object>(...clauses: Array<T | undefined>): T {
  const filtered = clauses.filter(Boolean) as T[];
  if (filtered.length === 0) return {} as T;
  if (filtered.length === 1) return filtered[0];
  return { AND: filtered } as T;
}

export function distributorScopeWhere(user?: JwtPayload): Prisma.DistributorProfileWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return { id: requireTenantId(user, 'distributorId') };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brands: {
        some: {
          id: requireTenantId(user, 'brandHQId'),
          deletedAt: null,
        },
      },
    };
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brands: {
        some: {
          branches: {
            some: {
              id: requireTenantId(user, 'branchId'),
              deletedAt: null,
            },
          },
        },
      },
    };
  }

  return undefined;
}

export function brandScopeWhere(user?: JwtPayload): Prisma.BrandProfileWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return { distributorId: requireTenantId(user, 'distributorId') };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return { id: requireTenantId(user, 'brandHQId') };
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    return {
      branches: {
        some: {
          id: requireTenantId(user, 'branchId'),
          deletedAt: null,
        },
      },
    };
  }

  return undefined;
}

export function branchScopeWhere(user?: JwtPayload): Prisma.BranchWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return { distributorId: requireTenantId(user, 'distributorId') };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return { brandHQId: requireTenantId(user, 'brandHQId') };
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    return { id: requireTenantId(user, 'branchId') };
  }

  return undefined;
}

export function edgePosScopeWhere(user?: JwtPayload): Prisma.EdgePosTerminalWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return {
      branch: {
        distributorId: requireTenantId(user, 'distributorId'),
        deletedAt: null,
      },
    };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return {
      branch: {
        brandHQId: requireTenantId(user, 'brandHQId'),
        deletedAt: null,
      },
    };
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    return { branchId: requireTenantId(user, 'branchId') };
  }

  return undefined;
}

export function menuCategoryScopeWhere(
  user?: JwtPayload,
): Prisma.BrandMenuCategoryWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brand: {
        distributorId: requireTenantId(user, 'distributorId'),
        deletedAt: null,
      },
    };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return { brandHQId: requireTenantId(user, 'brandHQId') };
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brand: {
        branches: {
          some: {
            id: requireTenantId(user, 'branchId'),
            deletedAt: null,
          },
        },
        deletedAt: null,
      },
    };
  }

  return undefined;
}

export function menuItemScopeWhere(user?: JwtPayload): Prisma.BrandMenuItemWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brand: {
        distributorId: requireTenantId(user, 'distributorId'),
        deletedAt: null,
      },
    };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return { brandHQId: requireTenantId(user, 'brandHQId') };
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brand: {
        branches: {
          some: {
            id: requireTenantId(user, 'branchId'),
            deletedAt: null,
          },
        },
        deletedAt: null,
      },
    };
  }

  return undefined;
}

export function pricePolicyScopeWhere(user?: JwtPayload): Prisma.PricePolicyWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brand: {
        distributorId: requireTenantId(user, 'distributorId'),
        deletedAt: null,
      },
    };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return { brandHQId: requireTenantId(user, 'brandHQId') };
  }

  return undefined;
}

export function promotionScopeWhere(user?: JwtPayload): Prisma.PromotionWhereInput | undefined {
  if (!user || isPlatformWideUser(user)) return undefined;

  if (DISTRIBUTOR_SCOPED_ROLES.has(user.roleCode)) {
    return {
      brand: {
        distributorId: requireTenantId(user, 'distributorId'),
        deletedAt: null,
      },
    };
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    return { brandHQId: requireTenantId(user, 'brandHQId') };
  }

  return undefined;
}

export function sanitizePolicyScopeChain(
  user: JwtPayload,
  startScope: string,
  requestedScopeChain: Record<string, string | null>,
): Record<string, string | null> {
  if (isPlatformWideUser(user)) {
    return requestedScopeChain;
  }

  const sanitized: Record<string, string | null> = {
    ...requestedScopeChain,
  };

  if (user.tenantContext?.distributorId) {
    sanitized.RegionalDistributor = user.tenantContext.distributorId;
  }

  if (BRAND_SCOPED_ROLES.has(user.roleCode)) {
    sanitized.BrandHQ = requireTenantId(user, 'brandHQId');

    if (startScope === 'Branch' || startScope === 'EdgePos') {
      sanitized.Branch = user.tenantContext?.branchId ?? null;
    }
  }

  if (BRANCH_SCOPED_ROLES.has(user.roleCode)) {
    sanitized.Branch = requireTenantId(user, 'branchId');
  }

  return sanitized;
}
