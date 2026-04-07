export const auditLogConnectionOperation = {
    operationName: 'AuditLogConnection',
    document: `
    query AuditLogConnection(
      $actorType: String
      $actorId: String
      $actionType: String
      $targetType: String
      $targetId: String
      $dateFrom: DateTime
      $dateTo: DateTime
      $after: String
      $first: Int
    ) {
      auditLogConnection(
        actorType: $actorType
        actorId: $actorId
        actionType: $actionType
        targetType: $targetType
        targetId: $targetId
        dateFrom: $dateFrom
        dateTo: $dateTo
        after: $after
        first: $first
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            id
            actorType
            actorId
            actionType
            targetType
            targetId
            requestId
            beforeDataJson
            afterDataJson
            ipAddress
            userAgent
            createdAt
          }
        }
      }
    }
  `,
};
