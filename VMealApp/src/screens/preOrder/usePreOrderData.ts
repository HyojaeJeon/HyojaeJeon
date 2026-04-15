import { useQuery, useMutation } from '@apollo/client';
import { MEAL_DAILY_MENU_QUERY } from '@graphql/queries/dailyMenu';
import { MEAL_PRE_ORDER_CREATE } from '@graphql/mutations/preOrder';
import { formatVnd } from '@shared/utils/format';

export interface PreOrderInput {
  walletId: string;
  corporateId: string;
  branchId: string;
  dailyMenuId: string;
  mealType: string;
  pickupSlot: string;
  idempotencyKey: string;
  items: Array<{ dailyMenuItemId: string; quantity: number }>;
}

/**
 * [KO] 사전 주문 화면의 데이터 + 뮤테이션 훅
 * [VI] Hook du lieu + mutation cho man hinh dat truoc
 *
 * - dailyMenu 단건 조회로 메뉴 항목을 가져온다.
 * - createPreOrder mutation 으로 주문을 생성한다.
 * - GraphQL 연결 실패 시 빈 배열 반환.
 */
export function usePreOrderData(dailyMenuId: string) {
  const { data, loading, error, refetch } = useQuery(MEAL_DAILY_MENU_QUERY, {
    variables: { id: dailyMenuId },
    fetchPolicy: 'cache-and-network',
  });

  const [createPreOrder, { loading: submitting, error: submitError }] =
    useMutation(MEAL_PRE_ORDER_CREATE);

  const menuData = data?.mealDailyMenu?.data;
  const menuItems = menuData?.items ?? [];
  const sideDishes: never[] = []; // TODO: separate query or embedded in dailyMenu items
  const drinks: never[] = []; // TODO: separate query or embedded in dailyMenu items

  const submitPreOrder = async (input: PreOrderInput) => {
    return createPreOrder({ variables: { input } });
  };

  // TODO: include merchant/branch name in MEAL_DAILY_MENU_QUERY when schema adds it
  const merchantName = menuData?.merchantName ?? menuData?.branchName ?? null;

  return {
    menuItems,
    sideDishes,
    drinks,
    merchantName,
    loading,
    error,
    refetch,
    submitPreOrder,
    submitting,
    submitError,
    formatVnd,
  };
}
