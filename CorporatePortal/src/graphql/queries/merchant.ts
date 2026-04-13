import { gql } from '@apollo/client';

/* ─────────────────────────── Queries ─────────────────────────── */

export const MERCHANT_ENROLLMENTS_QUERY = gql`
  query MerchantEnrollments($skip: Int!, $take: Int!) {
    mealMerchantEnrollments(skip: $skip, take: $take) {
      success {
        data {
          id
          brandHqId
          brandName
          isActive
          loopType
          enrolledAt
          contractEndsAt
          createdAt
          updatedAt
        }
        totalCount
      }
      error {
        code
        message
      }
    }
  }
`;

/* ─────────────────────────── Mutations ─────────────────────────── */

export const MERCHANT_ACTIVATE_MUTATION = gql`
  mutation MerchantActivate($enrollmentId: ID!) {
    mealMerchantActivate(enrollmentId: $enrollmentId) {
      success {
        data {
          id
          isActive
        }
      }
      error {
        code
        message
      }
    }
  }
`;

export const MERCHANT_DEACTIVATE_MUTATION = gql`
  mutation MerchantDeactivate($enrollmentId: ID!) {
    mealMerchantDeactivate(enrollmentId: $enrollmentId) {
      success {
        data {
          id
          isActive
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

export interface MerchantEnrollmentRow {
  id: string;
  brandHqId: string;
  brandName: string | null;
  isActive: boolean;
  loopType: string;
  enrolledAt: string | null;
  contractEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantEnrollmentsData {
  mealMerchantEnrollments: {
    success: { data: MerchantEnrollmentRow[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

export interface MerchantAllowToggleData {
  mealMerchantAllowToggle: {
    success: { data: { id: string; isActive: boolean } } | null;
    error: { code: string; message: string } | null;
  };
}
