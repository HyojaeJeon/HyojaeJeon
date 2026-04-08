/**
 * BrandHQ Entitlement DTOs.
 *
 * Capability 는 BrandHQ 1:N 으로 attach 된다. 직원 개별 권한(RBAC)은 별도 시스템이며,
 * 실제 사용 가능 권한은 `BrandHq.activeCapabilities ∩ User.roles.permissions` 의 교집합이다.
 */
import type { BrandHqCapability, BrandHqEntitlementStatus } from './enums.js';
export interface BrandHqEntitlement {
    entitlementId: string;
    brandHqId: string;
    capability: BrandHqCapability;
    status: BrandHqEntitlementStatus;
    activatedAt: string;
    expiresAt?: string | null;
    grantedBySuperAdminId: string;
    revokedAt?: string | null;
    revokeReason?: string | null;
    contractRef?: string | null;
}
/**
 * me / currentSession 응답에 포함되는 경량 요약.
 * BrandHQPortal 의 <CapabilityProvider> 가 이 리스트로 초기화된다.
 */
export interface BrandHqActiveCapabilitiesSummary {
    brandHqId: string;
    activeCapabilities: BrandHqCapability[];
    evaluatedAt: string;
}
export interface GrantBrandHqCapabilityInput {
    brandHqId: string;
    capability: BrandHqCapability;
    expiresAt?: string | null;
    contractRef?: string | null;
    startAsTrial?: boolean;
}
export interface RevokeBrandHqCapabilityInput {
    entitlementId: string;
    revokeReason: string;
}
export interface SuspendBrandHqCapabilityInput {
    entitlementId: string;
    reason: string;
}
