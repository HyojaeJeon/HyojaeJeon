import { gql } from '@apollo/client';

// Corporate profile query (current session's corporate)
export const CORPORATE_PROFILE_QUERY = gql`
  query CorporateProfile($id: ID!) {
    mealCorporate(id: $id) {
      success {
        data {
          id
          tenantCode
          companyName
          taxCode
          fundingModel
          depositBalanceVnd
          creditLimitVnd
          monthlyBudgetVnd
          contactName
          contactEmail
          contactPhone
          addressCity
          addressDistrict
          addressWard
          addressDetail
          addressFull
          contactFax
          bankAccountNumber
          bankName
          einvoiceConsolidationStrategy
          einvoiceReviewDays
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

export const UPDATE_CORPORATE_MUTATION = gql`
  mutation UpdateCorporate($id: ID!, $input: UpdateMealCorporateInput!) {
    mealCorporateUpdate(id: $id, input: $input) {
      success {
        data {
          id
          companyName
          taxCode
          contactName
          contactEmail
          contactPhone
          addressFull
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface CorporateProfile {
  id: string;
  tenantCode: string;
  companyName: string;
  taxCode: string | null;
  fundingModel: string | null;
  depositBalanceVnd: string | null;
  creditLimitVnd: string | null;
  monthlyBudgetVnd: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressCity: string | null;
  addressDistrict: string | null;
  addressWard: string | null;
  addressDetail: string | null;
  addressFull: string | null;
  contactFax: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  einvoiceConsolidationStrategy: string | null;
  einvoiceReviewDays: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorporateProfileData {
  mealCorporate: {
    success: { data: CorporateProfile } | null;
    error: { code: string; message: string } | null;
  };
}

export interface UpdateCorporateData {
  mealCorporateUpdate: {
    success: {
      data: {
        id: string;
        companyName: string;
        taxCode: string | null;
        contactName: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        addressFull: string | null;
      };
    } | null;
    error: { code: string; message: string; details?: unknown } | null;
  };
}
