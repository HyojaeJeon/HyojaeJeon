import { useQuery } from '@apollo/client';
import { MEAL_MERCHANT_ENROLLMENTS_QUERY } from '@graphql/queries/merchant';
/**
 * [KO] 가맹점 지도/목록 화면의 데이터 훅
 * [VI] Hook du lieu cho man hinh ban do / danh sach quan an
 */
export function useMerchantMapData() {
  const { data, loading, error, refetch } = useQuery(
    MEAL_MERCHANT_ENROLLMENTS_QUERY,
    { fetchPolicy: 'cache-and-network' },
  );

  const merchants = data?.mealMerchantEnrollments?.data ?? [];
  const totalCount =
    data?.mealMerchantEnrollments?.totalCount ?? 0;

  return { merchants, totalCount, loading, error, refetch };
}
