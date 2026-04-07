import { GraphQLOperation, Language } from '../types.js';
export interface LanguagesQueryVariables {
    skip?: number;
    take?: number;
}
export interface LanguagesQueryData {
    languages: Language[];
}
export declare const languagesOperation: GraphQLOperation<LanguagesQueryData, LanguagesQueryVariables>;
