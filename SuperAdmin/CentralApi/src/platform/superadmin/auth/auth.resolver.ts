/**
 * 한국어: 통합 인증 GraphQL 리졸버.
 *   모든 계정 유형의 로그인, 조회, 생성, 수정, 삭제, 비밀번호 변경을 다룬다.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './models/auth-payload.model';
import { AuthAccountModel } from './models/auth-account.model';
import { LoginInput } from './dto/login.input';
import { CreateAuthAccountInput } from './dto/create-user.input';
import { UpdateAuthAccountInput } from './dto/update-user.input';
import { PaginationArgs } from '@core/graphql/pagination/pagination.args';
import { CurrentUser, JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { Public } from '@core/auth/decorators/public.decorator';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { SelfAction } from '@core/rbac/decorators/self-action.decorator';
import { AuthUserType } from '@core/auth/constants/user-types.constant';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/operation-response.factory';
import { DomainError } from '@core/errors/domain-error';

const AuthAccountModel__ListResp = createListResponse(AuthAccountModel, 'AuthAccountModelListResponse');
const AuthAccountModel__Resp = createObjectResponse(AuthAccountModel, 'AuthAccountModelResponse');
const AuthPayload__Resp = createObjectResponse(AuthPayload, 'AuthPayloadResponse');

@Resolver(() => AuthAccountModel)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload__Resp)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Query(() => AuthAccountModel__Resp)
  async me(@CurrentUser() user: JwtPayload): Promise<AuthAccountModel> {
    const found = await this.authService.findById(user.sub, user.userType);
    if (!found) throw new DomainError({ code: 'USER_NOT_FOUND', params: { resource: 'User' } });
    return found;
  }

  @RequirePermission('platform.user.read')
  @Query(() => AuthAccountModel__ListResp)
  async authAccounts(
    @Args('userType', { nullable: true }) userType: string | null,
    @Args() pagination: PaginationArgs,
  ): Promise<AuthAccountModel[]> {
    return this.authService.findAll(pagination.skip, pagination.take, userType ?? undefined);
  }

  @RequirePermission('platform.user.read')
  @Query(() => AuthAccountModel__Resp, { nullable: true })
  async authAccount(
    @Args('userType') userType: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AuthAccountModel | null> {
    return this.authService.findById(id, userType);
  }

  @RequirePermission('platform.user.write')
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

  @RequirePermission('platform.user.write')
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

  @RequirePermission('platform.user.write')
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
