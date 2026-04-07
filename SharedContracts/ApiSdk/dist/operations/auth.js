export const loginOperation = {
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
