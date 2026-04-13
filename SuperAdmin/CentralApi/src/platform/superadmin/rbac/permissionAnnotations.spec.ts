/**
 * 한국어: 회귀 테스트 — 주요 admin resolver 의 모든 Mutation 핸들러에 권한 데코레이터가 부착되어
 *   있는지 메타데이터 기반으로 검사한다. 향후 resolver 에 Mutation 을 추가하면서 권한 키를 빼먹는
 *   실수를 CI 단에서 차단한다.
 *
 *   P2-8: 본 테스트는 platform resolver 들을 import 하므로, 위치도 platform 하위가 맞다.
 *         (core 에 두면 core → platform 경계 위반)
 *
 * Tiếng Việt: Kiểm thử hồi quy — mọi mutation phải có @RequirePermission, @SelfAction, hoặc @Public.
 */
import { REQUIRE_PERMISSIONS_KEY } from '@core/rbac/decorators/RequirePermission.decorator';
import { SELF_ACTION_KEY } from '@core/rbac/decorators/SelfAction.decorator';
import { IS_PUBLIC_KEY } from '@core/auth/decorators/Public.decorator';

import { AuthResolver } from '@platform/superadmin/auth/Auth.resolver';
import { PermissionResolver } from '@platform/superadmin/rbac/Permission.resolver';
import { DistributorResolver } from '@platform/distributor/profile/Distributor.resolver';
import { BrandResolver } from '@platform/brand/profile/Brand.resolver';
import { BranchResolver } from '@platform/branch/profile/Branch.resolver';
import { MenuCategoryResolver } from '@platform/brand/catalog/menuCategory/MenuCategory.resolver';
import { MenuItemResolver } from '@platform/brand/catalog/menuItem/MenuItem.resolver';
import { PricePolicyResolver } from '@platform/brand/catalog/pricePolicy/PricePolicy.resolver';
import { PromotionResolver } from '@platform/brand/catalog/promotion/Promotion.resolver';
import { EdgePosResolver } from '@platform/edgePos/EdgePos.resolver';
import { MealCorporateResolver } from '@platform/corporate/profile/Corporate.resolver';
import { MealMerchantResolver } from '@platform/corporate/merchant/Merchant.resolver';
import { MealPolicyResolver } from '@platform/corporate/policy/Policy.resolver';
import { MealSettlementResolver } from '@platform/corporate/settlement/Settlement.resolver';
import { MealWalletResolver } from '@platform/corporate/wallet/Wallet.resolver';
import { MealTransactionResolver } from '@platform/corporate/transaction/Transaction.resolver';
import { EInvoiceResolver } from '@shared/einvoice/Einvoice.resolver';

// 한국어: 각 resolver 의 "mutation 으로 분류되는 메서드" 화이트리스트.
//   reflect-metadata 만으로 Nest 의 @Mutation vs @Query 를 구분하기 어려우므로, 이 리스트에
//   어떤 메서드가 mutation 인지 명시한다. 리스트는 리뷰에서 언급된 리졸버들을 커버한다.
const MUTATION_METHODS: Array<{ name: string; ctor: any; methods: string[] }> = [
  { name: 'AuthResolver', ctor: AuthResolver, methods: [
    'login', 'createAuthAccount', 'updateAuthAccount', 'deleteAuthAccount', 'changePassword',
  ] },
  { name: 'PermissionResolver', ctor: PermissionResolver, methods: [
    'rbacAssignRole', 'rbacRevokeRoleAssignment',
    'rbacCreateRole', 'rbacUpdateRole', 'rbacDeleteRole',
    'rbacAddPermissionToRole', 'rbacRemovePermissionFromRole',
  ] },
  { name: 'DistributorResolver', ctor: DistributorResolver, methods: [
    'createDistributor', 'updateDistributor', 'deleteDistributor',
  ] },
  { name: 'BrandResolver', ctor: BrandResolver, methods: [
    'createBrand', 'updateBrand', 'deleteBrand',
  ] },
  { name: 'BranchResolver', ctor: BranchResolver, methods: [
    'createBranch', 'updateBranch', 'deleteBranch',
  ] },
  { name: 'MenuCategoryResolver', ctor: MenuCategoryResolver, methods: [
    'createMenuCategory', 'updateMenuCategory', 'deleteMenuCategory',
  ] },
  { name: 'MenuItemResolver', ctor: MenuItemResolver, methods: [
    'createMenuItem', 'updateMenuItem', 'deleteMenuItem',
  ] },
  { name: 'PricePolicyResolver', ctor: PricePolicyResolver, methods: [
    'deletePricePolicy',
  ] },
  { name: 'PromotionResolver', ctor: PromotionResolver, methods: [
    'deletePromotion',
  ] },
  { name: 'EdgePosResolver', ctor: EdgePosResolver, methods: [
    'registerEdgePos', 'updateEdgePosStatus', 'deleteEdgePos',
  ] },
  { name: 'MealCorporateResolver', ctor: MealCorporateResolver, methods: [
    'mealCorporateCreate', 'mealCorporateUpdate', 'mealCorporateDelete',
    'mealDepartmentCreate', 'mealEmployeeCreate',
  ] },
  { name: 'MealMerchantResolver', ctor: MealMerchantResolver, methods: [
    'mealMerchantEnroll', 'mealMerchantActivate', 'mealMerchantDeactivate',
    'mealMerchantSetCommission', 'mealMerchantSetSettlementAccount',
  ] },
  { name: 'MealPolicyResolver', ctor: MealPolicyResolver, methods: [
    'mealPolicyCreate', 'mealPolicyDelete',
  ] },
  { name: 'MealSettlementResolver', ctor: MealSettlementResolver, methods: [
    'mealSettlementRunBatch', 'mealSettlementMarkPaid',
  ] },
  { name: 'MealWalletResolver', ctor: MealWalletResolver, methods: [
    'mealWalletCreate', 'mealWalletFund', 'mealWalletTopUp',
  ] },
  { name: 'MealTransactionResolver', ctor: MealTransactionResolver, methods: [
    'mealTransactionAuthorize', 'mealTransactionReverse',
  ] },
  { name: 'EInvoiceResolver', ctor: EInvoiceResolver, methods: [
    'eInvoiceGenerate', 'eInvoiceRequestIssuance', 'eInvoiceDispute',
    'eInvoiceSubmitForIssuance', 'updateEinvoiceProviderConfig',
    'toggleEinvoiceProvider', 'updateEinvoiceProviderCredentials',
  ] },
];

function hasGuardMeta(ctor: any, method: string): { ok: boolean; reason: string } {
  const target = ctor.prototype[method];
  if (!target) return { ok: false, reason: 'method not found on prototype' };

  const required = Reflect.getMetadata(REQUIRE_PERMISSIONS_KEY, target);
  const selfAction = Reflect.getMetadata(SELF_ACTION_KEY, target);
  const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, target);

  if (Array.isArray(required) && required.length > 0) return { ok: true, reason: '@RequirePermission' };
  if (selfAction === true) return { ok: true, reason: '@SelfAction' };
  if (isPublic === true) return { ok: true, reason: '@Public' };
  return { ok: false, reason: 'no @RequirePermission / @SelfAction / @Public' };
}

describe('PermissionGuard fail-closed regression — resolver mutation annotations', () => {
  for (const group of MUTATION_METHODS) {
    describe(group.name, () => {
      for (const method of group.methods) {
        it(`${method} has guard annotation`, () => {
          const { ok, reason } = hasGuardMeta(group.ctor, method);
          if (!ok) {
            throw new Error(`${group.name}.${method}: ${reason}`);
          }
        });
      }
    });
  }
});
