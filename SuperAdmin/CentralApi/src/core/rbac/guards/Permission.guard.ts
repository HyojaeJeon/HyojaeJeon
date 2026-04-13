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
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/RequirePermission.decorator';
import { SELF_ACTION_KEY } from '../decorators/SelfAction.decorator';
import { IS_PUBLIC_KEY } from '@core/auth/decorators/Public.decorator';
import { JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import {
  EvaluationContext,
  PermissionService,
} from '@core/rbac/Permission.service';
import { DomainError } from '@core/errors/DomainError';

/**
 * args 와 args.input 양쪽에서 4축 scope 키를 추출한다.
 *   - distributorId
 *   - brandHqId / brandHQId (스키마 표기 차이 흡수)
 *   - branchId
 *   - corporateId
 */
// 한국어: pickScope()는 GraphQL 요청의 인자(args)에서 "scope(범위)" 정보를 추출합니다.
//
//   "scope"란?
//   이 시스템은 멀티테넌트입니다. 하나의 요청이 어떤 조직/브랜드/지점/고객사에 대한 것인지
//   알아야 권한을 정확히 판단할 수 있습니다. 이 4개의 ID를 "4축 scope"라고 부릅니다.
//     - distributorId: 대리점 ID
//     - brandHqId: 브랜드 본사 ID
//     - branchId: 지점 ID
//     - corporateId: 고객사(식권 기업) ID
//
//   왜 args와 args.input 양쪽을 확인하나요?
//   GraphQL Query는 보통 args에 직접 ID를 넘깁니다: query brands(brandHqId: "abc")
//   GraphQL Mutation은 보통 input 객체 안에 ID를 넣습니다: mutation createBrand(input: { brandHqId: "abc" })
//   두 패턴 모두 지원하기 위해 양쪽을 탐색합니다.
//
//   왜 brandHqId와 brandHQId 두 가지를 확인하나요?
//   스키마 설계 과정에서 camelCase 표기가 'brandHqId'와 'brandHQId' 두 가지로 혼재합니다.
//   (HQ를 약어로 보면 대문자, 일반 단어로 보면 소문자)
//   두 표기 모두 호환되도록 양쪽을 확인합니다.
//
// Tiếng Việt: pickScope() trích xuất thông tin "scope (phạm vi)" từ đối số (args) của yêu cầu GraphQL.
//
//   "Scope" là gì?
//   Hệ thống này là multi-tenant. Cần biết yêu cầu thuộc tổ chức/thương hiệu/chi nhánh/khách hàng nào
//   để kiểm tra quyền chính xác. 4 ID này gọi là "4 trục scope":
//     - distributorId: ID nhà phân phối
//     - brandHqId: ID trụ sở thương hiệu
//     - branchId: ID chi nhánh
//     - corporateId: ID khách hàng doanh nghiệp
//
//   Tại sao kiểm tra cả args và args.input?
//   GraphQL Query thường truyền ID trực tiếp: query brands(brandHqId: "abc")
//   GraphQL Mutation thường đặt ID trong object input: mutation createBrand(input: { brandHqId: "abc" })
//   Kiểm tra cả hai để hỗ trợ cả hai kiểu.
//
//   Tại sao kiểm tra cả brandHqId và brandHQId?
//   Trong quá trình thiết kế schema, cách viết camelCase có hai biến thể: 'brandHqId' và 'brandHQId'.
//   Kiểm tra cả hai để đảm bảo tương thích.
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
    const brand = obj.brandHqId ?? obj.brandHQId; // 한국어: 두 가지 표기법 모두 허용 / Tiếng Việt: Chấp nhận cả hai cách viết
    if (typeof brand === 'string' && !out.brandHqId) out.brandHqId = brand;
    if (typeof obj.branchId === 'string' && !out.branchId) out.branchId = obj.branchId;
    if (typeof obj.corporateId === 'string' && !out.corporateId) out.corporateId = obj.corporateId;
  };
  visit(args);                                      // 한국어: 먼저 args 최상위에서 scope 추출 / Tiếng Việt: Trước tiên trích từ args cấp cao nhất
  if (args.input && typeof args.input === 'object') {
    visit(args.input as Record<string, unknown>);    // 한국어: 그 다음 args.input 안에서도 추출 (Mutation용) / Tiếng Việt: Sau đó trích từ args.input (cho Mutation)
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
