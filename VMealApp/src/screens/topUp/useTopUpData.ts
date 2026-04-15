import { useQuery, useMutation } from '@apollo/client';
import { useAppSelector } from '@store/index';
import { MEAL_WALLET_QUERY } from '@graphql/queries/wallet';
import { MEAL_WALLET_TOP_UP } from '@graphql/mutations/wallet';
import type { MockMealWallet, MockPaymentMethod } from '@shared/mock/types';

export function useTopUpData() {
  const walletId = useAppSelector((s) => s.auth.user?.walletId ?? null);

  /* ── Current wallet balance ── */
  const {
    data: walletData,
    loading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useQuery(MEAL_WALLET_QUERY, {
    variables: { id: walletId! },
    skip: !walletId,
    fetchPolicy: 'cache-and-network',
  });

  /* ── Top-up mutation ── */
  const [topUpMutate, { loading: topUpLoading, error: topUpError }] =
    useMutation(MEAL_WALLET_TOP_UP);

  async function executeTopUp(amountVnd: number, paymentMethodId: string) {
    if (!walletId) return null;
    const result = await topUpMutate({
      variables: {
        input: {
          walletId,
          amountVnd,
          paymentMethodId,
        },
      },
    });
    // Refetch wallet to get latest balance after top-up
    await refetchWallet();
    return result.data?.mealWalletTopUp ?? null;
  }

  /* ── Derive data from server response ── */
  const wallet: MockMealWallet | null =
    walletData?.mealWallet?.data ?? null;

  const paymentMethods: MockPaymentMethod[] = [];

  return {
    wallet,
    paymentMethods,
    loading: walletLoading,
    error: walletError,
    executeTopUp,
    topUpLoading,
    topUpError,
    refetchWallet,
  };
}
