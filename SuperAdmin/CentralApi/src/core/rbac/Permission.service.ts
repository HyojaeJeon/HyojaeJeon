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
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { AuditService } from '@core/audit/Audit.service';
import { DomainError } from '@core/errors/DomainError';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies, type RbacPermissionScope } from '@core/cache/cachePolicies';
import { TenantContextService } from '@core/tenancy/TenantContext.service';
import type { AuthUserType } from '@core/auth/constants/UserTypes.constant';
import { isAuthUserType } from '@core/auth/constants/UserTypes.constant';
import { isAccountActive } from '@core/auth/accountStatus';
import { matchPermission, LEGACY_KEY_MAP } from './permissionDefinitions';

/**
 * 평가 컨텍스트.
 *   - userType / userId : 인증된 사용자
 *   - distributorId / brandHqId / branchId / corporateId : 호출이 영향을 미치는 4축 scope
 *   scope 값이 들어오면, 글로벌(scope 컬럼이 모두 null) 이거나 동일 scope 인 assignment 만
 *   permission 합집합에 포함된다. scope 값이 없으면 글로벌 권한만 평가된다.
 *   distributor/brand/branch 는 BrandHQ 트리이며 corporate 는 별개 축이다.
 */
export interface EvaluationContext extends RbacPermissionScope {}

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: CacheService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // 한국어: isAccountActive()는 사용자 계정이 DB에서 아직 활성(ACTIVE) 상태인지 확인합니다.
  //   공용 함수 isAccountActive() 에 위임합니다.
  // Tiếng Việt: isAccountActive() kiểm tra tài khoản còn hoạt động (ACTIVE) trong DB không.
  //   Ủy quyền cho hàm dùng chung isAccountActive().
  private isAccountActiveCheck(ctx: EvaluationContext): Promise<boolean> {
    if (!isAuthUserType(ctx.userType)) return Promise.resolve(false);
    return isAccountActive(this.prisma, ctx.userType, ctx.userId);
  }

  // ───────────────────────────────────────── Read

  /**
   * 호출 context 의 effective permissions 집합.
   * scope 가 일치하지 않는 assignment 는 무시한다.
   */
  // 한국어: getEffectivePermissions()는 사용자가 실제로 사용할 수 있는 모든 권한을 계산합니다.
  //   1) 계정이 활성 상태인지 확인 → 비활성이면 빈 Set 반환
  //   2) 사용자에게 할당된 역할(Role)들을 DB에서 조회
  //   3) 각 역할 할당의 scope(조직/브랜드/지점/고객사)가 요청 컨텍스트와 일치하는지 확인
  //      - scope가 null이면 "글로벌" → 어디서든 적용
  //      - scope에 값이 있으면 → 해당 조직에서만 적용
  //   4) 일치하는 역할들의 권한을 모두 합쳐서 반환 (합집합)
  //   결과는 Redis에 캐싱되어 매번 DB를 조회하지 않습니다.
  // Tiếng Việt: getEffectivePermissions() tính toán tất cả quyền thực tế của người dùng.
  //   1) Kiểm tra tài khoản active → nếu không thì trả Set rỗng
  //   2) Truy vấn DB lấy các vai trò (Role) được gán cho người dùng
  //   3) Kiểm tra scope (tổ chức/thương hiệu/chi nhánh/khách hàng) khớp với context yêu cầu
  //      - scope null = "toàn cục" → áp dụng mọi nơi
  //      - scope có giá trị → chỉ áp dụng cho tổ chức đó
  //   4) Gộp quyền của tất cả vai trò khớp (hợp nhất)
  //   Kết quả được cache trong Redis để không phải truy vấn DB mỗi lần.
  async getEffectivePermissions(
    ctx: EvaluationContext,
  ): Promise<Set<string>> {
    if (!(await this.isAccountActiveCheck(ctx))) {
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
        // Role.permissions JSON 배열도 합산 (와일드카드 '*' 포함 가능)
        const jsonPerms = a.role.permissions;
        if (Array.isArray(jsonPerms)) {
          for (const p of jsonPerms) {
            if (typeof p === 'string') set.add(p);
          }
        }
      }

      return Array.from(set);
    });

    return new Set(cached);
  }

  // 한국어: has()는 사용자가 특정 권한을 가지고 있는지 true/false로 확인합니다.
  //   내부적으로 getEffectivePermissions()를 호출하여 전체 권한 집합을 구한 뒤 확인합니다.
  // Tiếng Việt: has() kiểm tra người dùng có một quyền cụ thể hay không (true/false).
  //   Bên trong gọi getEffectivePermissions() để lấy toàn bộ quyền rồi kiểm tra.
  async has(ctx: EvaluationContext, permissionKey: string): Promise<boolean> {
    const set = await this.getEffectivePermissions(ctx);
    // 정확히 일치 먼저 확인 (빠른 경로)
    if (set.has(permissionKey)) return true;
    // DB 는 dot 형식, resolver 는 colon 형식일 수 있으므로 양방향 정규화
    const perms = Array.from(set).map((k) => LEGACY_KEY_MAP[k] ?? k);
    return matchPermission(perms, permissionKey);
  }

  /**
   * 가드 진입점. service 메서드 첫 줄에서 호출.
   *   await this.permission.require(ctx, 'mealticket.policy.write');
   * 실패 시 ForbiddenException(code='PERMISSION_DENIED').
   */
  // 한국어: require()는 has()와 비슷하지만, 권한이 없으면 에러를 던집니다 (PERMISSION_DENIED).
  //   서비스 메서드 맨 앞에서 호출하여 "이 권한이 없으면 진행 불가"를 강제합니다.
  //   has()는 확인만, require()는 차단까지 한다는 차이입니다.
  // Tiếng Việt: require() giống has() nhưng nếu không có quyền sẽ ném lỗi (PERMISSION_DENIED).
  //   Gọi ở đầu method để bắt buộc "không có quyền thì không được tiếp tục".
  //   has() chỉ kiểm tra, require() chặn luôn — đó là sự khác biệt.
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
  // 한국어: invalidate()는 사용자의 권한 캐시를 삭제합니다.
  //   역할이나 권한이 변경되면 이 메서드를 호출해서 캐시를 비워야 합니다.
  //   캐시를 비우지 않으면 사용자가 변경 전 권한을 계속 사용하게 됩니다.
  //   TenantContext(소속 정보) 캐시도 함께 삭제하여 불일치를 방지합니다.
  // Tiếng Việt: invalidate() xoá cache quyền của người dùng.
  //   Khi vai trò hoặc quyền thay đổi, phải gọi method này để xoá cache.
  //   Nếu không xoá, người dùng sẽ tiếp tục dùng quyền cũ.
  //   Cache TenantContext (thông tin tổ chức) cũng bị xoá cùng lúc để tránh bất đồng bộ.
  async invalidate(userType: string, userId: string): Promise<void> {
    await this.cache.invalidateIndex(CachePolicies.rbacPermissionsIndex(userType, userId).key);
    if (isAuthUserType(userType)) {
      await this.tenantContext.invalidate(userType as AuthUserType, userId);
    }
  }

  // ───────────────────────────────────────── Catalog

  async listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { permissionKey: 'asc' } });
  }

  async listRoles() {
    return this.prisma.role.findMany({
      orderBy: [{ scope: 'asc' }, { roleCode: 'asc' }],
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

  /**
   * 한국어: 주어진 scope 에 속하는 모든 Role 의 (roleId, permissionId) pair 를 한 번에
   *   로드한다. Matrix 탭 초기 상태 bulk fetch 용.
   * Tiếng Việt: Nạp hàng loạt cặp (roleId, permissionId) cho toàn bộ Role trong scope.
   */
  async getRolePermissionsMatrix(scope: string) {
    return this.prisma.rolePermission.findMany({
      where: { role: { scope } },
      select: { roleId: true, permissionId: true },
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

  /** roleCode 자동 생성: {SCOPE}_{SLUG}. 중복 시 숫자 suffix 추가. */
  private async generateRoleCode(scope: string, roleName: string, roleNameEn?: string | null): Promise<string> {
    const source = roleNameEn?.trim() || roleName;
    const slug = source
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toUpperCase();
    const base = `${scope}_${slug}`.slice(0, 80);

    const existing = await this.prisma.role.findUnique({ where: { roleCode: base } });
    if (!existing) return base;

    for (let i = 2; i <= 99; i++) {
      const candidate = `${base}_${i}`.slice(0, 80);
      const dup = await this.prisma.role.findUnique({ where: { roleCode: candidate } });
      if (!dup) return candidate;
    }
    return `${base}_${Date.now().toString(36).toUpperCase()}`.slice(0, 80);
  }

  // 한국어: createRole()은 새로운 역할을 생성합니다. roleCode 는 scope + roleName 기반으로 자동 생성합니다.
  //   생성 후 감사 로그(Audit Log)에 기록됩니다.
  // Tiếng Việt: createRole() tạo vai trò mới. roleCode được tự động tạo dựa trên scope + roleName.
  //   Sau khi tạo sẽ ghi vào nhật ký kiểm toán (Audit Log).
  async createRole(
    actor: { userType: string; userId: string },
    input: {
      roleName: string;
      scope: string;
      roleNameKo?: string | null;
      roleNameEn?: string | null;
      description?: string | null;
      descriptionKo?: string | null;
      descriptionEn?: string | null;
    },
  ) {
    const roleCode = await this.generateRoleCode(input.scope, input.roleName, input.roleNameEn);
    const created = await this.prisma.role.create({
      data: {
        roleCode,
        roleName: input.roleName,
        scope: input.scope,
        roleNameKo: input.roleNameKo ?? null,
        roleNameEn: input.roleNameEn ?? null,
        description: input.description ?? null,
        descriptionKo: input.descriptionKo ?? null,
        descriptionEn: input.descriptionEn ?? null,
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

  // 한국어: updateRole()은 기존 역할을 수정합니다. 시스템 역할(isSystem=true)은 수정할 수 없습니다.
  //   수정 후 해당 역할이 할당된 모든 사용자의 캐시를 무효화합니다.
  // Tiếng Việt: updateRole() cập nhật vai trò. Vai trò hệ thống (isSystem=true) không được sửa.
  //   Sau khi sửa, cache của tất cả người dùng có vai trò này sẽ bị xoá.
  async updateRole(
    actor: { userType: string; userId: string },
    id: string,
    input: {
      roleName?: string | null;
      scope?: string | null;
      roleNameKo?: string | null;
      roleNameEn?: string | null;
      description?: string | null;
      descriptionKo?: string | null;
      descriptionEn?: string | null;
    },
  ) {
    const before = await this.findRoleById(id);
    if (before.isSystem) {
      throw new DomainError({ code: 'SYSTEM_ROLE_READONLY', params: { roleCode: before.roleCode } });
    }
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(input.roleName !== undefined && input.roleName !== null && { roleName: input.roleName }),
        ...(input.scope !== undefined && input.scope !== null && { scope: input.scope }),
        ...(input.roleNameKo !== undefined && { roleNameKo: input.roleNameKo }),
        ...(input.roleNameEn !== undefined && { roleNameEn: input.roleNameEn }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.descriptionKo !== undefined && { descriptionKo: input.descriptionKo }),
        ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
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

  // 한국어: deleteRole()은 역할을 삭제합니다. 시스템 역할이거나 활성 사용자가 있으면 삭제할 수 없습니다.
  // Tiếng Việt: deleteRole() xoá vai trò. Không xoá được nếu là vai trò hệ thống hoặc còn người dùng active.
  async deleteRole(actor: { userType: string; userId: string }, id: string) {
    const before = await this.findRoleById(id);
    if (before.isSystem) {
      throw new DomainError({ code: 'SYSTEM_ROLE_READONLY', params: { roleCode: before.roleCode } });
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
    const uniqueUsers: Array<{ userType: string; userId: string }> = [];
    const seen = new Set<string>();
    for (const u of users) {
      const k = `${u.userType}|${u.userId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      uniqueUsers.push(u);
    }

    const batchSize = 25;
    for (let index = 0; index < uniqueUsers.length; index += batchSize) {
      const batch = uniqueUsers.slice(index, index + batchSize);
      await Promise.all(batch.map((user) => this.invalidate(user.userType, user.userId)));
    }
  }

  // ───────────────────────────────────────── UserRoleAssignment

  // 한국어: assignRole()은 사용자에게 역할을 할당합니다.
  //   중요한 검증 3가지:
  //   1) 축 충돌 검사: BrandHQ 트리(대리점/브랜드/지점)와 Corporate(고객사)는 동시에 지정할 수 없습니다.
  //      예: scopeBrandHqId와 scopeCorporateId를 동시에 넣으면 에러
  //   2) 역할 scope 일치 검사: Role의 scope(예: 'BRAND_HQ')와 실제 전달된 scope 축이 맞아야 합니다.
  //      예: scope='CORPORATE'인 역할에 scopeBrandHqId만 넘기면 에러
  //   3) 중복 검사: 같은 (사용자, 역할, 4축 scope) 조합이 이미 있으면 에러
  // Tiếng Việt: assignRole() gán vai trò cho người dùng.
  //   3 bước kiểm tra quan trọng:
  //   1) Xung đột trục: BrandHQ (đại lý/thương hiệu/chi nhánh) và Corporate không được kết hợp.
  //   2) Khớp scope: scope của Role (vd: 'BRAND_HQ') phải khớp với trục scope thực tế.
  //   3) Trùng lặp: cùng (user, role, 4 trục scope) đã tồn tại thì báo lỗi.
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

    // 한국어: Role.scope 와 실제로 전달된 scope 축이 일치하는지 검증한다.
    //   예) scope='CORPORATE' 인 Role 에 scopeBrandHqId 만 주는 것을 거절.
    //   PLATFORM scope 는 축을 전혀 받지 않는다 (전역 Role).
    // Tiếng Việt: Kiểm tra trục scope khớp với Role.scope.
    const providedAxis: 'DISTRIBUTOR' | 'BRAND_HQ' | 'BRANCH' | 'CORPORATE' | 'PLATFORM' = input.scopeBranchId
      ? 'BRANCH'
      : input.scopeBrandHqId
        ? 'BRAND_HQ'
        : input.scopeDistributorId
          ? 'DISTRIBUTOR'
          : input.scopeCorporateId
            ? 'CORPORATE'
            : 'PLATFORM';
    const roleScope = role.scope as 'PLATFORM' | 'DISTRIBUTOR' | 'BRAND_HQ' | 'BRANCH' | 'CORPORATE';
    const axisAllowedByRoleScope: Record<typeof roleScope, ReadonlyArray<typeof providedAxis>> = {
      PLATFORM: ['PLATFORM'],
      DISTRIBUTOR: ['DISTRIBUTOR'],
      BRAND_HQ: ['BRAND_HQ', 'BRANCH'],
      BRANCH: ['BRANCH'],
      CORPORATE: ['CORPORATE'],
    };
    const allowed = axisAllowedByRoleScope[roleScope];
    if (!allowed || !allowed.includes(providedAxis)) {
      throw new DomainError({
        code: 'SCOPE_AXIS_MISMATCH',
        params: { roleScope, providedAxis },
      });
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

  // ───────────────────────────────────────── Permission CRUD

  async findPermissionById(id: string) {
    const p = await this.prisma.permission.findUnique({ where: { id } });
    if (!p) throw new DomainError({ code: 'PERMISSION_NOT_FOUND', params: { permissionId: id } });
    return p;
  }

  async createPermission(
    actor: { userType: string; userId: string },
    input: {
      permissionKey: string;
      domain: string;
      name?: string | null;
      nameKo?: string | null;
      nameEn?: string | null;
      description?: string | null;
      descriptionKo?: string | null;
      descriptionEn?: string | null;
    },
  ) {
    const created = await this.prisma.permission.create({
      data: {
        permissionKey: input.permissionKey,
        domain: input.domain,
        name: input.name ?? null,
        nameKo: input.nameKo ?? null,
        nameEn: input.nameEn ?? null,
        description: input.description ?? null,
        descriptionKo: input.descriptionKo ?? null,
        descriptionEn: input.descriptionEn ?? null,
        isSystem: false,
      },
    });
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_PERMISSION_CREATE',
      targetType: 'Permission',
      targetId: created.id,
      afterDataJson: created as unknown as Record<string, unknown>,
    });
    return created;
  }

  async updatePermission(
    actor: { userType: string; userId: string },
    id: string,
    input: {
      domain?: string | null;
      name?: string | null;
      nameKo?: string | null;
      nameEn?: string | null;
      description?: string | null;
      descriptionKo?: string | null;
      descriptionEn?: string | null;
    },
  ) {
    const before = await this.findPermissionById(id);
    if (before.isSystem) {
      throw new DomainError({ code: 'SYSTEM_PERMISSION_READONLY', params: { permissionKey: before.permissionKey } });
    }
    const updated = await this.prisma.permission.update({
      where: { id },
      data: {
        ...(input.domain !== undefined && input.domain !== null && { domain: input.domain }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameKo !== undefined && { nameKo: input.nameKo }),
        ...(input.nameEn !== undefined && { nameEn: input.nameEn }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.descriptionKo !== undefined && { descriptionKo: input.descriptionKo }),
        ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn }),
      },
    });
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_PERMISSION_UPDATE',
      targetType: 'Permission',
      targetId: id,
      beforeDataJson: before as unknown as Record<string, unknown>,
      afterDataJson: updated as unknown as Record<string, unknown>,
    });
    return updated;
  }

  async deletePermission(
    actor: { userType: string; userId: string },
    id: string,
  ) {
    const before = await this.findPermissionById(id);
    if (before.isSystem) {
      throw new DomainError({ code: 'SYSTEM_PERMISSION_READONLY', params: { permissionKey: before.permissionKey } });
    }
    const refCount = await this.prisma.rolePermission.count({ where: { permissionId: id } });
    if (refCount > 0) {
      throw new DomainError({ code: 'RESOURCE_CONFLICT', params: { resource: 'Permission', refCount } });
    }
    await this.prisma.permission.delete({ where: { id } });
    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_PERMISSION_DELETE',
      targetType: 'Permission',
      targetId: id,
      beforeDataJson: before as unknown as Record<string, unknown>,
    });
    return true;
  }

  // ── 메뉴 기반 권한 시스템 (JSON 배열 방식) ──

  getPermissionCategories() {
    const { PERMISSION_CATEGORIES } = require('./permissionDefinitions');
    return PERMISSION_CATEGORIES;
  }

  getMenuPermissionStructure() {
    const { MENU_PERMISSION_STRUCTURE } = require('./permissionDefinitions');
    return MENU_PERMISSION_STRUCTURE;
  }

  async updateRolePermissions(
    actor: { userType: string; userId: string },
    roleId: string,
    permissions: string[],
  ) {
    const before = await this.findRoleById(roleId);
    if (before.isSystem) {
      throw new DomainError({ code: 'SYSTEM_ROLE_READONLY', params: { roleCode: before.roleCode } });
    }

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions,
        permissionVersion: { increment: 1 },
      },
    });

    await this.invalidateRoleAssignedUsers(roleId);

    await this.audit.log({
      actorType: actor.userType,
      actorId: actor.userId,
      actionType: 'RBAC_ROLE_PERMISSIONS_UPDATE',
      targetType: 'Role',
      targetId: roleId,
      beforeDataJson: { permissions: before.permissions },
      afterDataJson: { permissions: updated.permissions },
    });

    return updated;
  }

  // 한국어: checkWithWildcard()는 Role.permissions JSON 배열 방식의 권한 확인 메서드입니다.
  //   Role 테이블에 permissions 컬럼이 JSON 배열(예: ["dashboard:view", "brands:*"])로 저장되어 있을 때,
  //   matchPermission()을 사용하여 와일드카드를 포함한 권한 매칭을 수행합니다.
  // Tiếng Việt: checkWithWildcard() kiểm tra quyền từ mảng JSON trong Role.permissions.
  //   Khi cột permissions lưu dạng JSON (vd: ["dashboard:view", "brands:*"]),
  //   dùng matchPermission() để kiểm tra bao gồm cả ký tự đại diện (*).
  checkWithWildcard(permissions: unknown, key: string): boolean {
    const perms = Array.isArray(permissions) ? permissions as string[] : [];
    const { matchPermission } = require('./permissionDefinitions');
    return matchPermission(perms, key);
  }
}
