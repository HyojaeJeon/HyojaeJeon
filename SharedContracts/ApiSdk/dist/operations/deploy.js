export const deployPackagesOperation = {
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
export const deployReleasesOperation = {
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
export const deployReleaseOperation = {
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
