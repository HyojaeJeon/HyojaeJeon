import { gql } from '@apollo/client';

/**
 * Track real-time order state transitions.
 * Used in OrderStatusScreen.
 */
export const MEAL_ORDER_STATUS_CHANGED = gql`
  subscription MealOrderStatusChanged($orderId: ID!) {
    mealOrderStatusChanged(orderId: $orderId) {
      id
      orderNo
      status
      acceptedAt
      completedAt
      cancelledAt
      cancelReason
    }
  }
`;

/**
 * Receive new incoming orders for a branch.
 * Used by POS/merchant side.
 */
export const MEAL_ORDER_RECEIVED = gql`
  subscription MealOrderReceived($branchId: ID!) {
    mealOrderReceived(branchId: $branchId) {
      id
      orderNo
      diningType
      totalAmountVnd
      scheduledAt
      tableNo
      items {
        menuItemName
        quantity
        unitPriceVnd
      }
    }
  }
`;

/**
 * Real-time wallet balance updates.
 * Used in WalletHomeScreen.
 */
export const MEAL_WALLET_UPDATED = gql`
  subscription MealWalletUpdated($walletId: ID!) {
    mealWalletUpdated(walletId: $walletId) {
      id
      balanceVnd
      companyAllowanceVnd
      personalTopUpVnd
      dailyLimitVnd
      status
    }
  }
`;

/**
 * Receive RFID payment results.
 * Used after tap-to-pay at POS terminal.
 */
export const MEAL_TRANSACTION_RESULT = gql`
  subscription MealTransactionResult($walletId: ID!) {
    mealTransactionResult(walletId: $walletId) {
      id
      walletId
      status
      approvedAmountVnd
      companyShareVnd
      employeeShareVnd
      declineReason
      authorizedAt
    }
  }
`;

/**
 * Policy change notifications.
 * Used to refresh policy data when admin updates policies.
 */
export const MEAL_POLICY_CHANGED = gql`
  subscription MealPolicyChanged($corporateId: ID!) {
    mealPolicyChanged(corporateId: $corporateId) {
      id
      policyCode
      policyName
      status
      maxPerTransactionVnd
      dailyLimitVnd
      effectiveFrom
      effectiveTo
    }
  }
`;
