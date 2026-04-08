/**
 * 한국어: RBAC 모듈 (Global). PermissionService + PermissionResolver.
 *   기준서 §100.7 권한 계산식의 우변 (User.roles.permissions) 을 제공한다.
 *   다른 도메인 service 는 PermissionService.require(ctx, key) 로 가드한다.
 * Tiếng Việt: Module RBAC.
 */
import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PermissionService } from '@core/rbac/permission.service';
import { PermissionResolver } from './permission.resolver';
import { PermissionGuard } from '@core/rbac/guards/permission.guard';
import { GqlAuthGuard } from '@core/auth/guards/gql-auth.guard';

/**
 * 한국어: RBAC + 인증 글로벌 가드 등록 모듈.
 *
 *   가드 실행 순서 (Nest APP_GUARD 등록 순):
 *     1. GqlAuthGuard       — JWT 검증, req.user 채움. @Public() 메타가 있으면 우회.
 *     2. PermissionGuard    — @RequirePermission(...) 메타가 있는 핸들러만 검증.
 *
 *   이로써 PermissionGuard 는 항상 GqlAuthGuard 이후에 실행되며, req.user 가
 *   채워졌다는 가정이 보장된다.
 *
 *   @Public() 또는 @RequirePermission() 메타데이터가 없는 핸들러는 통과한다.
 */
@Global()
@Module({
  providers: [
    PermissionService,
    PermissionResolver,
    { provide: APP_GUARD, useClass: GqlAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
  exports: [PermissionService],
})
export class RbacModule {}
