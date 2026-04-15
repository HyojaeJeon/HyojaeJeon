import { useQuery } from '@apollo/client';
import { useAppSelector } from '@store/index';
import { MEAL_EMPLOYEE_QUERY } from '@graphql/queries/employee';
import type { MockMealEmployee } from '@shared/mock/types';

export function useSettingsData() {
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

  const employee: MockMealEmployee | null =
    empData?.mealEmployee?.data
      ? mapServerEmployeeToMock(empData.mealEmployee.data)
      : null;

  return { employee, loading, error, refetch };
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
