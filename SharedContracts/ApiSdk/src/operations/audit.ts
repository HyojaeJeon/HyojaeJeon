import { AuditLogConnection, GraphQLOperation } from '../types.js';

export interface AuditLogConnectionVariables {
  actorType?: string;
  actorId?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  after?: string;
  first?: number;
}

export interface AuditLogConnectionData {
  auditLogConnection: AuditLogConnection;
}

export const auditLogConnectionOperation: GraphQLOperation<
  AuditLogConnectionData,
  AuditLogConnectionVariables
> = {
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
