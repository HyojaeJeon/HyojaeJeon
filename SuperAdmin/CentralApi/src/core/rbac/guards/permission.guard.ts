/**
 * 한국어: PermissionGuard — DB 기반 동적 RBAC 가드 (fail-closed).
 *
 *   동작 (Mutation fail-closed):
 *     0. @Public 이면 즉시 통과 (로그인도 필요 없음).
 *     1. JWT 인증된 user 가 없으면 UnauthorizedException.
 *     2. @RequirePermission 이 있으면 PermissionService.has(...) 로 모든 키 AND 검증.
 *     3. @RequirePermission 도 없고 @SelfAction 도 없는 경우:
 *        - Mutation → 즉시 403 (PERMISSION_DECORATOR_MISSING) — fail-closed.
 *        - Query    → 경고 로그만 남기고 통과 (단계적 전환).
 *     4. @SelfAction 이면 permission 키 없이 통과 (service 가 self 여부 재검증).
 *
 *   주의:
 *     - 본 가드는 1차 방어선이며, update/delete 같은 id 기반 mutation 의 target scope 는
 *       service 가 target row 를 lookup 한 뒤 PermissionService.require(...) 로 2차 검증한다.
 *     - 서비스 2차 검증이 원천 진실(source of truth) 이다.
 *
 * Tiếng Việt: Guard RBAC DB fail-closed. Mutation không có decorator = 403 ngay lập tức.
 */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { SELF_ACTION_KEY } from '../decorators/self-action.decorator';
import { IS_PUBLIC_KEY } from '@core/auth/decorators/public.decorator';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import {
  EvaluationContext,
  PermissionService,
} from '@core/rbac/permission.service';
import { DomainError } from '@core/errors/domain-error';

/**
 * args 와 args.input 양쪽에서 4축 scope 키를 추출한다.
 *   - distributorId
 *   - brandHqId / brandHQId (스키마 표기 차이 흡수)
 *   - branchId
 *   - corporateId
 */
function pickScope(args: Record<string, unknown> | undefined): {
  distributorId?: string | null;
  brandHqId?: string | null;
  branchId?: string | null;
  corporateId?: string | null;
} {
  if (!args) return {};
  const out: Record<string, string | null | undefined> = {};
  const visit = (obj: Record<string, unknown>) => {
    if (typeof obj.distributorId === 'string' && !out.distributorId) out.distributorId = obj.distributorId;
    const brand = obj.brandHqId ?? obj.brandHQId;
    if (typeof brand === 'string' && !out.brandHqId) out.brandHqId = brand;
    if (typeof obj.branchId === 'string' && !out.branchId) out.branchId = obj.branchId;
    if (typeof obj.corporateId === 'string' && !out.corporateId) out.corporateId = obj.corporateId;
  };
  visit(args);
  if (args.input && typeof args.input === 'object') {
    visit(args.input as Record<string, unknown>);
  }
  return {
    distributorId: out.distributorId ?? null,
    brandHqId: out.brandHqId ?? null,
    branchId: out.branchId ?? null,
    corporateId: out.corporateId ?? null,
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permission: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const cls = context.getClass();

    // @Public 이면 즉시 통과 (GqlAuthGuard 와 협조).
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, cls]);
    if (isPublic) return true;

    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo<{ operation?: { operation?: 'query' | 'mutation' | 'subscription' }; parentType?: { name?: string }; fieldName?: string }>();
    const opType = info?.operation?.operation ?? (info?.parentType?.name === 'Mutation' ? 'mutation' : 'query');

    const user = ctx.getContext().req?.user as JwtPayload | undefined;
    if (!user) {
      throw new DomainError({ code: 'VALIDATION_ERROR', details: { reason: 'Authentication required' } });
    }

    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [handler, cls],
    );
    const isSelfAction = this.reflector.getAllAndOverride<boolean>(SELF_ACTION_KEY, [handler, cls]);

    if (isSelfAction) {
      // @SelfAction 마커: 서비스가 self 여부를 재검증한다. guard 단에서는 인증만 요구.
      return true;
    }

    if (!required || required.length === 0) {
      // Mutation 은 fail-closed: 권한 데코레이터 미부착 = 즉시 거절.
      if (opType === 'mutation') {
        throw new DomainError({ code: 'PERMISSION_DECORATOR_MISSING', params: { field: info?.fieldName,
          detail: 'Mutation must be annotated with @RequirePermission, @SelfAction, or @Public' } });
      }
      // Query 는 경고만: 단계적 전환 모드.
      this.logger.warn(
        `Query ${info?.parentType?.name ?? '?'}.${info?.fieldName ?? '?'} has no @RequirePermission annotation`,
      );
      return true;
    }

    const args = ctx.getArgs() as Record<string, unknown> | undefined;
    const scopeFromArgs = pickScope(args);

    const evalCtx: EvaluationContext = {
      userType: user.userType,
      userId: user.sub,
      distributorId: scopeFromArgs.distributorId ?? user.tenantContext?.distributorId ?? null,
      brandHqId: scopeFromArgs.brandHqId ?? user.tenantContext?.brandHQId ?? null,
      branchId: scopeFromArgs.branchId ?? user.tenantContext?.branchId ?? null,
      corporateId: scopeFromArgs.corporateId ?? user.tenantContext?.corporateId ?? null,
    };

    for (const key of required) {
      const ok = await this.permission.has(evalCtx, key);
      if (!ok) {
        throw new DomainError({ code: 'PERMISSION_DENIED', params: { permissionKey: key } });
      }
    }
    return true;
  }
}
