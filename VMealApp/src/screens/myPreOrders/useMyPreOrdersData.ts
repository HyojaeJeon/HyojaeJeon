import { useQuery, useMutation } from '@apollo/client';
import { MEAL_PRE_ORDERS_BY_WALLET_QUERY } from '@graphql/queries/dailyMenu';
import { MEAL_PRE_ORDER_CANCEL } from '@graphql/mutations/preOrder';
/**
 * [KO] 내 사전 주문 목록 조회 + 취소 뮤테이션 훅
 * [VI] Hook danh sach don dat truoc + mutation huy don
 *
 * - walletId 기반으로 사전 주문 목록을 페이지네이션 조회한다.
 * - cancelPreOrder mutation 으로 주문을 취소한다.
 */
export function useMyPreOrdersData(walletId: string) {
  const { data, loading, error, refetch } = useQuery(
    MEAL_PRE_ORDERS_BY_WALLET_QUERY,
    {
      variables: { walletId },
      fetchPolicy: 'cache-and-network',
    },
  );

  const [cancelPreOrder, { loading: cancelling, error: cancelError }] =
    useMutation(MEAL_PRE_ORDER_CANCEL);

  const preOrders = data?.mealPreOrdersByWallet?.data ?? [];
  const totalCount =
    data?.mealPreOrdersByWallet?.totalCount ?? 0;

  const handleCancel = async (id: string) => {
    return cancelPreOrder({
      variables: { id },
      refetchQueries: [MEAL_PRE_ORDERS_BY_WALLET_QUERY],
    });
  };

  return {
    preOrders,
    totalCount,
    loading,
    error,
    refetch,
    handleCancel,
    cancelling,
    cancelError,
  };
}
