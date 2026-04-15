import { useQuery, useMutation } from '@apollo/client';
import { useAppSelector } from '@store/index';
import { MEAL_EMPLOYEE_QUERY } from '@graphql/queries/employee';
import { MEAL_EMPLOYEE_ASSIGN_BADGE } from '@graphql/mutations/employee';
import type { MockMealEmployee } from '@shared/mock/types';

export function useBadgeLinkData() {
  const employeeId = useAppSelector((s) => s.auth.user?.employeeId ?? null);

  const {
    data: empData,
    loading,
    error,
    refetch,
  } = useQuery(MEAL_EMPLOYEE_QUERY, {
    variables: { id: employeeId! },
    skip: !employeeId,
    fetchPolicy: 'cache-and-network',
  });

  const [assignBadge, { loading: assignLoading, error: assignError }] =
    useMutation(MEAL_EMPLOYEE_ASSIGN_BADGE);

  const employee: MockMealEmployee | null =
    empData?.mealEmployee?.data
      ? mapServerEmployeeToMock(empData.mealEmployee.data)
      : null;

  return {
    employee,
    loading,
    error,
    refetch,
    assignBadge,
    assignLoading,
    assignError,
  };
}

/* ─── Server → Mock shape mapper ─── */

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
