import { GraphQLOperation, PlatformPolicy } from '../types.js';
export interface EffectivePolicyVariables {
    policyKey: string;
    startScope: string;
    scopeChainJson?: string;
}
export interface EffectivePolicyData {
    effectivePolicy?: PlatformPolicy | null;
}
export declare const effectivePolicyOperation: GraphQLOperation<EffectivePolicyData, EffectivePolicyVariables>;
