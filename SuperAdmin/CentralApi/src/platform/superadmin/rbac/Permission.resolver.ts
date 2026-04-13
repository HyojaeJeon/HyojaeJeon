/**
 * 한국어: PermissionResolver — RBAC 관리 GraphQL 엔드포인트.
 *   PLATFORM_SUPER_ADMIN 만 grant/revoke 가능. 조회는 SUPPORT_ENGINEER 까지 허용.
 * Tiếng Việt: GraphQL resolver cho quản lý RBAC.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@core/auth/guards/GqlAuth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { PermissionService } from '@core/rbac/Permission.service';
import { PermissionModel } from './models/Permission.model';
import { RoleModel } from './models/Role.model';
import { CreateRoleInput } from './dto/CreateRole.input';
import { UpdateRoleInput } from './dto/UpdateRole.input';
import { CreatePermissionInput } from './dto/CreatePermission.input';
import { UpdatePermissionInput } from './dto/UpdatePermission.input';
import { UserRoleAssignmentModel } from './models/UserRoleAssignment.model';
import { RolePermissionPairModel } from './models/RolePermissionPair.model';
import { PermissionCatalogModel } from './models/PermissionCatalog.model';
import {
  BooleanResponse,
  StringListResponse,
  createListResponse,
  createObjectResponse,
} from '@core/response/OperationResponse.factory';

const ctxFromUser = (u: JwtPayload) => ({
  userType: u.userType,
  userId: u.sub,
});

const PermissionModel__ListResp = createListResponse(PermissionModel, 'PermissionModelListResponse');
const PermissionModel__Resp = createObjectResponse(PermissionModel, 'PermissionModelResponse');
const RoleModel__ListResp = createListResponse(RoleModel, 'RoleModelListResponse');
const RoleModel__Resp = createObjectResponse(RoleModel, 'RoleModelResponse');
const UserRoleAssignmentModel__ListResp = createListResponse(UserRoleAssignmentModel, 'UserRoleAssignmentModelListResponse');
const UserRoleAssignmentModel__Resp = createObjectResponse(UserRoleAssignmentModel, 'UserRoleAssignmentModelResponse');
const RolePermissionPairModel__ListResp = createListResponse(RolePermissionPairModel, 'RolePermissionPairModelListResponse');
const PermissionCatalogModel__Resp = createObjectResponse(PermissionCatalogModel, 'PermissionCatalogResponse');

@Resolver()

export class PermissionResolver {
  constructor(private readonly service: PermissionService) {}

  @Query(() => PermissionModel__ListResp, { name: 'rbacPermissions' })
  @RequirePermission('roles:list')
  async listPermissions() {
    return this.service.listPermissions();
  }

  @Query(() => RoleModel__ListResp, { name: 'rbacRoles' })
  @RequirePermission('roles:list')
  async listRoles() {
    return this.service.listRoles();
  }

  @Query(() => StringListResponse, { name: 'rbacEffectivePermissions' })
  @RequirePermission('roles:list')
  async effectivePermissions(
    @Args('userType') userType: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('brandHqId', { type: () => ID, nullable: true }) brandHqId: string | null,
    @Args('branchId', { type: () => ID, nullable: true }) branchId: string | null,
    @Args('corporateId', { type: () => ID, nullable: true }) corporateId: string | null,
  ) {
    const set = await this.service.getEffectivePermissions({
      userType,
      userId,
      brandHqId: brandHqId ?? null,
      branchId: branchId ?? null,
      corporateId: corporateId ?? null,
    });
    return Array.from(set);
  }

  @Query(() => UserRoleAssignmentModel__ListResp, { name: 'rbacUserAssignments' })
  @RequirePermission('roles:list')
  async listUserAssignments(
    @Args('userType') userType: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    return this.service.listUserAssignments(userType, userId);
  }

  @Mutation(() => UserRoleAssignmentModel__Resp)
  @RequirePermission('roles:update')
  async rbacAssignRole(
    @Args('userType') userType: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roleCode') roleCode: string,
    @Args('scopeDistributorId', { type: () => ID, nullable: true }) scopeDistributorId: string | null,
    @Args('scopeBrandHqId', { type: () => ID, nullable: true }) scopeBrandHqId: string | null,
    @Args('scopeCorporateId', { type: () => ID, nullable: true }) scopeCorporateId: string | null,
    @Args('scopeBranchId', { type: () => ID, nullable: true }) scopeBranchId: string | null,
    @Args('expiresAt', { type: () => Date, nullable: true }) expiresAt: Date | null,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.assignRole(ctxFromUser(user), {
      userType,
      userId,
      roleCode,
      scopeDistributorId,
      scopeBrandHqId,
      scopeCorporateId,
      scopeBranchId,
      expiresAt,
    });
  }

  @Mutation(() => UserRoleAssignmentModel__Resp)
  @RequirePermission('roles:update')
  async rbacRevokeRoleAssignment(
    @Args('assignmentId', { type: () => ID }) assignmentId: string,
    @Args('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.revokeRoleAssignment(
      ctxFromUser(user),
      assignmentId,
      reason,
    );
  }

  // ─────────────── Role / RolePermission CRUD (Super Admin Portal UI 계약) ───────────────

  @Query(() => PermissionModel__ListResp, { name: 'rbacRolePermissions' })
  @RequirePermission('roles:list')
  async rbacRolePermissions(
    @Args('roleId', { type: () => ID }) roleId: string,
  ): Promise<PermissionModel[]> {
    const rows = await this.service.listRolePermissions(roleId);
    return rows.map((rp) => rp.permission as unknown as PermissionModel);
  }

  /**
   * 한국어: Matrix 탭 bulk fetch — scope 내 모든 (roleId, permissionId) pair.
   * Tiếng Việt: Nạp hàng loạt cho tab Matrix.
   */
  @Query(() => RolePermissionPairModel__ListResp, { name: 'rbacRolePermissionsMatrix' })
  @RequirePermission('roles:list')
  async rbacRolePermissionsMatrix(
    @Args('scope') scope: string,
  ): Promise<RolePermissionPairModel[]> {
    const rows = await this.service.getRolePermissionsMatrix(scope);
    return rows.map((r) => ({ roleId: r.roleId, permissionId: r.permissionId }));
  }

  @Mutation(() => RoleModel__Resp, { name: 'rbacCreateRole' })
  @RequirePermission('roles:update')
  async rbacCreateRole(
    @Args('input') input: CreateRoleInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<RoleModel> {
    const created = await this.service.createRole(
      { userType: user.userType, userId: user.sub },
      input,
    );
    return created as unknown as RoleModel;
  }

  @Mutation(() => RoleModel__Resp, { name: 'rbacUpdateRole' })
  @RequirePermission('roles:update')
  async rbacUpdateRole(
    @Args('input') input: UpdateRoleInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<RoleModel> {
    const { roleId, ...rest } = input;
    const updated = await this.service.updateRole(
      { userType: user.userType, userId: user.sub },
      roleId,
      rest,
    );
    return updated as unknown as RoleModel;
  }

  @Mutation(() => BooleanResponse, { name: 'rbacDeleteRole' })
  @RequirePermission('roles:update')
  async rbacDeleteRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.service.deleteRole(
      { userType: user.userType, userId: user.sub },
      roleId,
    );
  }

  @Mutation(() => PermissionModel__Resp, { name: 'rbacCreatePermission' })
  @RequirePermission('roles:update')
  async rbacCreatePermission(
    @Args('input') input: CreatePermissionInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<PermissionModel> {
    const created = await this.service.createPermission(
      { userType: user.userType, userId: user.sub },
      input,
    );
    return created as unknown as PermissionModel;
  }

  @Mutation(() => PermissionModel__Resp, { name: 'rbacUpdatePermission' })
  @RequirePermission('roles:update')
  async rbacUpdatePermission(
    @Args('input') input: UpdatePermissionInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<PermissionModel> {
    const { permissionId, ...rest } = input;
    const updated = await this.service.updatePermission(
      { userType: user.userType, userId: user.sub },
      permissionId,
      rest,
    );
    return updated as unknown as PermissionModel;
  }

  @Mutation(() => BooleanResponse, { name: 'rbacDeletePermission' })
  @RequirePermission('roles:update')
  async rbacDeletePermission(
    @Args('permissionId', { type: () => ID }) permissionId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.service.deletePermission(
      { userType: user.userType, userId: user.sub },
      permissionId,
    );
  }

  @Mutation(() => BooleanResponse)
  @RequirePermission('roles:update')
  async rbacAddPermissionToRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionKey') permissionKey: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    await this.service.addPermissionToRole(
      { userType: user.userType, userId: user.sub },
      roleId,
      permissionKey,
    );
    return true;
  }

  @Mutation(() => BooleanResponse)
  @RequirePermission('roles:update')
  async rbacRemovePermissionFromRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissionKey') permissionKey: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.service.removePermissionFromRole(
      { userType: user.userType, userId: user.sub },
      roleId,
      permissionKey,
    );
  }

  // ── 메뉴 기반 권한 시스템 ──

  @Query(() => PermissionCatalogModel__Resp, { name: 'permissionCatalog' })
  @RequirePermission('roles:list')
  async permissionCatalog(): Promise<PermissionCatalogModel> {
    return {
      categories: this.service.getPermissionCategories(),
      menuStructure: this.service.getMenuPermissionStructure(),
    } as PermissionCatalogModel;
  }

  @Mutation(() => RoleModel__Resp, { name: 'updateRolePermissions' })
  @RequirePermission('roles:update')
  async updateRolePermissions(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args('permissions', { type: () => [String] }) permissions: string[],
    @CurrentUser() user: JwtPayload,
  ): Promise<RoleModel> {
    const updated = await this.service.updateRolePermissions(
      ctxFromUser(user),
      roleId,
      permissions,
    );
    return updated as unknown as RoleModel;
  }
}
