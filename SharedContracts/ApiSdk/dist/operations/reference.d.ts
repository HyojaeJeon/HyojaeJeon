import { GraphQLOperation, Language } from '../types.js';
export interface LanguagesQueryVariables {
    skip?: number;
    take?: number;
}
export type LanguagesQueryData = Language[];
export declare const languagesOperation: GraphQLOperation<LanguagesQueryData, LanguagesQueryVariables>;
