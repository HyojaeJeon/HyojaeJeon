export const syncEventConnectionOperation = {
    operationName: 'SyncEventConnection',
    document: `
    query SyncEventConnection(
      $edgePosId: String
      $eventType: String
      $dateFrom: DateTime
      $dateTo: DateTime
      $after: String
      $first: Int
    ) {
      syncEventConnection(
        edgePosId: $edgePosId
        eventType: $eventType
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
            edgePosId
            eventType
            requestId
            payloadJson
            createdAt
          }
        }
      }
    }
  `,
};
