/**
 * 한국어: MealWallet allowance ledger helper.
 *   - companyAllowanceVnd: 회사 지원금 / 회사 예산
 *   - personalTopUpVnd: 개인 추가 충전
 *   - balanceVnd: 두 버킷의 합계
 *
 *   기존 legacy row 는 bucket 필드가 비어 있을 수 있으므로,
 *   companyAllowanceVnd 가 0 이고 personalTopUpVnd 가 0 이며 balanceVnd > 0 이면
 *   balanceVnd 전체를 회사 지원금으로 간주한다.
 */

export const COMPANY_ALLOWANCE_SOURCE_TYPE = 'COMPANY_ALLOWANCE' as const;
export const PERSONAL_TOP_UP_SOURCE_TYPE = 'PERSONAL_TOP_UP' as const;

export type MealWalletFundingSourceType =
  | typeof COMPANY_ALLOWANCE_SOURCE_TYPE
  | typeof PERSONAL_TOP_UP_SOURCE_TYPE;

export interface MealWalletFundingState {
  balanceVnd: bigint;
  companyAllowanceVnd?: bigint | null;
  personalTopUpVnd?: bigint | null;
}

export interface MealWalletNormalizedFundingState {
  balanceVnd: bigint;
  companyAllowanceVnd: bigint;
  personalTopUpVnd: bigint;
}

export interface MealWalletSpendAllocation extends MealWalletNormalizedFundingState {
  companyShareVnd: bigint;
  employeeShareVnd: bigint;
}

export function normalizeMealWalletFundingState(
  state: MealWalletFundingState,
): MealWalletNormalizedFundingState {
  const companyAllowanceVnd = state.companyAllowanceVnd ?? 0n;
  const personalTopUpVnd = state.personalTopUpVnd ?? 0n;

  if (companyAllowanceVnd === 0n && personalTopUpVnd === 0n && state.balanceVnd > 0n) {
    return {
      balanceVnd: state.balanceVnd,
      companyAllowanceVnd: state.balanceVnd,
      personalTopUpVnd: 0n,
    };
  }

  return {
    balanceVnd: state.balanceVnd,
    companyAllowanceVnd,
    personalTopUpVnd,
  };
}

export function applyMealWalletFunding(
  state: MealWalletFundingState,
  amountVnd: bigint,
  sourceType: MealWalletFundingSourceType,
): MealWalletNormalizedFundingState {
  const normalized = normalizeMealWalletFundingState(state);

  if (sourceType === PERSONAL_TOP_UP_SOURCE_TYPE) {
    return {
      balanceVnd: normalized.balanceVnd + amountVnd,
      companyAllowanceVnd: normalized.companyAllowanceVnd,
      personalTopUpVnd: normalized.personalTopUpVnd + amountVnd,
    };
  }

  return {
    balanceVnd: normalized.balanceVnd + amountVnd,
    companyAllowanceVnd: normalized.companyAllowanceVnd + amountVnd,
    personalTopUpVnd: normalized.personalTopUpVnd,
  };
}

export function allocateMealWalletSpend(
  state: MealWalletFundingState,
  amountVnd: bigint,
  allowSplitPayment: boolean,
): MealWalletSpendAllocation | null {
  const normalized = normalizeMealWalletFundingState(state);
  const totalAvailable = normalized.companyAllowanceVnd + normalized.personalTopUpVnd;

  if (amountVnd > totalAvailable) return null;

  if (amountVnd <= normalized.companyAllowanceVnd) {
    return {
      ...normalized,
      companyShareVnd: amountVnd,
      employeeShareVnd: 0n,
      balanceVnd: normalized.balanceVnd - amountVnd,
      companyAllowanceVnd: normalized.companyAllowanceVnd - amountVnd,
      personalTopUpVnd: normalized.personalTopUpVnd,
    };
  }

  if (!allowSplitPayment) return null;

  const companyShareVnd = normalized.companyAllowanceVnd;
  const employeeShareVnd = amountVnd - companyShareVnd;

  if (employeeShareVnd > normalized.personalTopUpVnd) return null;

  return {
    ...normalized,
    companyShareVnd,
    employeeShareVnd,
    balanceVnd: normalized.balanceVnd - amountVnd,
    companyAllowanceVnd: 0n,
    personalTopUpVnd: normalized.personalTopUpVnd - employeeShareVnd,
  };
}

export function restoreMealWalletSpend(
  state: MealWalletFundingState,
  companyShareVnd: bigint,
  employeeShareVnd: bigint,
): MealWalletNormalizedFundingState {
  const normalized = normalizeMealWalletFundingState(state);
  return {
    balanceVnd: normalized.balanceVnd + companyShareVnd + employeeShareVnd,
    companyAllowanceVnd: normalized.companyAllowanceVnd + companyShareVnd,
    personalTopUpVnd: normalized.personalTopUpVnd + employeeShareVnd,
  };
}
