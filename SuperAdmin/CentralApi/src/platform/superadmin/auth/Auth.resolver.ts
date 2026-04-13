/**
 * 한국어: 통합 인증 GraphQL 리졸버.
 *   모든 계정 유형의 로그인, 조회, 생성, 수정, 삭제, 비밀번호 변경을 다룬다.
 */
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './Auth.service';
import { AuthPayload } from './models/AuthPayload.model';
import { AuthAccountModel } from './models/AuthAccount.model';
import { PermissionService } from '@core/rbac/Permission.service';
import { LoginInput } from './dto/Login.input';
import { CreateAuthAccountInput } from './dto/CreateUser.input';
import { UpdateAuthAccountInput } from './dto/UpdateUser.input';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { Public } from '@core/auth/decorators/Public.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { SelfAction } from '@core/rbac/decorators/SelfAction.decorator';
import { AuthUserType } from '@core/auth/constants/UserTypes.constant';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';
import { DomainError } from '@core/errors/DomainError';
import type { CentralGraphQLContext } from '@core/graphql/loaders/graphqlContext';

const AuthAccountModel__ListResp = createListResponse(AuthAccountModel, 'AuthAccountModelListResponse');
const AuthAccountModel__Resp = createObjectResponse(AuthAccountModel, 'AuthAccountModelResponse');
const AuthPayload__Resp = createObjectResponse(AuthPayload, 'AuthPayloadResponse');

@Resolver(() => AuthAccountModel)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionService,
  ) {}

  @Public()
  @Mutation(() => AuthPayload__Resp)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: CentralGraphQLContext,
  ): Promise<AuthPayload> {
    return this.authService.loginWithSession(input, {
      req: context.req as never,
      reply: context.reply,
      responseCookies: context.responseCookies,
    });
  }

  @Public()
  @Mutation(() => AuthPayload__Resp)
  async refreshSession(@Context() context: CentralGraphQLContext): Promise<AuthPayload> {
    return this.authService.refreshSession({
      req: context.req as never,
      reply: context.reply,
      responseCookies: context.responseCookies,
    });
  }

  @Public()
  @Mutation(() => BooleanResponse)
  async logout(@Context() context: CentralGraphQLContext): Promise<boolean> {
    return this.authService.logoutSession({
      req: context.req as never,
      reply: context.reply,
      responseCookies: context.responseCookies,
    });
  }

  @Mutation(() => BooleanResponse)
  async logoutAllSessions(
    @CurrentUser() user: JwtPayload,
    @Context() context: CentralGraphQLContext,
  ): Promise<boolean> {
    return this.authService.logoutAllSessions(user, {
      req: context.req as never,
      responseCookies: context.responseCookies,
    });
  }

  @Query(() => AuthAccountModel__Resp)
  async me(@CurrentUser() user: JwtPayload): Promise<AuthAccountModel> {
    const found = await this.authService.findById(user.sub, user.userType);
    if (!found) throw new DomainError({ code: 'USER_NOT_FOUND', params: { resource: 'User' } });

    // SuperAdmin 이 CorporatePortal 에서 me 를 호출하면 corporateId 가 null.
    // 같은 loginId 의 CorporateAdminUser 가 있으면 corporateId 를 주입한다.
    if (user.userType === 'SUPER_ADMIN' && !found.corporateId) {
      const linked = await this.authService.findLinkedCorporateId(found.loginId);
      if (linked) found.corporateId = linked;
    }

    const effectivePerms = await this.permissionService.getEffectivePermissions({
      userType: user.userType,
      userId: user.sub,
      brandHqId: found.brandHQId ?? null,
      branchId: null,
      corporateId: found.corporateId ?? null,
    });
    found.permissions = Array.from(effectivePerms);
    return found;
  }

  @RequirePermission('users:list')
  @Query(() => AuthAccountModel__ListResp)
  async authAccounts(
    @Args('userType', { type: () => String, nullable: true }) userType: string | null,
    @Args() pagination: PaginationArgs,
  ) {
    return this.authService.findAll(pagination.skip, pagination.take, userType ?? undefined);
  }

  @RequirePermission('users:list')
  @Query(() => AuthAccountModel__Resp, { nullable: true })
  async authAccount(
    @Args('userType') userType: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AuthAccountModel | null> {
    return this.authService.findById(id, userType);
  }

  @RequirePermission('users:update')
  @Mutation(() => AuthAccountModel__Resp)
  async createAuthAccount(
    @Args('input') input: CreateAuthAccountInput,
    @CurrentUser() actor: JwtPayload,
  ): Promise<AuthAccountModel> {
    return this.authService.create(input, {
      userType: actor.userType,
      userId: actor.sub,
      tenantContext: actor.tenantContext,
    });
  }

  @RequirePermission('users:update')
  @Mutation(() => AuthAccountModel__Resp)
  async updateAuthAccount(
    @Args('userType') userType: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAuthAccountInput,
    @CurrentUser() actor: JwtPayload,
  ): Promise<AuthAccountModel> {
    return this.authService.update(userType as AuthUserType, id, input, {
      userType: actor.userType,
      userId: actor.sub,
      tenantContext: actor.tenantContext,
    });
  }

  @RequirePermission('users:update')
  @Mutation(() => BooleanResponse)
  async deleteAuthAccount(
    @Args('userType') userType: string,
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() actor: JwtPayload,
  ): Promise<boolean> {
    return this.authService.softDelete(userType as AuthUserType, id, {
      userType: actor.userType,
      userId: actor.sub,
      tenantContext: actor.tenantContext,
    });
  }

  @RequirePermission('users:update')
  @Mutation(() => AuthAccountModel__Resp)
  async suspendAuthAccount(
    @Args('userType') userType: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('nextStatus') nextStatus: string,
    @Args('reason', { type: () => String, nullable: true }) reason: string | null,
    @CurrentUser() actor: JwtPayload,
  ): Promise<AuthAccountModel> {
    if (nextStatus !== 'ACTIVE' && nextStatus !== 'SUSPENDED') {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'nextStatus must be ACTIVE or SUSPENDED' } });
    }
    return this.authService.suspendAccount(
      userType as AuthUserType,
      id,
      nextStatus,
      reason,
      {
        userType: actor.userType,
        userId: actor.sub,
        tenantContext: actor.tenantContext,
      },
    );
  }

  @RequirePermission('users:update')
  @Mutation(() => BooleanResponse)
  async resetAuthAccountPassword(
    @Args('userType') userType: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('newPassword') newPassword: string,
    @CurrentUser() actor: JwtPayload,
  ): Promise<boolean> {
    return this.authService.resetAccountPassword(
      userType as AuthUserType,
      id,
      newPassword,
      {
        userType: actor.userType,
        userId: actor.sub,
        tenantContext: actor.tenantContext,
      },
    );
  }

  @SelfAction()
  @Mutation(() => BooleanResponse)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.authService.changePassword(
      user.userType,
      user.sub,
      currentPassword,
      newPassword,
    );
  }
}
