import { gql } from '@apollo/client';

export const DISTRIBUTOR_LIST_QUERY = gql`
  query DistributorList($skip: Int!, $take: Int!) {
    distributors(skip: $skip, take: $take) {
      success {
        data {
          id
          distributorCode
          companyName
          countryCode
          status
          createdAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const DISTRIBUTOR_DETAIL_QUERY = gql`
  query DistributorDetail($id: ID!) {
    distributor(id: $id) {
      success {
        data {
          id
          distributorCode
          companyName
          legalName
          businessNumber
          countryCode
          territoryName
          status
          createdAt
          updatedAt
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export type DistributorStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export interface DistributorListItem {
  id: string;
  distributorCode: string;
  companyName: string;
  countryCode: string;
  status: DistributorStatus;
  createdAt: string;
}

export interface DistributorListData {
  distributors: {
    success: { data: DistributorListItem[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface DistributorDetailData {
  distributor: {
    success: {
      data: DistributorListItem & {
        legalName: string | null;
        businessNumber: string | null;
        updatedAt: string;
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}
