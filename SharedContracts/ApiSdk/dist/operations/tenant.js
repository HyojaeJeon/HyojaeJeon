export const distributorsOperation = {
    operationName: 'Distributors',
    document: `
    query Distributors($skip: Int, $take: Int) {
      distributors(skip: $skip, take: $take) {
        success { code message requestId data {
          id
        distributorCode
        companyName
        legalName
        businessNumber
        countryCode
        territoryName
        defaultLanguageCode
        status
        contactName
        contactEmail
        contactPhone
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const brandsOperation = {
    operationName: 'Brands',
    document: `
    query Brands($distributorId: ID, $skip: Int, $take: Int) {
      brands(distributorId: $distributorId, skip: $skip, take: $take) {
        success { code message requestId data {
          id
        distributorId
        brandCode
        brandName
        countryCode
        defaultLanguageCode
        businessNumber
        contactName
        contactEmail
        contactPhone
        status
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const branchesOperation = {
    operationName: 'Branches',
    document: `
    query Branches($brandHQId: ID!, $skip: Int, $take: Int) {
      branches(brandHQId: $brandHQId, skip: $skip, take: $take) {
        success { code message requestId data {
          id
        brandHQId
        distributorId
        branchCode
        branchName
        branchType
        countryCode
        regionCode
        addressLine1
        addressLine2
        postalCode
        timeZoneCode
        defaultLanguageCode
        status
        openingDate
        closingDate
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const branchOperation = {
    operationName: 'Branch',
    document: `
    query Branch($id: ID!) {
      branch(id: $id) {
        success { code message requestId data {
          id
        brandHQId
        distributorId
        branchCode
        branchName
        branchType
        countryCode
        regionCode
        addressLine1
        addressLine2
        postalCode
        timeZoneCode
        defaultLanguageCode
        status
        openingDate
        closingDate
        createdAt
        updatedAt
        edgePosTerminals {
          id
          branchId
          terminalCode
          terminalName
          terminalRole
          appVersion
          dbVersion
          status
          lastSyncAt
          lastHeartbeatAt
          createdAt
          updatedAt
        }
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const edgePosTerminalsOperation = {
    operationName: 'EdgePosTerminals',
    document: `
    query EdgePosTerminals($branchId: ID!, $skip: Int, $take: Int) {
      edgePosTerminals(branchId: $branchId, skip: $skip, take: $take) {
        success { code message requestId data {
          id
        branchId
        terminalCode
        terminalName
        terminalRole
        appVersion
        dbVersion
        status
        lastSyncAt
        lastHeartbeatAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
export const edgePosTerminalOperation = {
    operationName: 'EdgePosTerminal',
    document: `
    query EdgePosTerminal($id: ID!) {
      edgePosTerminal(id: $id) {
        success { code message requestId data {
          id
        branchId
        terminalCode
        terminalName
        terminalRole
        appVersion
        dbVersion
        status
        lastSyncAt
        lastHeartbeatAt
        createdAt
        updatedAt
        } }
        error { code message requestId details }
      }
    }
  `,
};
