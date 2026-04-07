import { GraphQLOperation, Language } from '../types.js';

export interface LanguagesQueryVariables {
  skip?: number;
  take?: number;
}

export interface LanguagesQueryData {
  languages: Language[];
}

export const languagesOperation: GraphQLOperation<
  LanguagesQueryData,
  LanguagesQueryVariables
> = {
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
