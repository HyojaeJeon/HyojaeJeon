import { useQuery, useSubscription } from '@apollo/client';
import { useAppSelector } from '@store/index';
import { MEAL_WALLET_QUERY } from '@graphql/queries/wallet';
import { MEAL_TRANSACTIONS_BY_CORPORATE_QUERY } from '@graphql/queries/transaction';
import { MEAL_MERCHANT_ENROLLMENTS_QUERY } from '@graphql/queries/merchant';
import { MEAL_WALLET_UPDATED } from '@graphql/subscriptions/subscriptions';
import type { MockMealWallet, MockMealTransaction, MockMerchant } from '@shared/mock/types';

/** Number of recent transactions to show on home */
const RECENT_TXN_TAKE = 5;
/** Number of nearby merchants to show on home */
const NEARBY_MERCHANTS_TAKE = 4;

export function useWalletHomeData() {
  const walletId = useAppSelector((s) => s.auth.user?.walletId ?? null);
  const corporateId = useAppSelector((s) => s.auth.user?.corporateId ?? null);

  /* ── Wallet balance ── */
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

  /* ── Recent transactions ── */
  const {
    data: txnData,
    loading: txnLoading,
    error: txnError,
    refetch: refetchTransactions,
  } = useQuery(MEAL_TRANSACTIONS_BY_CORPORATE_QUERY, {
    variables: { corporateId: corporateId!, skip: 0, take: RECENT_TXN_TAKE },
    skip: !corporateId,
    fetchPolicy: 'cache-and-network',
  });

  /* ── Nearby merchants ── */
  const {
    data: merchantData,
    loading: merchantLoading,
    error: merchantError,
    refetch: refetchMerchants,
  } = useQuery(MEAL_MERCHANT_ENROLLMENTS_QUERY, {
    variables: { skip: 0, take: NEARBY_MERCHANTS_TAKE },
    fetchPolicy: 'cache-and-network',
  });

  /* ── Real-time wallet balance subscription ── */
  useSubscription(MEAL_WALLET_UPDATED, {
    variables: { walletId: walletId! },
    skip: !walletId,
    onData({ client, data: subData }) {
      const updated = subData.data?.mealWalletUpdated;
      if (!updated || !walletId) return;
      // Write updated balance directly into the Apollo cache
      client.cache.modify({
        id: client.cache.identify({ __typename: 'MealWallet', id: walletId }),
        fields: {
          balanceVnd: () => updated.balanceVnd,
          companyAllowanceVnd: () => updated.companyAllowanceVnd,
          personalTopUpVnd: () => updated.personalTopUpVnd,
          dailyLimitVnd: () => updated.dailyLimitVnd,
          status: () => updated.status,
        },
      });
    },
  });

  /* ── Derive data from server responses ── */
  const wallet: MockMealWallet | null =
    walletData?.mealWallet?.data ?? null;

  const transactions: MockMealTransaction[] =
    txnData?.mealTransactionsByCorporate?.data ?? [];

  const merchants: MockMerchant[] =
    merchantData?.mealMerchantEnrollments?.data ?? [];

  const loading = walletLoading || txnLoading || merchantLoading;
  const error = walletError || txnError || merchantError;

  return {
    wallet,
    transactions,
    merchants,
    loading,
    error,
    refetchWallet,
    refetchTransactions,
    refetchMerchants,
  };
}
