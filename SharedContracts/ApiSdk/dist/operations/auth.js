export const loginOperation = {
    operationName: 'Login',
    document: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        success { code message requestId data {
          accessToken
          expiresIn
          accessTokenExpiresAt
          sessionExpiresAt
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
export const refreshSessionOperation = {
    operationName: 'RefreshSession',
    document: `
    mutation RefreshSession {
      refreshSession {
        success { code message requestId data {
          accessToken
          expiresIn
          accessTokenExpiresAt
          sessionExpiresAt
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
export const logoutOperation = {
    operationName: 'Logout',
    document: `
    mutation Logout {
      logout {
        success { code message requestId data }
        error { code message requestId details }
      }
    }
  `,
};
export const authAccountsOperation = {
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
export const authAccountOperation = {
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
export const createAuthAccountOperation = {
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
export const updateAuthAccountOperation = {
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
export const deleteAuthAccountOperation = {
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
export const suspendAuthAccountOperation = {
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
export const resetAuthAccountPasswordOperation = {
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
export const changePasswordOperation = {
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
