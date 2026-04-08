import { GraphQLOperation } from '../types.js';
import { MealTicketWallet, MealTicketWalletFundingEntry } from '../mealticket/dto.js';
export interface MealWalletQueryVariables {
    id: string;
}
export type MealWalletQueryData = MealTicketWallet | null;
export declare const mealWalletOperation: GraphQLOperation<MealWalletQueryData, MealWalletQueryVariables>;
export interface MealWalletsByCorporateQueryVariables {
    corporateId: string;
    skip?: number;
    take?: number;
}
export type MealWalletsByCorporateQueryData = MealTicketWallet[];
export declare const mealWalletsByCorporateOperation: GraphQLOperation<MealWalletsByCorporateQueryData, MealWalletsByCorporateQueryVariables>;
export interface CreateMealWalletMutationVariables {
    input: {
        employeeId: string;
        dailyLimitVnd?: number;
    };
}
export type CreateMealWalletMutationData = MealTicketWallet;
export declare const createMealWalletOperation: GraphQLOperation<CreateMealWalletMutationData, CreateMealWalletMutationVariables>;
export interface FundMealWalletMutationVariables {
    input: {
        walletId: string;
        amountVnd: number;
        sourceBatchId?: string | null;
    };
}
export type FundMealWalletMutationData = MealTicketWallet;
export declare const fundMealWalletOperation: GraphQLOperation<FundMealWalletMutationData, FundMealWalletMutationVariables>;
export interface TopUpMealWalletMutationVariables {
    input: {
        walletId: string;
        amountVnd: number;
        paymentReferenceId?: string | null;
    };
}
export type TopUpMealWalletMutationData = MealTicketWallet;
export declare const topUpMealWalletOperation: GraphQLOperation<TopUpMealWalletMutationData, TopUpMealWalletMutationVariables>;
export interface MealWalletFundingEntriesByWalletQueryVariables {
    walletId: string;
    skip?: number;
    take?: number;
}
export type MealWalletFundingEntriesByWalletQueryData = MealTicketWalletFundingEntry[];
export declare const mealWalletFundingEntriesByWalletOperation: GraphQLOperation<MealWalletFundingEntriesByWalletQueryData, MealWalletFundingEntriesByWalletQueryVariables>;
