import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation PortalLogin($input: LoginInput!) {
    login(input: $input) {
      success {
        code
        data {
          accessToken
          expiresIn
          accessTokenExpiresAt
          sessionExpiresAt
          user {
            id
            loginId
            displayName
            userType
          }
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

export const REFRESH_SESSION_MUTATION = gql`
  mutation PortalRefreshSession {
    refreshSession {
      success {
        code
        data {
          accessToken
          expiresIn
          accessTokenExpiresAt
          sessionExpiresAt
          user {
            id
            loginId
            displayName
            userType
          }
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation PortalLogout {
    logout {
      success { data }
      error { code message details }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      success {
        data {
          id
          loginId
          displayName
          email
          phone
          userType
          status
          lastLoginAt
          passwordChangedAt
          createdAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const UPDATE_MY_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile($userType: String!, $id: ID!, $input: UpdateAuthAccountInput!) {
    updateAuthAccount(userType: $userType, id: $id, input: $input) {
      success { data { id displayName email phone } }
      error { code message }
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success { data }
      error { code message }
    }
  }
`;

export interface MeData {
  me: {
    success: {
      data: {
        id: string;
        loginId: string;
        displayName: string;
        email: string | null;
        phone: string | null;
        userType: string;
        status: string;
        lastLoginAt: string | null;
        passwordChangedAt: string | null;
        createdAt: string;
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

export interface LoginResult {
  login: {
    success: {
      code: string;
      data: {
        accessToken: string;
        expiresIn: string;
        accessTokenExpiresAt: string;
        sessionExpiresAt: string;
        user: {
          id: string;
          loginId: string;
          displayName: string;
          userType: string;
        };
      };
    } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}

export interface RefreshSessionResult {
  refreshSession: LoginResult['login'];
}

export interface LogoutResult {
  logout: {
    success: { data: boolean } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}
