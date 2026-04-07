import { GraphQLOperation, PlatformPolicy } from '../types.js';

export interface EffectivePolicyVariables {
  policyKey: string;
  startScope: string;
  scopeChainJson?: string;
}

export interface EffectivePolicyData {
  effectivePolicy?: PlatformPolicy | null;
}

export const effectivePolicyOperation: GraphQLOperation<
  EffectivePolicyData,
  EffectivePolicyVariables
> = {
  operationName: 'EffectivePolicy',
  document: `
    query EffectivePolicy(
      $policyKey: String!
      $startScope: String!
      $scopeChainJson: String
    ) {
      effectivePolicy(
        policyKey: $policyKey
        startScope: $startScope
        scopeChainJson: $scopeChainJson
      ) {
        id
        policyKey
        scopeType
        scopeId
        policyValueJson
        version
        isActive
        createdAt
        updatedAt
      }
    }
  `,
};
