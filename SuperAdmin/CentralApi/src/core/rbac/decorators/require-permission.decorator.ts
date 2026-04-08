/**
 * 한국어: @RequirePermission(...) 데코레이터.
 *   하나 이상의 permissionKey 를 요구한다 (모두 보유해야 통과 — AND 의미).
 *   PermissionGuard 가 메타데이터를 읽어 EvaluationContext 로 검증한다.
 *
 *   사용 예:
 *     @Mutation(() => MealPolicyModel)
 *     @RequirePermission('mealticket.policy.write')
 *     mealPolicyCreate(...) { ... }
 *
 * Tiếng Việt: Decorator @RequirePermission. Yêu cầu sở hữu tất cả permissionKey được liệt kê.
 */
import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

export const RequirePermission = (...permissionKeys: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissionKeys);
