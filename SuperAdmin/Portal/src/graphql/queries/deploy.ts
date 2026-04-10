import { gql } from '@apollo/client';

export const DEPLOY_PACKAGES_QUERY = gql`
  query DeployPackages($skip: Int!, $take: Int!) {
    deployPackages(skip: $skip, take: $take) {
      success {
        data {
          id
          packageCode
          version
          platformTarget
          createdAt
          releasedAt
        }
      }
      error { code message }
    }
  }
`;

export interface DeployPackageRow {
  id: string;
  packageCode: string;
  version: string;
  platformTarget: string;
  createdAt: string;
  releasedAt: string | null;
}

export interface DeployPackagesData {
  deployPackages: {
    success: { data: DeployPackageRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export const DEPLOY_RELEASES_QUERY = gql`
  query DeployReleases($scopeType: String!, $scopeId: ID!) {
    deployReleases(scopeType: $scopeType, scopeId: $scopeId) {
      success {
        data {
          id
          packageId
          scopeType
          scopeId
          releaseStatus
          scheduledAt
          deployedAt
          createdAt
        }
      }
      error { code message }
    }
  }
`;

export interface DeployReleaseRow {
  id: string;
  packageId: string;
  scopeType: string;
  scopeId: string | null;
  releaseStatus: string;
  scheduledAt: string | null;
  deployedAt: string | null;
  createdAt: string;
}

export interface DeployReleasesData {
  deployReleases: {
    success: { data: DeployReleaseRow[] } | null;
    error: { code: string; message: string } | null;
  };
}
