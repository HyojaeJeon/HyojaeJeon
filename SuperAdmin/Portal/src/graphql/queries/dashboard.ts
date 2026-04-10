import { gql } from '@apollo/client';

/**
 * SA-DASH-001 Platform Overview — 1P1Q 원칙에 따라 단일 operation 으로 통합.
 * CentralApi 의 GRAPHQL_MAX_COMPLEXITY=2000 하에서 동작.
 */
export const DASHBOARD_OVERVIEW_QUERY = gql`
  query DashboardOverview {
    distributors(skip: 0, take: 50) {
      success { data { id } }
    }
    brands(skip: 0, take: 50) {
      success { data { id } }
    }
    licenses(skip: 0, take: 5) {
      success {
        data {
          id
          licenseCode
          licenseType
          status
          scopeType
          effectiveFrom
          effectiveTo
        }
      }
    }
    auditLogConnection(first: 5) {
      success {
        data {
          edges {
            cursor
            node {
              id
              createdAt
              actorType
              actorId
              actionType
              targetType
              targetId
            }
          }
        }
      }
    }
  }
`;

interface EnvelopeList<T> {
  success: { data: T[] } | null;
}

export interface DashboardOverviewData {
  distributors: EnvelopeList<{ id: string }>;
  brands: EnvelopeList<{ id: string }>;
  licenses: EnvelopeList<{
    id: string;
    licenseCode: string;
    licenseType: string;
    status: string;
    scopeType: string;
    effectiveFrom: string;
    effectiveTo: string | null;
  }>;
  auditLogConnection: {
    success: {
      data: {
        edges: Array<{
          cursor: string;
          node: {
            id: string;
            createdAt: string;
            actorType: string;
            actorId: string | null;
            actionType: string;
            targetType: string;
            targetId: string | null;
          };
        }>;
      };
    } | null;
  };
}
