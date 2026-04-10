import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const ENROLLED_MERCHANTS_QUERY = gql`
  query EnrolledMerchants($corporateId: ID!, $skip: Int!, $take: Int!, $filter: MerchantAllowlistFilter) {
    mealEnrolledMerchants(corporateId: $corporateId, skip: $skip, take: $take, filter: $filter) {
      success {
        data {
          id
          brandName
          branchName
          category
          loopType
          isAllowed
          monthlyUsageCount
          monthlyUsageAmountVnd
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Mutations ─────────────────────────── */

export const MERCHANT_ALLOW_TOGGLE_MUTATION = gql`
  mutation MerchantAllowToggle($corporateId: ID!, $merchantId: ID!, $isAllowed: Boolean!) {
    mealMerchantAllowToggle(corporateId: $corporateId, merchantId: $merchantId, isAllowed: $isAllowed) {
      success {
        data {
          id
          isAllowed
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const MERCHANT_BULK_TOGGLE_MUTATION = gql`
  mutation MerchantBulkToggle($corporateId: ID!, $merchantIds: [ID!]!, $isAllowed: Boolean!) {
    mealMerchantBulkToggle(corporateId: $corporateId, merchantIds: $merchantIds, isAllowed: $isAllowed) {
      success {
        data {
          updatedCount
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const MERCHANT_CATEGORY_BULK_TOGGLE_MUTATION = gql`
  mutation MerchantCategoryBulkToggle($corporateId: ID!, $category: String!, $isAllowed: Boolean!) {
    mealMerchantCategoryBulkToggle(corporateId: $corporateId, category: $category, isAllowed: $isAllowed) {
      success {
        data {
          updatedCount
        }
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface MerchantRow {
  id: string;
  brandName: string;
  branchName: string | null;
  category: string | null;
  loopType: string;
  isAllowed: boolean;
  monthlyUsageCount: number;
  monthlyUsageAmountVnd: string;
}

export interface EnrolledMerchantsData {
  mealEnrolledMerchants: {
    success: { data: MerchantRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export interface MerchantAllowToggleData {
  mealMerchantAllowToggle: {
    success: { data: { id: string; isAllowed: boolean } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface MerchantBulkToggleData {
  mealMerchantBulkToggle: {
    success: { data: { updatedCount: number } } | null;
    error: { code: string; message: string } | null;
  };
}

export interface MerchantCategoryBulkToggleData {
  mealMerchantCategoryBulkToggle: {
    success: { data: { updatedCount: number } } | null;
    error: { code: string; message: string } | null;
  };
}
