import { useQuery } from '@apollo/client';
import { MEAL_DAILY_MENUS_FOR_SUBSCRIBED_QUERY } from '@graphql/queries/dailyMenu';

/**
 * [KO] 구독 가맹점의 오늘 일일 메뉴 조회 훅
 * [VI] Hook lay thuc don hom nay cua cac cua hang da dang ky
 */
export function useDailyMenuData(employeeId: string, date?: string) {
  const { data, loading, error, refetch } = useQuery(
    MEAL_DAILY_MENUS_FOR_SUBSCRIBED_QUERY,
    {
      variables: { employeeId, date },
      fetchPolicy: 'cache-and-network',
    },
  );

  const dailyMenus =
    data?.mealDailyMenusForSubscribed?.data ?? [];
  const totalCount =
    data?.mealDailyMenusForSubscribed?.totalCount ?? 0;

  return { dailyMenus, totalCount, loading, error, refetch };
}
