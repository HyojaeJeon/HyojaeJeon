import { GraphQLOperation } from '../types.js';
import { MealTicketWallet, MealTicketWalletFundingEntry } from '../mealticket/dto.js';

export interface MealWalletQueryVariables {
  id: string;
}

export type MealWalletQueryData = MealTicketWallet | null;

export const mealWalletOperation: GraphQLOperation<
  MealWalletQueryData,
  MealWalletQueryVariables
> = {
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

export interface MealWalletsByCorporateQueryVariables {
  corporateId: string;
  skip?: number;
  take?: number;
}

export type MealWalletsByCorporateQueryData = MealTicketWallet[];

export const mealWalletsByCorporateOperation: GraphQLOperation<
  MealWalletsByCorporateQueryData,
  MealWalletsByCorporateQueryVariables
> = {
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

export interface CreateMealWalletMutationVariables {
  input: {
    employeeId: string;
    dailyLimitVnd?: number;
  };
}

export type CreateMealWalletMutationData = MealTicketWallet;

export const createMealWalletOperation: GraphQLOperation<
  CreateMealWalletMutationData,
  CreateMealWalletMutationVariables
> = {
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

export interface FundMealWalletMutationVariables {
  input: {
    walletId: string;
    amountVnd: number;
    sourceBatchId?: string | null;
  };
}

export type FundMealWalletMutationData = MealTicketWallet;

export const fundMealWalletOperation: GraphQLOperation<
  FundMealWalletMutationData,
  FundMealWalletMutationVariables
> = {
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

export interface TopUpMealWalletMutationVariables {
  input: {
    walletId: string;
    amountVnd: number;
    paymentReferenceId?: string | null;
  };
}

export type TopUpMealWalletMutationData = MealTicketWallet;

export const topUpMealWalletOperation: GraphQLOperation<
  TopUpMealWalletMutationData,
  TopUpMealWalletMutationVariables
> = {
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

export interface MealWalletFundingEntriesByWalletQueryVariables {
  walletId: string;
  skip?: number;
  take?: number;
}

export type MealWalletFundingEntriesByWalletQueryData =
  MealTicketWalletFundingEntry[];

export const mealWalletFundingEntriesByWalletOperation: GraphQLOperation<
  MealWalletFundingEntriesByWalletQueryData,
  MealWalletFundingEntriesByWalletQueryVariables
> = {
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
