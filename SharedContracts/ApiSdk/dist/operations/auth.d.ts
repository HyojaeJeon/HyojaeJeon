import { AuthPayload, GraphQLOperation } from '../types.js';
export interface LoginMutationVariables {
    input: {
        loginId: string;
        password: string;
    };
}
export interface LoginMutationData {
    login: AuthPayload;
}
export declare const loginOperation: GraphQLOperation<LoginMutationData, LoginMutationVariables>;
