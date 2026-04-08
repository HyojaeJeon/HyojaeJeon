import { DeployPackage, DeployRelease, GraphQLOperation } from '../types.js';

export interface DeployPackagesQueryVariables {
  skip?: number;
  take?: number;
}

export type DeployPackagesQueryData = DeployPackage[];

export const deployPackagesOperation: GraphQLOperation<
  DeployPackagesQueryData,
  DeployPackagesQueryVariables
> = {
  operationName: 'DeployPackages',
  document: `
    query DeployPackages($skip: Int, $take: Int) {
      deployPackages(skip: $skip, take: $take) {
        success { code message requestId data {
          id
        packageCode
        version
        platformTarget
        artifactUrl
        checksum
        releasedAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

export interface DeployReleasesQueryVariables {
  scopeType: string;
  scopeId: string;
  skip?: number;
  take?: number;
}

export type DeployReleasesQueryData = DeployRelease[];

export const deployReleasesOperation: GraphQLOperation<
  DeployReleasesQueryData,
  DeployReleasesQueryVariables
> = {
  operationName: 'DeployReleases',
  document: `
    query DeployReleases($scopeType: String!, $scopeId: ID!, $skip: Int, $take: Int) {
      deployReleases(scopeType: $scopeType, scopeId: $scopeId, skip: $skip, take: $take) {
        success { code message requestId data {
          id
        packageId
        scopeType
        scopeId
        releaseStatus
        scheduledAt
        deployedAt
        rollbackPackageId
        releaseNote
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};

export interface DeployReleaseQueryVariables {
  id: string;
}

export type DeployReleaseQueryData = DeployRelease | null;

export const deployReleaseOperation: GraphQLOperation<
  DeployReleaseQueryData,
  DeployReleaseQueryVariables
> = {
  operationName: 'DeployRelease',
  document: `
    query DeployRelease($id: ID!) {
      deployRelease(id: $id) {
        success { code message requestId data {
          id
        packageId
        scopeType
        scopeId
        releaseStatus
        scheduledAt
        deployedAt
        rollbackPackageId
        releaseNote
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
