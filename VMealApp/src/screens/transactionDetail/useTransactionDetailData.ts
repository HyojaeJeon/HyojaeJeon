import { useQuery } from '@apollo/client';
import { MEAL_TRANSACTION_QUERY } from '@graphql/queries/transaction';
import type { MockMealTransaction } from '@shared/mock/types';

export function useTransactionDetailData(id: string | null) {
  const {
    data: txnData,
    loading,
    error,
    refetch,
  } = useQuery(MEAL_TRANSACTION_QUERY, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const transaction: MockMealTransaction | null =
    txnData?.mealTransaction?.data
      ? mapServerTxnToMock(txnData.mealTransaction.data)
      : null;

  return { transaction, loading, error, refetch };
}

/* ─── Server → Mock shape mapper ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServerTxnToMock(txn: any): MockMealTransaction {
  const isTopUp = !txn.branchId;
  return {
    id: txn.id,
    orderId: null,
    merchantName: txn.employeeName ?? '',
    branchName: txn.departmentName ?? '',
    amountVnd: txn.approvedAmountVnd ?? txn.requestedAmountVnd ?? 0,
    companyShareVnd: txn.companyShareVnd ?? 0,
    employeeShareVnd: txn.employeeShareVnd ?? 0,
    status: txn.status === 'AUTHORIZED' || txn.status === 'SETTLED' ? 'APPROVED' : txn.status,
    type: isTopUp ? 'TOP_UP' : 'PAYMENT',
    createdAt: txn.createdAt,
    policyName: null,
  };
}
