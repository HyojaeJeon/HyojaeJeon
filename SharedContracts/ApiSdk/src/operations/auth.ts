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

export const loginOperation: GraphQLOperation<LoginMutationData, LoginMutationVariables> = {
  operationName: 'Login',
  document: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        success { code message requestId data {
          accessToken
        expiresIn
        user {
          id
          loginId
          displayName
          email
          phone
          userType
          distributorId
          brandHQId
          corporateId
          status
          lastLoginAt
          passwordChangedAt
          createdAt
          updatedAt
        }
        } }
        error { code message requestId details }
      }
    }
  `,
};

export interface AuthAccountsQueryVariables {
  userType?: AuthUserType | null;
  skip?: number;
  take?: number;
}

export type AuthAccountsQueryData = AuthAccount[];

export const authAccountsOperation: GraphQLOperation<
  AuthAccountsQueryData,
  AuthAccountsQueryVariables
> = {
  operationName: 'AuthAccounts',
  document: `
    query AuthAccounts($userType: String, $skip: Int, $take: Int) {
      authAccounts(userType: $userType, skip: $skip, take: $take) {
        success { code message requestId data {
          id
        loginId
        displayName
        email
        phone
        userType
        distributorId
        brandHQId
        corporateId
        status
        lastLoginAt
        passwordChangedAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

export interface AuthAccountQueryVariables {
  userType: AuthUserType;
  id: string;
}

export type AuthAccountQueryData = AuthAccount | null;

export const authAccountOperation: GraphQLOperation<AuthAccountQueryData, AuthAccountQueryVariables> = {
  operationName: 'AuthAccount',
  document: `
    query AuthAccount($userType: String!, $id: ID!) {
      authAccount(userType: $userType, id: $id) {
        success { code message requestId data {
          id
        loginId
        displayName
        email
        phone
        userType
        distributorId
        brandHQId
        corporateId
        status
        lastLoginAt
        passwordChangedAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

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

export const createAuthAccountOperation: GraphQLOperation<
  CreateAuthAccountMutationData,
  CreateAuthAccountMutationVariables
> = {
  operationName: 'CreateAuthAccount',
  document: `
    mutation CreateAuthAccount($input: CreateAuthAccountInput!) {
      createAuthAccount(input: $input) {
        success { code message requestId data {
          id
        loginId
        displayName
        email
        phone
        userType
        distributorId
        brandHQId
        corporateId
        status
        lastLoginAt
        passwordChangedAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

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

export const updateAuthAccountOperation: GraphQLOperation<
  UpdateAuthAccountMutationData,
  UpdateAuthAccountMutationVariables
> = {
  operationName: 'UpdateAuthAccount',
  document: `
    mutation UpdateAuthAccount($userType: String!, $id: ID!, $input: UpdateAuthAccountInput!) {
      updateAuthAccount(userType: $userType, id: $id, input: $input) {
        success { code message requestId data {
          id
        loginId
        displayName
        email
        phone
        userType
        distributorId
        brandHQId
        corporateId
        status
        lastLoginAt
        passwordChangedAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

export interface DeleteAuthAccountMutationVariables {
  userType: AuthUserType;
  id: string;
}

export type DeleteAuthAccountMutationData = boolean;

export const deleteAuthAccountOperation: GraphQLOperation<
  DeleteAuthAccountMutationData,
  DeleteAuthAccountMutationVariables
> = {
  operationName: 'DeleteAuthAccount',
  document: `
    mutation DeleteAuthAccount($userType: String!, $id: ID!) {
      deleteAuthAccount(userType: $userType, id: $id) {
        success { code message requestId data }
        error { code message requestId details }
      }
    }
  `,
};

export interface SuspendAuthAccountMutationVariables {
  userType: AuthUserType;
  id: string;
  nextStatus: 'ACTIVE' | 'SUSPENDED';
  reason?: string | null;
}

export type SuspendAuthAccountMutationData = AuthAccount;

export const suspendAuthAccountOperation: GraphQLOperation<
  SuspendAuthAccountMutationData,
  SuspendAuthAccountMutationVariables
> = {
  operationName: 'SuspendAuthAccount',
  document: `
    mutation SuspendAuthAccount($userType: String!, $id: ID!, $nextStatus: String!, $reason: String) {
      suspendAuthAccount(userType: $userType, id: $id, nextStatus: $nextStatus, reason: $reason) {
        success { code message requestId data {
          id loginId displayName email phone userType distributorId brandHQId corporateId
          status lastLoginAt passwordChangedAt createdAt updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

export interface ResetAuthAccountPasswordMutationVariables {
  userType: AuthUserType;
  id: string;
  newPassword: string;
}

export type ResetAuthAccountPasswordMutationData = boolean;

export const resetAuthAccountPasswordOperation: GraphQLOperation<
  ResetAuthAccountPasswordMutationData,
  ResetAuthAccountPasswordMutationVariables
> = {
  operationName: 'ResetAuthAccountPassword',
  document: `
    mutation ResetAuthAccountPassword($userType: String!, $id: ID!, $newPassword: String!) {
      resetAuthAccountPassword(userType: $userType, id: $id, newPassword: $newPassword) {
        success { code message requestId data }
        error { code message requestId details }
      }
    }
  `,
};

export interface ChangePasswordMutationVariables {
  currentPassword: string;
  newPassword: string;
}

export type ChangePasswordMutationData = boolean;

export const changePasswordOperation: GraphQLOperation<
  ChangePasswordMutationData,
  ChangePasswordMutationVariables
> = {
  operationName: 'ChangePassword',
  document: `
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
      changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
        success { code message requestId data }
        error { code message requestId details }
      }
    }
  `,
};
