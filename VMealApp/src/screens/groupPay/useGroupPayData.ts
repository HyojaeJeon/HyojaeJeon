import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { MEAL_ORDER_CREATE } from '@graphql/mutations/order';

interface OrderItem {
  menuItemName: string;
  quantity: number;
  unitPriceVnd: number;
  optionsJson?: string;
}

interface GroupOrderInput {
  walletId: string;
  branchId: string;
  diningType: string;
  tableNo?: string | null;
  scheduledAt?: string | null;
  idempotencyKey: string;
  items: OrderItem[];
  userLatitude?: number;
  userLongitude?: number;
}

interface MealOrderCreateResult {
  mealOrderCreate: {
    success?: {
      code: string;
      data: {
        id: string;
        orderNo: string;
        status: string;
        totalAmountVnd: number;
        companyShareVnd: number;
        employeeShareVnd: number;
      };
    };
    error?: {
      code: string;
      message: string;
      details: string | null;
    };
  };
}

interface GroupOrderResult {
  participantName: string;
  orderId: string | null;
  error: string | null;
}

export function useGroupPayData() {
  const [createOrderMutation, { loading: creating }] = useMutation<MealOrderCreateResult>(
    MEAL_ORDER_CREATE,
  );
  const [results, setResults] = useState<GroupOrderResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a single order for one participant in the group.
   */
  const handleCreateGroupOrder = useCallback(
    async (participantName: string, input: GroupOrderInput) => {
      setError(null);
      try {
        const result = await createOrderMutation({
          variables: { input },
        });

        const response = result.data?.mealOrderCreate;
        if (response?.error) {
          const orderResult: GroupOrderResult = {
            participantName,
            orderId: null,
            error: response.error.message,
          };
          setResults((prev) => [...prev, orderResult]);
          return orderResult;
        }

        const orderResult: GroupOrderResult = {
          participantName,
          orderId: response?.success?.data.id ?? null,
          error: null,
        };
        setResults((prev) => [...prev, orderResult]);
        return orderResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        const orderResult: GroupOrderResult = {
          participantName,
          orderId: null,
          error: message,
        };
        setResults((prev) => [...prev, orderResult]);
        return orderResult;
      }
    },
    [createOrderMutation],
  );

  /**
   * Create orders for all participants in the group sequentially.
   */
  const handleCreateAllGroupOrders = useCallback(
    async (orders: Array<{ participantName: string; input: GroupOrderInput }>) => {
      setResults([]);
      setError(null);

      const allResults: GroupOrderResult[] = [];
      for (const { participantName, input } of orders) {
        const result = await handleCreateGroupOrder(participantName, input);
        allResults.push(result);
      }

      return allResults;
    },
    [handleCreateGroupOrder],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    creating,
    results,
    error,
    handleCreateGroupOrder,
    handleCreateAllGroupOrders,
    clearResults,
  };
}
