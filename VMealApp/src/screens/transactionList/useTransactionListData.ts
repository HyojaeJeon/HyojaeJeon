import { useQuery } from '@apollo/client';
import { useAppSelector } from '@store/index';
import { MEAL_TRANSACTIONS_BY_CORPORATE_QUERY } from '@graphql/queries/transaction';
import type { MockMealTransaction } from '@shared/mock/types';

const DEFAULT_TAKE = 30;

interface UseTransactionListParams {
  skip?: number;
  take?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useTransactionListData(params: UseTransactionListParams = {}) {
  const corporateId = useAppSelector((s) => s.auth.user?.corporateId ?? null);

  const { skip: offset = 0, take = DEFAULT_TAKE } = params;

  const {
    data: txnData,
    loading,
    error,
    refetch,
  } = useQuery(MEAL_TRANSACTIONS_BY_CORPORATE_QUERY, {
    variables: { corporateId: corporateId!, skip: offset, take },
    skip: !corporateId,
    fetchPolicy: 'cache-and-network',
  });

  const transactions: MockMealTransaction[] =
    txnData?.mealTransactionsByCorporate?.data?.map(mapServerTxnToMock) ??
    [];

  const totalCount: number =
    txnData?.mealTransactionsByCorporate?.totalCount ?? 0;

  return { transactions, totalCount, loading, error, refetch };
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
