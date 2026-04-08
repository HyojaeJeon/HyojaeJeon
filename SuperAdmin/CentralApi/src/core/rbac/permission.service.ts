/**
 * 한국어: PermissionService — 동적 RBAC 의 단일 진입점.
 *
 *   기준서 §100.7 권한 계산식의 우변 (User.roles.permissions) 을 책임진다.
 *
 *     실제 가용 권한 = BrandHq.activeCapabilities ∩ User.roles.permissions(scope)
 *
 *   ── P0 review 반영 사항 ──────────────────────────
 *   1. 평가 시 scope (brandHqId / branchId / corporateId) 를 고려한다.
 *      assignment.scope 가 null 이면 글로벌, 값이 있으면 호출 컨텍스트의 동일 scope 일 때만 부여.
 *   2. 캐시 키는 (userType, userId, scopeBrandHqId, scopeBranchId, scopeCorporateId) 의 hash.
 *   3. assignRole 의 중복 검사는 scope 까지 포함 — 동일 사용자가 여러 BrandHQ 에 같은 role 부여 가능.
 *   4. PLATFORM_SUPER_ADMIN 우회는 제거. 모든 가드는 동적 RBAC 를 거친다.
 *      (단, RoleCode 'PLATFORM_SUPER_ADMIN' 보유자는 seed 에서 모든 permission 을 가진 것으로 부여되어 있어야 함)
 *   5. Role / RolePermission CRUD 도 본 service 에서 제공.
 *   6. 권한/역할 변경은 Audit + 캐시 무효화 + (선택) Outbox 이벤트 트리거를 일관 처리한다.
 */
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { AuditService } from '@core/audit/audit.service';
import { DomainError } from '@core/errors/domain-error';
import { CacheService } from '@core/cache/cache.service';
import { CachePolicies, type RbacPermissionScope } from '@core/cache/cache-policies';
import { TenantContextService } from '@core/tenancy/tenant-context.service';
import type { AuthUserType } from '@core/auth/constants/user-types.constant';
import { isAuthUserType } from '@core/auth/constants/user-types.constant';

/**
 * 평가 컨텍스트.
 *   - userType / userId : 인증된 사용자
 *   - distributorId / brandHqId / branchId / corporateId : 호출이 영향을 미치는 4축 scope
 *   scope 값이 들어오면, 글로벌(scope 컬럼이 모두 null) 이거나 동일 scope 인 assignment 만
 *   permission 합집합에 포함된다. scope 값이 없으면 글로벌 권한만 평가된다.
 *   distributor/brand/branch 는 BrandHQ 트리이며 corporate 는 별개 축이다.
 */
export interface EvaluationContext extends RbacPermissionScope {}

type AccountLookupResult = { id: string } | null;

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: CacheService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private async isAccountActive(ctx: EvaluationContext): Promise<boolean> {
    const where = { id: ctx.userId, status: 'ACTIVE', deletedAt: null } as const;
    let row: AccountLookupResult = null;
    switch (ctx.userType) {
      case 'SUPER_ADMIN':
        row = await this.prisma.superAdminUser.findFirst({ where, select: { id: true } });
        break;
      case 'DISTRIBUTOR_USER':
        row = await this.prisma.distributorUser.findFirst({ where, select: { id: true } });
        break;
      case 'BRAND_ADMIN':
        row = await this.prisma.brandAdminUser.findFirst({ where, select: { id: true } });
        break;
      case 'CORPORATE_ADMIN':
        row = await this.prisma.corporateAdminUser.findFirst({ where, select: { id: true } });
        break;
      default:
        return false;
    }
    return !!row;
  }

  // ───────────────────────────────────────── Read

  /**
   * 호출 context 의 effective permissions 집합.
   * scope 가 일치하지 않는 assignment 는 무시한다.
   */
  async getEffectivePermissions(
    ctx: EvaluationContext,
  ): Promise<Set<string>> {
    if (!(await this.isAccountActive(ctx))) {
      return new Set();
    }

    const policy = CachePolicies.rbacPermissions(ctx);
    const cached = await this.cache.rememberJson(policy, async () => {
      const now = new Date();
      const assignments = await this.prisma.userRoleAssignment.findMany({
        where: {
          userType: ctx.userType,
          userId: ctx.userId,
          status: 'ACTIVE',
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        include: {
          role: {
            include: {
              rolePermissions: { include: { permission: true } },
            },
          },
        },
      });

      const set = new Set<string>();
      for (const a of assignments) {
        // scope 매칭: assignment 의 scope 컬럼이 null 이면 글로벌 (항상 적용),
        // 값이 있으면 호출 컨텍스트의 동일 컬럼 값과 일치해야 적용. 4축 (distributor/brand/branch/corporate).
        if (a.scopeDistributorId && a.scopeDistributorId !== ctx.distributorId) continue;
        if (a.scopeBrandHqId && a.scopeBrandHqId !== ctx.brandHqId) continue;
        if (a.scopeBranchId && a.scopeBranchId !== ctx.branchId) continue;
        if (a.scopeCorporateId && a.scopeCorporateId !== ctx.corporateId) continue;
        for (const rp of a.role.rolePermissions) {
          set.add(rp.permission.permissionKey);
        }
      }

      return Array.from(set);
    });

    return new Set(cached);
  }

  async has(ctx: EvaluationContext, permissionKey: string): Promise<boolean> {
    const set = await this.getEffectivePermissions(ctx);
    return set.has(permissionKey);
  }

  /**
   * 가드 진입점. service 메서드 첫 줄에서 호출.
   *   await this.permission.require(ctx, 'mealticket.policy.write');
   * 실패 시 ForbiddenException(code='PERMISSION_DENIED').
   */
  async require(ctx: EvaluationContext, permissionKey: string): Promise<void> {
    const ok = await this.has(ctx, permissionKey);
    if (!ok) {
      throw new DomainError({ code: 'PERMISSION_DENIED', params: { permissionKey,
        userId: ctx.userId } });
    }
  }

  /**
   * 사용자 단위 무효화 — 해당 user 의 모든 scope 캐시를 일괄 제거.
   *
   * P0-5: RBAC 캐시 무효화 시 TenantContext 캐시도 함께 제거하여
   *   권한/소속 변경 후 최대 60s 불일치 창을 없앤다. (두 캐시 모두 60s TTL)
   */
  async invalidate(userType: string, userId: string): Promise<void> {
    await this.cache.invalidateIndex(CachePolicies.rbacPermissionsIndex(userType, userId).key);
    if (isAuthUserType(userType)) {
      await this.tenantContext.invalidate(userType as AuthUserType, userId);
    }
  }

  // ───────────────────────────────────────── Role hierarchy (legacy 호환)

  async getRoleLevel(roleCode: string): Promise<number> {
    const descriptor = CachePolicies.roleLevel(roleCode);
    const cached = await this.cache.get(descriptor.key);
    if (cached !== null) {
      const n = Number(cached);
      return Number.isFinite(n) ? n : 0;
    }
    const row = await this.prisma.role.findUnique({ where: { roleCode } });
    const level = row?.hierarchyLevel ?? 0;
    await this.cache.set(descriptor.key, String(level), descriptor.ttlSeconds);
    return level;
  }

  // ───────────────────────────────────────── Catalog

  async listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { permissionKey: 'asc' } });
  }

  async listRoles() {
    return this.prisma.role.findMany({
      orderBy: [{ scope: 'asc' }, { hierarchyLevel: 'desc' }],
    });
  }

  async findRoleById(id: string) {
    const r = await this.prisma.role.findUnique({ where: { id } });
    if (!r) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Role' }, details: { reason: 'Role not found' } });
    return r;
  }

  async listRolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  async listUserAssignments(userType: string, userId: string) {
    return this.prisma.userRoleAssignment.findMany({
      where: { userType, userId },
      include: { role: true },
      orderBy: { grantedAt: 'desc' },
    });
  }

  // ───────────────────────────────────────── Role CRUD

  async createRole(
    actor: { userType: string; userId: string },
    input: {
      roleCode: string;
      roleName: string;
      scope: string;
      hierarchyLevel?: number;
      description?: string | null;
    },
  ) {
    const created = await this.prisma.role.create({
      data: {
        roleCode: input.roleCode,
        roleName: input.roleName,
        scope: input.scope,
        hierarchyLevel: input.hierarchyLevel ?? 0,
        description: input.description ?? null,
        isSystem: false,
      },
    });
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_CREATE',
      targetType: 'Role',
      targetId: created.id,
      afterDataJson: created as unknown as Record<string, unknown>,
    });
    return created;
  }

  async updateRole(
    actor: { userType: string; userId: string },
    id: string,
    input: {
      roleName?: string;
      scope?: string;
      hierarchyLevel?: number;
      description?: string | null;
    },
  ) {
    const before = await this.findRoleById(id);
    if (before.isSystem) {
      // 시스템 역할은 hierarchyLevel/description 만 변경 허용
      const updated = await this.prisma.role.update({
        where: { id },
        data: {
          ...(input.hierarchyLevel !== undefined && { hierarchyLevel: input.hierarchyLevel }),
          ...(input.description !== undefined && { description: input.description }),
        },
      });
      await this.audit.log({
        actorType: actor.userType,
        actorId: actor.userId,
        actionType: 'RBAC_ROLE_UPDATE',
        targetType: 'Role',
        targetId: id,
        beforeDataJson: before as unknown as Record<string, unknown>,
        afterDataJson: updated as unknown as Record<string, unknown>,
      });
      return updated;
    }
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(input.roleName !== undefined && { roleName: input.roleName }),
        ...(input.scope !== undefined && { scope: input.scope }),
        ...(input.hierarchyLevel !== undefined && { hierarchyLevel: input.hierarchyLevel }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
    await this.invalidateRoleAssignedUsers(id);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_UPDATE',
      targetType: 'Role',
      targetId: id,
      beforeDataJson: before as unknown as Record<string, unknown>,
      afterDataJson: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  async deleteRole(actor: { userType: string; userId: string }, id: string) {
    const before = await this.findRoleById(id);
    if (before.isSystem) {
      throw new DomainError({ code: 'SYSTEM_ROLE_DELETE_DENIED', params: { roleCode: before.roleCode } });
    }
    // 활성 assignment 가 남아 있으면 거절
    const active = await this.prisma.userRoleAssignment.count({
      where: { roleId: id, status: 'ACTIVE' },
    });
    if (active > 0) {
      throw new DomainError({ code: 'ROLE_HAS_ACTIVE_ASSIGNMENTS', params: { count: active } });
    }
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.role.delete({ where: { id } });
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_DELETE',
      targetType: 'Role',
      targetId: id,
      beforeDataJson: before as unknown as Record<string, unknown>,
    });
    return true;
  }

  // ───────────────────────────────────────── RolePermission CRUD

  async addPermissionToRole(
    actor: { userType: string; userId: string },
    roleId: string,
    permissionKey: string,
  ) {
    const role = await this.findRoleById(roleId);
    const perm = await this.prisma.permission.findUnique({
      where: { permissionKey },
    });
    if (!perm) throw new DomainError({ code: 'INTERNAL_ERROR', details: { raw: '`Permission not found: ${permissionKey}`' } });

    const existing = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId: perm.id },
    });
    if (existing) return existing;

    const created = await this.prisma.rolePermission.create({
      data: { roleId, permissionId: perm.id, grantedBy: actor.userId },
    });
    await this.invalidateRoleAssignedUsers(roleId);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_PERMISSION_ADD',
      targetType: 'RolePermission',
      targetId: created.id,
      afterDataJson: { roleCode: role.roleCode, permissionKey } as Record<string, unknown>,
    });
    return created;
  }

  async removePermissionFromRole(
    actor: { userType: string; userId: string },
    roleId: string,
    permissionKey: string,
  ) {
    const role = await this.findRoleById(roleId);
    const perm = await this.prisma.permission.findUnique({
      where: { permissionKey },
    });
    if (!perm) throw new DomainError({ code: 'INTERNAL_ERROR', details: { raw: '`Permission not found: ${permissionKey}`' } });

    await this.prisma.rolePermission.deleteMany({
      where: { roleId, permissionId: perm.id },
    });
    await this.invalidateRoleAssignedUsers(roleId);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_PERMISSION_REMOVE',
      targetType: 'RolePermission',
      targetId: `${roleId}:${perm.id}`,
      beforeDataJson: { roleCode: role.roleCode, permissionKey } as Record<string, unknown>,
    });
    return true;
  }

  /**
   * 특정 Role 에 부여된 모든 활성 사용자의 캐시를 일괄 무효화한다.
   * Role/Permission 변경 시 호출.
   */
  private async invalidateRoleAssignedUsers(roleId: string): Promise<void> {
    const users = await this.prisma.userRoleAssignment.findMany({
      where: { roleId, status: 'ACTIVE' },
      select: { userType: true, userId: true },
    });
    const seen = new Set<string>();
    for (const u of users) {
      const k = `${u.userType}|${u.userId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      await this.invalidate(u.userType, u.userId);
    }
  }

  // ───────────────────────────────────────── UserRoleAssignment

  async assignRole(
    actor: { userType: string; userId: string },
    input: {
      userType: string;
      userId: string;
      roleCode: string;
      scopeDistributorId?: string | null;
      scopeBrandHqId?: string | null;
      scopeCorporateId?: string | null;
      scopeBranchId?: string | null;
      expiresAt?: Date | null;
    },
  ) {
    const role = await this.prisma.role.findUnique({
      where: { roleCode: input.roleCode },
    });
    if (!role) throw new DomainError({ code: 'INTERNAL_ERROR', details: { raw: '`Role not found: ${input.roleCode}`' } });

    // 축 충돌 검사: BrandHQ 트리(distributor/brand/branch) 와 Corporate 는 상호 배타.
    const hasBrandAxis = !!(input.scopeDistributorId || input.scopeBrandHqId || input.scopeBranchId);
    if (hasBrandAxis && input.scopeCorporateId) {
      throw new DomainError({ code: 'SCOPE_AXIS_CONFLICT', params: { detail: 'corporate scope cannot be combined with distributor/brand/branch scope' } });
    }

    // 중복 검사 — 동일 (user, role, 4축 scope) 조합만 거절.
    const existing = await this.prisma.userRoleAssignment.findFirst({
      where: {
        userType: input.userType,
        userId: input.userId,
        roleId: role.id,
        status: 'ACTIVE',
        scopeDistributorId: input.scopeDistributorId ?? null,
        scopeBrandHqId: input.scopeBrandHqId ?? null,
        scopeCorporateId: input.scopeCorporateId ?? null,
        scopeBranchId: input.scopeBranchId ?? null,
      },
    });
    if (existing) {
      throw new DomainError({ code: 'ROLE_ALREADY_ASSIGNED', params: { existingId: existing.id } });
    }

    const created = await this.prisma.userRoleAssignment.create({
      data: {
        userType: input.userType,
        userId: input.userId,
        roleId: role.id,
        scopeDistributorId: input.scopeDistributorId ?? null,
        scopeBrandHqId: input.scopeBrandHqId ?? null,
        scopeCorporateId: input.scopeCorporateId ?? null,
        scopeBranchId: input.scopeBranchId ?? null,
        expiresAt: input.expiresAt ?? null,
        grantedBy: actor.userId,
      },
    });

    await this.invalidate(input.userType, input.userId);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_ASSIGN',
      targetType: 'UserRoleAssignment',
      targetId: created.id,
      afterDataJson: created as unknown as Record<string, unknown>,
    });

    return created;
  }

  async revokeRoleAssignment(
    actor: { userType: string; userId: string },
    assignmentId: string,
    reason: string,
  ) {
    const row = await this.prisma.userRoleAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!row) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'Assignment' }, details: { reason: 'Assignment not found' } });

    const updated = await this.prisma.userRoleAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    await this.invalidate(row.userType, row.userId);
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_REVOKE',
      targetType: 'UserRoleAssignment',
      targetId: assignmentId,
      beforeDataJson: row as unknown as Record<string, unknown>,
      afterDataJson: updated as unknown as Record<string, unknown>,
    });

    return updated;
  }

}
