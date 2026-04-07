export const languagesOperation = {
    operationName: 'Languages',
    document: `
    query Languages($skip: Int, $take: Int) {
      languages(skip: $skip, take: $take) {
        id
        languageCode
        nativeName
        displayName
        direction
        isDefault
        isActive
        createdAt
        updatedAt
      }
    }
  `,
};
