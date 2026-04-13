import { AuthAccount, AuthPayload, AuthUserType, GraphQLOperation } from '../types.js';
export interface LoginMutationVariables {
    input: {
        loginId: string;
        password: string;
        userType?: AuthUserType | null;
        distributorId?: string | null;
        brandHqId?: string | null;
        corporateId?: string | null;
    };
}
export type LoginMutationData = AuthPayload;
export declare const loginOperation: GraphQLOperation<LoginMutationData, LoginMutationVariables>;
export type RefreshSessionMutationData = AuthPayload;
export declare const refreshSessionOperation: GraphQLOperation<RefreshSessionMutationData, Record<string, never>>;
export type LogoutMutationData = boolean;
export declare const logoutOperation: GraphQLOperation<LogoutMutationData, Record<string, never>>;
export interface AuthAccountsQueryVariables {
    userType?: AuthUserType | null;
    skip?: number;
    take?: number;
}
export type AuthAccountsQueryData = AuthAccount[];
export declare const authAccountsOperation: GraphQLOperation<AuthAccountsQueryData, AuthAccountsQueryVariables>;
export interface AuthAccountQueryVariables {
    userType: AuthUserType;
    id: string;
}
export type AuthAccountQueryData = AuthAccount | null;
export declare const authAccountOperation: GraphQLOperation<AuthAccountQueryData, AuthAccountQueryVariables>;
export interface CreateAuthAccountMutationVariables {
    input: {
        loginId: string;
        password: string;
        displayName: string;
        email?: string | null;
        phone?: string | null;
        userType?: AuthUserType | null;
        distributorId?: string | null;
        brandHqId?: string | null;
        corporateId?: string | null;
        roleCode: string;
    };
}
export type CreateAuthAccountMutationData = AuthAccount;
export declare const createAuthAccountOperation: GraphQLOperation<CreateAuthAccountMutationData, CreateAuthAccountMutationVariables>;
export interface UpdateAuthAccountMutationVariables {
    userType: AuthUserType;
    id: string;
    input: {
        displayName?: string | null;
        email?: string | null;
        phone?: string | null;
        roleCode?: string | null;
        status?: string | null;
    };
}
export type UpdateAuthAccountMutationData = AuthAccount;
export declare const updateAuthAccountOperation: GraphQLOperation<UpdateAuthAccountMutationData, UpdateAuthAccountMutationVariables>;
export interface DeleteAuthAccountMutationVariables {
    userType: AuthUserType;
    id: string;
}
export type DeleteAuthAccountMutationData = boolean;
export declare const deleteAuthAccountOperation: GraphQLOperation<DeleteAuthAccountMutationData, DeleteAuthAccountMutationVariables>;
export interface SuspendAuthAccountMutationVariables {
    userType: AuthUserType;
    id: string;
    nextStatus: 'ACTIVE' | 'SUSPENDED';
    reason?: string | null;
}
export type SuspendAuthAccountMutationData = AuthAccount;
export declare const suspendAuthAccountOperation: GraphQLOperation<SuspendAuthAccountMutationData, SuspendAuthAccountMutationVariables>;
export interface ResetAuthAccountPasswordMutationVariables {
    userType: AuthUserType;
    id: string;
    newPassword: string;
}
export type ResetAuthAccountPasswordMutationData = boolean;
export declare const resetAuthAccountPasswordOperation: GraphQLOperation<ResetAuthAccountPasswordMutationData, ResetAuthAccountPasswordMutationVariables>;
export interface ChangePasswordMutationVariables {
    currentPassword: string;
    newPassword: string;
}
export type ChangePasswordMutationData = boolean;
export declare const changePasswordOperation: GraphQLOperation<ChangePasswordMutationData, ChangePasswordMutationVariables>;
