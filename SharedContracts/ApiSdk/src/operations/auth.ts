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

export const loginOperation: GraphQLOperation<LoginMutationData, LoginMutationVariables> = {
  operationName: 'Login',
  document: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        expiresIn
        user {
          id
          loginId
          displayName
          email
          phone
          roleCode
          status
          lastLoginAt
          createdAt
          updatedAt
        }
      }
    }
  `,
};
