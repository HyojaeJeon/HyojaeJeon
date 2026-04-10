import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation CorporateLogin($input: LoginInput!) {
    login(input: $input) {
      success {
        code
        data {
          accessToken
          expiresIn
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

export const ME_QUERY = gql`
  query Me {
    me {
      success {
        data {
          id
          loginId
          displayName
          userType
          status
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
