import {
  BrandProfile,
  Branch,
  DistributorProfile,
  EdgePosTerminal,
  GraphQLOperation,
} from '../types.js';

export interface DistributorsQueryVariables {
  skip?: number;
  take?: number;
}

export interface DistributorsQueryData {
  distributors: DistributorProfile[];
}

export const distributorsOperation: GraphQLOperation<
  DistributorsQueryData,
  DistributorsQueryVariables
> = {
  operationName: 'Distributors',
  document: `
    query Distributors($skip: Int, $take: Int) {
      distributors(skip: $skip, take: $take) {
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
      }
    }
  `,
};

export interface BrandsQueryVariables {
  distributorId?: string;
  skip?: number;
  take?: number;
}

export interface BrandsQueryData {
  brands: BrandProfile[];
}

export const brandsOperation: GraphQLOperation<
  BrandsQueryData,
  BrandsQueryVariables
> = {
  operationName: 'Brands',
  document: `
    query Brands($distributorId: ID, $skip: Int, $take: Int) {
      brands(distributorId: $distributorId, skip: $skip, take: $take) {
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
      }
    }
  `,
};

export interface BranchesQueryVariables {
  brandHQId: string;
  skip?: number;
  take?: number;
}

export interface BranchesQueryData {
  branches: Branch[];
}

export const branchesOperation: GraphQLOperation<
  BranchesQueryData,
  BranchesQueryVariables
> = {
  operationName: 'Branches',
  document: `
    query Branches($brandHQId: ID!, $skip: Int, $take: Int) {
      branches(brandHQId: $brandHQId, skip: $skip, take: $take) {
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
      }
    }
  `,
};

export interface BranchQueryVariables {
  id: string;
}

export interface BranchQueryData {
  branch?: Branch | null;
}

export const branchOperation: GraphQLOperation<BranchQueryData, BranchQueryVariables> = {
  operationName: 'Branch',
  document: `
    query Branch($id: ID!) {
      branch(id: $id) {
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
      }
    }
  `,
};

export interface EdgePosTerminalsQueryVariables {
  branchId: string;
  skip?: number;
  take?: number;
}

export interface EdgePosTerminalsQueryData {
  edgePosTerminals: EdgePosTerminal[];
}

export const edgePosTerminalsOperation: GraphQLOperation<
  EdgePosTerminalsQueryData,
  EdgePosTerminalsQueryVariables
> = {
  operationName: 'EdgePosTerminals',
  document: `
    query EdgePosTerminals($branchId: ID!, $skip: Int, $take: Int) {
      edgePosTerminals(branchId: $branchId, skip: $skip, take: $take) {
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
    }
  `,
};

export interface EdgePosTerminalQueryVariables {
  id: string;
}

export interface EdgePosTerminalQueryData {
  edgePosTerminal?: EdgePosTerminal | null;
}

export const edgePosTerminalOperation: GraphQLOperation<
  EdgePosTerminalQueryData,
  EdgePosTerminalQueryVariables
> = {
  operationName: 'EdgePosTerminal',
  document: `
    query EdgePosTerminal($id: ID!) {
      edgePosTerminal(id: $id) {
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
    }
  `,
};
