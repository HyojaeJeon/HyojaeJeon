import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { MEAL_ORDER_CREATE } from '@graphql/mutations/order';
import type { MockMenuItem } from '@shared/mock/types';

interface OrderItem {
  menuItemName: string;
  quantity: number;
  unitPriceVnd: number;
  optionsJson?: string;
}

interface CreateMealOrderInput {
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

export function useOrderData() {
  const [createOrderMutation, { loading: creating }] = useMutation<MealOrderCreateResult>(
    MEAL_ORDER_CREATE,
  );
  const [error, setError] = useState<string | null>(null);

  // TODO: Wire real menu query per merchant/branch
  const menuItems: MockMenuItem[] = [];

  const handleCreateOrder = useCallback(
    async (input: CreateMealOrderInput) => {
      setError(null);
      try {
        const result = await createOrderMutation({
          variables: { input },
        });

        const response = result.data?.mealOrderCreate;
        if (response?.error) {
          setError(response.error.message);
          return null;
        }

        return response?.success?.data ?? null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      }
    },
    [createOrderMutation],
  );

  return {
    menuItems,
    creating,
    error,
    handleCreateOrder,
  };
}
