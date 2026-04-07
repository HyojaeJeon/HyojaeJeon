export const effectivePolicyOperation = {
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
