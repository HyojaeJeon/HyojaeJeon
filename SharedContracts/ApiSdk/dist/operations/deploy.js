export const deployPackagesOperation = {
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
export const deployReleasesOperation = {
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
export const deployReleaseOperation = {
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
