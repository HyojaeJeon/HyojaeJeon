import { useQuery } from '@apollo/client';
import { useAppSelector } from '@store/index';
import { MEAL_POLICIES_BY_CORPORATE_QUERY } from '@graphql/queries/policy';
import { MEAL_EMPLOYEE_QUERY } from '@graphql/queries/employee';
import type { MockMealPolicy, MockMealEmployee } from '@shared/mock/types';

export function usePolicyViewData() {
  const corporateId = useAppSelector((s) => s.auth.user?.corporateId ?? null);
  const employeeId = useAppSelector((s) => s.auth.user?.employeeId ?? null);

  /* ── Policies ── */
  const {
    data: policyData,
    loading: policyLoading,
    error: policyError,
    refetch: refetchPolicies,
  } = useQuery(MEAL_POLICIES_BY_CORPORATE_QUERY, {
    variables: { corporateId: corporateId! },
    skip: !corporateId,
    fetchPolicy: 'cache-and-network',
  });

  /* ── Employee (for company name in banner) ── */
  const {
    data: empData,
    loading: empLoading,
    error: empError,
  } = useQuery(MEAL_EMPLOYEE_QUERY, {
    variables: { id: employeeId! },
    skip: !employeeId,
    fetchPolicy: 'cache-and-network',
  });

  const policies: MockMealPolicy[] =
    policyData?.mealPoliciesByCorporate?.data?.map(mapServerPolicyToMock) ??
    [];

  const employee: MockMealEmployee | null =
    empData?.mealEmployee?.data
      ? mapServerEmployeeToMock(empData.mealEmployee.data)
      : null;

  const loading = policyLoading || empLoading;
  const error = policyError || empError;

  return { policies, employee, loading, error, refetchPolicies };
}

/* ─── Server → Mock shape mappers ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServerPolicyToMock(policy: any): MockMealPolicy {
  return {
    id: policy.id,
    name: policy.policyName ?? '',
    nameVi: policy.policyName ?? '',
    status: policy.status ?? 'ACTIVE',
    maxAmountPerTxnVnd: policy.maxPerTransactionVnd ?? 0,
    dailyLimitVnd: policy.dailyLimitVnd ?? 0,
    validFrom: policy.effectiveFrom ?? '',
    validTo: policy.effectiveTo ?? '',
    allowedDays: policy.allowedDayOfWeek ?? [],
    allowedTimeStart: policy.allowedTimeStart ?? '',
    allowedTimeEnd: policy.allowedTimeEnd ?? '',
    mealTypes: policy.allowedMealTypes ?? [],
    hybridPaymentAllowed: policy.allowSplitPayment ?? false,
    merchantCategories: policy.merchantCategoryRestrictions ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServerEmployeeToMock(emp: any): MockMealEmployee {
  return {
    id: emp.id,
    employeeCode: emp.employeeCode ?? '',
    name: emp.fullName ?? '',
    phone: emp.phone ?? '',
    email: emp.email ?? '',
    department: '',
    corporateId: emp.corporateId ?? '',
    corporateName: '',
    rfidBadgeId: emp.badgeRfid ?? null,
    avatarUrl: null,
    languageCode: 'vi',
    biometricType: null,
  };
}
