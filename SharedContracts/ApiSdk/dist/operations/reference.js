export const languagesOperation = {
    operationName: 'Languages',
    document: `
    query Languages($skip: Int, $take: Int) {
      languages(skip: $skip, take: $take) {
        success { code message requestId data {
          id
        languageCode
        nativeName
        displayName
        direction
        isDefault
        isActive
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
