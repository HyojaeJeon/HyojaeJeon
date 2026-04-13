import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation CorporateLogin($input: LoginInput!) {
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
            corporateId
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
  mutation CorporateRefreshSession {
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
            corporateId
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
  mutation CorporateLogout {
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
          userType
          corporateId
          status
          permissions
        }
      }
      error {
        code
        message
      }
    }
  }
`;

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
          corporateId: string | null;
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
