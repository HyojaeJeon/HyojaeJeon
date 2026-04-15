import { useQuery } from '@apollo/client';
import { MEAL_MERCHANT_ENROLLMENT_QUERY } from '@graphql/queries/merchant';
import { MEAL_POLICIES_BY_CORPORATE_QUERY } from '@graphql/queries/policy';
/**
 * [KO] 가맹점 상세 화면의 데이터 훅
 * [VI] Hook du lieu cho man hinh chi tiet quan an
 *
 * - enrollment 단건 + 기업 정책 목록을 함께 조회한다.
 */
export function useMerchantDetailData(brandHqId: string, corporateId: string) {
  const {
    data: enrollmentData,
    loading: enrollmentLoading,
    error: enrollmentError,
    refetch: refetchEnrollment,
  } = useQuery(MEAL_MERCHANT_ENROLLMENT_QUERY, {
    variables: { brandHqId },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: policyData,
    loading: policyLoading,
    error: policyError,
  } = useQuery(MEAL_POLICIES_BY_CORPORATE_QUERY, {
    variables: { corporateId },
    fetchPolicy: 'cache-and-network',
  });

  const merchant =
    enrollmentData?.mealMerchantEnrollment?.data ?? null;
  const policies =
    policyData?.mealPoliciesByCorporate?.data ?? [];
  const policy = policies[0] ?? null;
  const menuItems: never[] = []; // TODO: dailyMenu query per branch

  const loading = enrollmentLoading || policyLoading;
  const error = enrollmentError || policyError;

  return {
    merchant,
    policy,
    menuItems,
    loading,
    error,
    refetchEnrollment,
  };
}
