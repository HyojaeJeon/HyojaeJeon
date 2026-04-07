import { DeployPackage, DeployRelease, GraphQLOperation } from '../types.js';

export interface DeployPackagesQueryVariables {
  skip?: number;
  take?: number;
}

export interface DeployPackagesQueryData {
  deployPackages: DeployPackage[];
}

export const deployPackagesOperation: GraphQLOperation<
  DeployPackagesQueryData,
  DeployPackagesQueryVariables
> = {
  operationName: 'DeployPackages',
  document: `
    query DeployPackages($skip: Int, $take: Int) {
      deployPackages(skip: $skip, take: $take) {
        id
        packageCode
        version
        platformTarget
        artifactUrl
        checksum
        releasedAt
        createdAt
        updatedAt
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

export interface DeployReleasesQueryData {
  deployReleases: DeployRelease[];
}

export const deployReleasesOperation: GraphQLOperation<
  DeployReleasesQueryData,
  DeployReleasesQueryVariables
> = {
  operationName: 'DeployReleases',
  document: `
    query DeployReleases($scopeType: String!, $scopeId: ID!, $skip: Int, $take: Int) {
      deployReleases(scopeType: $scopeType, scopeId: $scopeId, skip: $skip, take: $take) {
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
      }
    }
  `,
};

export interface DeployReleaseQueryVariables {
  id: string;
}

export interface DeployReleaseQueryData {
  deployRelease?: DeployRelease | null;
}

export const deployReleaseOperation: GraphQLOperation<
  DeployReleaseQueryData,
  DeployReleaseQueryVariables
> = {
  operationName: 'DeployRelease',
  document: `
    query DeployRelease($id: ID!) {
      deployRelease(id: $id) {
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
      }
    }
  `,
};
