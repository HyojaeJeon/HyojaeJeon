import { gql } from '@apollo/client';

/**
 * 상단 영역 랜딩 페이지들의 1P1Q 오버뷰 쿼리 모음.
 * 각 영역 루트 라우트(/tenants, /deploy, /governance, /operations, /system) 진입 시
 * 하위 리소스의 카운터/미리보기를 단일 operation 으로 fetch 한다.
 */

export const TENANTS_OVERVIEW_QUERY = gql`
  query TenantsOverview {
    distributors(skip: 0, take: 20) {
      success { data { id distributorCode companyName countryCode status } }
    }
    brands(skip: 0, take: 20) {
      success { data { id brandCode brandName status } }
    }
    mealCorporates(skip: 0, take: 20) {
      success { data { id tenantCode companyName status } }
    }
  }
`;

export interface TenantsOverviewData {
  distributors: { success: { data: Array<{ id: string; distributorCode: string; companyName: string; countryCode: string; status: string }> } | null };
  brands: { success: { data: Array<{ id: string; brandCode: string; brandName: string; status: string }> } | null };
  mealCorporates: { success: { data: Array<{ id: string; tenantCode: string; companyName: string; status: string }> } | null };
}

export const DEPLOY_OVERVIEW_QUERY = gql`
  query DeployOverview {
    deployPackages(skip: 0, take: 20) {
      success { data { id packageCode version platformTarget createdAt releasedAt } }
    }
  }
`;

export interface DeployOverviewData {
  deployPackages: {
    success: {
      data: Array<{
        id: string;
        packageCode: string;
        version: string;
        platformTarget: string;
        createdAt: string;
        releasedAt: string | null;
      }>;
    } | null;
  };
}

export const GOVERNANCE_OVERVIEW_QUERY = gql`
  query GovernanceOverview {
    licenses(skip: 0, take: 10) {
      success { data { id licenseCode licenseType status scopeType effectiveTo } totalCount }
    }
    rbacRoles {
      success { data { id roleCode scope } }
    }
    rbacPermissions {
      success { data { id permissionKey domain } }
    }
    authAccounts(skip: 0, take: 10) {
      success { data { id loginId userType status } totalCount }
    }
  }
`;

export interface GovernanceOverviewData {
  licenses: { success: { data: Array<{ id: string; licenseCode: string; licenseType: string; status: string; scopeType: string; effectiveTo: string | null }> } | null };
  rbacRoles: { success: { data: Array<{ id: string; roleCode: string; scope: string }> } | null };
  rbacPermissions: { success: { data: Array<{ id: string; permissionKey: string; domain: string | null }> } | null };
  authAccounts: { success: { data: Array<{ id: string; loginId: string; userType: string; status: string }> } | null };
}

export const OPERATIONS_OVERVIEW_QUERY = gql`
  query OperationsOverview {
    syncEventConnection(first: 10) {
      success {
        data {
          edges {
            cursor
            node { id eventType edgePosId createdAt }
          }
        }
      }
    }
    auditLogConnection(first: 5) {
      success {
        data {
          edges {
            cursor
            node { id createdAt actorType actionType targetType }
          }
        }
      }
    }
  }
`;

export interface OperationsOverviewData {
  syncEventConnection: {
    success: {
      data: {
        edges: Array<{ cursor: string; node: { id: string; eventType: string; edgePosId: string | null; createdAt: string } }>;
      };
    } | null;
  };
  auditLogConnection: {
    success: {
      data: {
        edges: Array<{ cursor: string; node: { id: string; createdAt: string; actorType: string; actionType: string; targetType: string } }>;
      };
    } | null;
  };
}

export const SYSTEM_OVERVIEW_QUERY = gql`
  query SystemOverview {
    currencies(skip: 0, take: 10) {
      success { data { id currencyCode currencyName isDefault } }
    }
    languages(skip: 0, take: 10) {
      success { data { id languageCode nativeName isDefault } }
    }
    regions(skip: 0, take: 10) {
      success { data { id regionCode regionName countryCode } }
    }
    auditLogConnection(first: 5) {
      success {
        data {
          edges { cursor node { id createdAt actionType targetType } }
        }
      }
    }
  }
`;

export interface SystemOverviewData {
  currencies: { success: { data: Array<{ id: string; currencyCode: string; currencyName: string; isDefault: boolean }> } | null };
  languages: { success: { data: Array<{ id: string; languageCode: string; nativeName: string; isDefault: boolean }> } | null };
  regions: { success: { data: Array<{ id: string; regionCode: string; regionName: string; countryCode: string }> } | null };
  auditLogConnection: {
    success: { data: { edges: Array<{ cursor: string; node: { id: string; createdAt: string; actionType: string; targetType: string } }> } } | null;
  };
}
