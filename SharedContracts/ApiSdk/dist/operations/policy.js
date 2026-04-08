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
        success { code message requestId data {
          id
        policyKey
        scopeType
        scopeId
        policyValueJson
        version
        isActive
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
