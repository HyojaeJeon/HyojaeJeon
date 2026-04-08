export const mealWalletOperation = {
    operationName: 'MealWallet',
    document: `
    query MealWallet($id: ID!) {
      mealWallet(id: $id) {
        success { code message requestId data {
          walletId: id
          corporateId
          employeeId
          status
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          createdAt
          updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const mealWalletsByCorporateOperation = {
    operationName: 'MealWalletsByCorporate',
    document: `
    query MealWalletsByCorporate($corporateId: ID!, $skip: Int, $take: Int) {
      mealWalletsByCorporate(corporateId: $corporateId, skip: $skip, take: $take) {
        success { code message requestId data {
          walletId: id
          corporateId
          employeeId
          status
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          createdAt
          updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const createMealWalletOperation = {
    operationName: 'CreateMealWallet',
    document: `
    mutation CreateMealWallet($input: CreateMealWalletInput!) {
      mealWalletCreate(input: $input) {
        success { code message requestId data {
          walletId: id
          corporateId
          employeeId
          status
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          createdAt
          updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const fundMealWalletOperation = {
    operationName: 'FundMealWallet',
    document: `
    mutation FundMealWallet($input: FundMealWalletInput!) {
      mealWalletFund(input: $input) {
        success { code message requestId data {
          walletId: id
          corporateId
          employeeId
          status
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          createdAt
          updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const topUpMealWalletOperation = {
    operationName: 'TopUpMealWallet',
    document: `
    mutation TopUpMealWallet($input: TopUpMealWalletInput!) {
      mealWalletTopUp(input: $input) {
        success { code message requestId data {
          walletId: id
          corporateId
          employeeId
          status
          balanceVnd
          companyAllowanceVnd
          personalTopUpVnd
          dailyLimitVnd
          createdAt
          updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const mealWalletFundingEntriesByWalletOperation = {
    operationName: 'MealWalletFundingEntriesByWallet',
    document: `
    query MealWalletFundingEntriesByWallet($walletId: ID!, $skip: Int, $take: Int) {
      mealWalletFundingEntriesByWallet(walletId: $walletId, skip: $skip, take: $take) {
        success { code message requestId data {
          fundingEntryId: id
          walletId
          sourceType
          status
          amountVnd
          sourceBatchId
          sourceReferenceId
          note
          postedAt
          reversedAt
          createdAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
