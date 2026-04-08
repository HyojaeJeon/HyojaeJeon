/**
 * 한국어: PermissionResolver — RBAC 관리 GraphQL 엔드포인트.
 *   PLATFORM_SUPER_ADMIN 만 grant/revoke 가능. 조회는 SUPPORT_ENGINEER 까지 허용.
 * Tiếng Việt: GraphQL resolver cho quản lý RBAC.
 */
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@core/auth/guards/gql-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/current-user.decorator';
import { PermissionService } from '@core/rbac/permission.service';
import { PermissionModel } from './models/permission.model';
import { RoleModel } from './models/role.model';
import { UserRoleAssignmentModel } from './models/user-role-assignment.model';
import {
  BooleanResponse,
  StringListResponse,
  createListResponse,
  createObjectResponse,
} from '@core/response/operation-response.factory';

const ctxFromUser = (u: JwtPayload) => ({
  userType: u.userType,
  userId: u.sub,
});

const PermissionModel__ListResp = createListResponse(PermissionModel, 'PermissionModelListResponse');
const RoleModel__ListResp = createListResponse(RoleModel, 'RoleModelListResponse');
const RoleModel__Resp = createObjectResponse(RoleModel, 'RoleModelResponse');
const UserRoleAssignmentModel__ListResp = createListResponse(UserRoleAssignmentModel, 'UserRoleAssignmentModelListResponse');
const UserRoleAssignmentModel__Resp = createObjectResponse(UserRoleAssignmentModel, 'UserRoleAssignmentModelResponse');

@Resolver()

export class PermissionResolver {
  constructor(private readonly service: PermissionService) {}

  @Query(() => PermissionModel__ListResp, { name: 'rbacPermissions' })
  @RequirePermission('platform.rbac.read')
  async listPermissions() {
    return this.service.listPermissions();
  }

  @Query(() => RoleModel__ListResp, { name: 'rbacRoles' })
  @RequirePermission('platform.rbac.read')
  async listRoles() {
    return this.service.listRoles();
  }

  @Query(() => StringListResponse, { name: 'rbacEffectivePermissions' })
  @RequirePermission('platform.rbac.read')
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
  @RequirePermission('platform.rbac.read')
  async listUserAssignments(
    @Args('userType') userType: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    return this.service.listUserAssignments(userType, userId);
  }

  @Mutation(() => UserRoleAssignmentModel__Resp)
  @RequirePermission('platform.rbac.write')
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
  @RequirePermission('platform.rbac.write')
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
  @RequirePermission('platform.rbac.read')
  async rbacRolePermissions(
    @Args('roleId', { type: () => ID }) roleId: string,
  ): Promise<PermissionModel[]> {
    const rows = await this.service.listRolePermissions(roleId);
    return rows.map((rp) => rp.permission as unknown as PermissionModel);
  }

  @Mutation(() => RoleModel__Resp)
  @RequirePermission('platform.rbac.write')
  async rbacCreateRole(
    @Args('roleCode') roleCode: string,
    @Args('roleName') roleName: string,
    @Args('scope') scope: string,
    @Args('hierarchyLevel', { type: () => Int, nullable: true }) hierarchyLevel: number | null,
    @Args('description', { nullable: true }) description: string | null,
    @CurrentUser() user: JwtPayload,
  ): Promise<RoleModel> {
    const created = await this.service.createRole(
      { userType: user.userType, userId: user.sub },
      { roleCode, roleName, scope, hierarchyLevel: hierarchyLevel ?? 0, description },
    );
    return created as unknown as RoleModel;
  }

  @Mutation(() => RoleModel__Resp)
  @RequirePermission('platform.rbac.write')
  async rbacUpdateRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('roleName', { nullable: true }) roleName: string | null,
    @Args('scope', { nullable: true }) scope: string | null,
    @Args('hierarchyLevel', { type: () => Int, nullable: true }) hierarchyLevel: number | null,
    @Args('description', { nullable: true }) description: string | null,
    @CurrentUser() user: JwtPayload,
  ): Promise<RoleModel> {
    const updated = await this.service.updateRole(
      { userType: user.userType, userId: user.sub },
      id,
      {
        roleName: roleName ?? undefined,
        scope: scope ?? undefined,
        hierarchyLevel: hierarchyLevel ?? undefined,
        description: description ?? undefined,
      },
    );
    return updated as unknown as RoleModel;
  }

  @Mutation(() => BooleanResponse)
  @RequirePermission('platform.rbac.write')
  async rbacDeleteRole(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.service.deleteRole(
      { userType: user.userType, userId: user.sub },
      id,
    );
  }

  @Mutation(() => BooleanResponse)
  @RequirePermission('platform.rbac.write')
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
  @RequirePermission('platform.rbac.write')
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
}
