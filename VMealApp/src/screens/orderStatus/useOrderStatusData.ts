import { useCallback, useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { MEAL_ORDER_QUERY } from '@graphql/queries/order';
import { MEAL_ORDER_CANCEL, MEAL_ORDER_CHECKIN } from '@graphql/mutations/order';
import { MEAL_ORDER_STATUS_CHANGED } from '@graphql/subscriptions/subscriptions';

interface OrderItem {
  id: string;
  orderId: string;
  menuItemName: string;
  quantity: number;
  unitPriceVnd: number;
  optionsJson: string | null;
  createdAt: string;
}

interface MealOrder {
  id: string;
  walletId: string;
  corporateId: string;
  brandHqId: string;
  branchId: string;
  orderNo: string;
  orderType: string;
  diningType: string;
  status: string;
  totalAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  scheduledAt: string | null;
  tableNo: string | null;
  checkedInAt: string | null;
  acceptedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface StatusUpdate {
  mealOrderStatusChanged: {
    id: string;
    orderNo: string;
    status: string;
    acceptedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    cancelReason: string | null;
  };
}

export function useOrderStatusData(orderId: string) {
  const [error, setError] = useState<string | null>(null);

  // Query order details
  const {
    data: queryData,
    loading,
    refetch,
  } = useQuery(MEAL_ORDER_QUERY, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: 'cache-and-network',
  });

  // Subscribe to real-time status changes
  const { data: subscriptionData } = useSubscription<StatusUpdate>(MEAL_ORDER_STATUS_CHANGED, {
    variables: { orderId },
    skip: !orderId,
  });

  // Cancel mutation
  const [cancelMutation, { loading: cancelling }] = useMutation(MEAL_ORDER_CANCEL);

  // Check-in mutation
  const [checkinMutation, { loading: checkingIn }] = useMutation(MEAL_ORDER_CHECKIN);

  // Merge query data with subscription updates
  const serverOrder = queryData?.mealOrder?.data as MealOrder | undefined;
  const statusUpdate = subscriptionData?.mealOrderStatusChanged;

  const order = serverOrder
    ? {
        ...serverOrder,
        // Overlay real-time status if available
        ...(statusUpdate
          ? {
              status: statusUpdate.status,
              acceptedAt: statusUpdate.acceptedAt ?? serverOrder.acceptedAt,
              completedAt: statusUpdate.completedAt ?? serverOrder.completedAt,
              cancelledAt: statusUpdate.cancelledAt ?? serverOrder.cancelledAt,
              cancelReason: statusUpdate.cancelReason ?? serverOrder.cancelReason,
            }
          : {}),
      }
    : null;

  const handleCancel = useCallback(
    async (reason?: string) => {
      setError(null);
      try {
        const result = await cancelMutation({
          variables: { id: orderId, reason },
        });
        const response = result.data?.mealOrderCancel;
        if (response?.error) {
          setError(response.error.message);
          return false;
        }
        await refetch();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return false;
      }
    },
    [cancelMutation, orderId, refetch],
  );

  const handleCheckin = useCallback(async () => {
    setError(null);
    try {
      const result = await checkinMutation({
        variables: { id: orderId },
      });
      const response = result.data?.mealOrderCheckin;
      if (response?.error) {
        setError(response.error.message);
        return false;
      }
      await refetch();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    }
  }, [checkinMutation, orderId, refetch]);

  return {
    order,
    loading,
    cancelling,
    checkingIn,
    error,
    handleCancel,
    handleCheckin,
    isFromServer: !!serverOrder,
  };
}
