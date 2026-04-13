/**
 * 한국어: Cache policy registry — 중앙 Redis key / TTL 규칙을 한 곳에 모은다.
 *
 *   목표:
 *     - 서비스마다 문자열 key 를 흩뿌리지 않는다.
 *     - future cache policy 가 늘어나도 key / ttl / index 규칙은 여기만 보면 된다.
 *     - policy 는 "key 생성"과 "기본 TTL"을 함께 보유한다.
 *
 * Tiếng Việt: Registry policy cache — gom key/TTL Redis về một chỗ.
 */
import { createHash } from 'node:crypto';
import type { AuthUserType } from '@core/auth/constants/UserTypes.constant';

export interface CacheDescriptor {
  key: string;
  ttlSeconds: number;
  indexKey?: string;
  indexTtlSeconds?: number;
}

export interface RbacPermissionScope {
  userType: string;
  userId: string;
  distributorId?: string | null;
  brandHqId?: string | null;
  branchId?: string | null;
  corporateId?: string | null;
}

function hashScope(scope: RbacPermissionScope): string {
  const raw = [
    scope.userType,
    scope.userId,
    scope.distributorId ?? '',
    scope.brandHqId ?? '',
    scope.branchId ?? '',
    scope.corporateId ?? '',
  ].join('|');
  return createHash('sha1').update(raw).digest('hex').slice(0, 16);
}

function hashText(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 16);
}

function cacheDescriptor(input: CacheDescriptor): CacheDescriptor {
  return input;
}

export const CachePolicies = {
  apqPrefix: 'apollo:apq:',

  tenantContext(userType: AuthUserType, userId: string): CacheDescriptor {
    return cacheDescriptor({
      key: `tenantctx:${userType}:${userId}`,
      ttlSeconds: 60,
    });
  },

  rbacPermissions(scope: RbacPermissionScope): CacheDescriptor {
    const scopeHash = hashScope(scope);
    return cacheDescriptor({
      key: `rbac:perms:${scope.userType}:${scope.userId}:${scopeHash}`,
      ttlSeconds: 60,
      indexKey: `rbac:perms:index:${scope.userType}:${scope.userId}`,
      indexTtlSeconds: 240,
    });
  },

  rbacPermissionsIndex(userType: string, userId: string): CacheDescriptor {
    return cacheDescriptor({
      key: `rbac:perms:index:${userType}:${userId}`,
      ttlSeconds: 240,
    });
  },

  referenceList(namespace: 'languages' | 'regions' | 'currencies'): CacheDescriptor {
    return cacheDescriptor({
      key: `reference:${namespace}:list`,
      ttlSeconds: 300,
    });
  },

  entitlementBrand(brandHqId: string): CacheDescriptor {
    return cacheDescriptor({
      key: `entitlement:brand:${brandHqId}`,
      ttlSeconds: 30,
    });
  },

  authLoginAttempts(
    userType: string,
    scopeKey: string,
    loginId: string,
    windowSeconds: number,
  ): CacheDescriptor {
    return cacheDescriptor({
      key: `auth:login:${userType}:${scopeKey}:${loginId}:attempts`,
      ttlSeconds: windowSeconds,
    });
  },

  einvoiceProviderToken(
    providerType: string,
    baseUrl: string,
    ttlSeconds = 300,
  ): CacheDescriptor {
    return cacheDescriptor({
      key: `einvoice:provider-token:${providerType}:${hashText(baseUrl)}`,
      ttlSeconds,
    });
  },

  syncUpstreamIdempotency(idempotencyKey: string, requestId: string): CacheDescriptor {
    return cacheDescriptor({
      key: `sync:upstream:idempotency:${idempotencyKey || requestId}`,
      ttlSeconds: 300,
    });
  },

  syncUpstreamStream: 'sync:upstream',
} as const;
