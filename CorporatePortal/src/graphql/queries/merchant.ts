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
          cuisineType
          logoUrl
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

/* ─────────────────── Menu Queries (per brandHQId) ─────────────────── */

export const MENU_CATEGORIES_QUERY = gql`
  query MenuCategories($brandHQId: ID!, $skip: Int!, $take: Int!) {
    menuCategories(brandHQId: $brandHQId, skip: $skip, take: $take) {
      success {
        data {
          id
          brandHQId
          categoryCode
          categoryName
          displayOrder
          isActive
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

export const MENU_ITEMS_QUERY = gql`
  query MenuItems($brandHQId: ID!, $skip: Int!, $take: Int!) {
    menuItems(brandHQId: $brandHQId, skip: $skip, take: $take) {
      success {
        data {
          id
          brandHQId
          categoryId
          itemName
          basePrice
          itemType
          displayOrder
          isActive
          isSoldOut
          profileImageUrl
          description
          isFeatured
          isBestSeller
          calories
          spicyLevel
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

/* ─────────────────────── Single Enrollment Query ─────────────────────── */

export const MERCHANT_ENROLLMENT_DETAIL_QUERY = gql`
  query MerchantEnrollmentDetail($brandHqId: ID!) {
    mealMerchantEnrollment(brandHqId: $brandHqId) {
      success {
        data {
          id
          brandHqId
          brandName
          cuisineType
          logoUrl
          isActive
          loopType
          enrolledAt
          contractEndsAt
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

/* ─────────────────────── Branch Query (per brandHQId) ─────────────────────── */

export const MERCHANT_BRANCHES_QUERY = gql`
  query MerchantBranches($brandHQId: ID!, $skip: Int!, $take: Int!) {
    branches(brandHQId: $brandHQId, skip: $skip, take: $take) {
      success {
        data {
          id
          branchName
          addressLine1
          phone
          latitude
          longitude
          logoUrl
          profileImageUrl
          description
          rating
          reviewCount
          status
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

/* ─────────────────────────── Type interfaces ─────────────────────────── */

export interface MerchantEnrollmentRow {
  id: string;
  brandHqId: string;
  brandName: string | null;
  cuisineType: string | null;
  logoUrl: string | null;
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

export interface MenuCategoryRow {
  id: string;
  brandHQId: string;
  categoryCode: string;
  categoryName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuCategoriesData {
  menuCategories: {
    success: { data: MenuCategoryRow[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

export interface MenuItemRow {
  id: string;
  brandHQId: string;
  categoryId: string;
  itemName: string;
  basePrice: number;
  itemType: string;
  displayOrder: number;
  isActive: boolean;
  isSoldOut: boolean;
  profileImageUrl: string | null;
  description: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  calories: number | null;
  spicyLevel: number | null;
}

export interface MenuItemsData {
  menuItems: {
    success: { data: MenuItemRow[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

export interface BranchRow {
  id: string;
  branchName: string;
  addressLine1: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
  profileImageUrl: string | null;
  description: string | null;
  rating: number | null;
  reviewCount: number | null;
  status: string;
}

export interface MerchantBranchesData {
  branches: {
    success: { data: BranchRow[]; totalCount: number } | null;
    error: { code: string; message: string } | null;
  };
}

export interface MerchantEnrollmentDetailData {
  mealMerchantEnrollment: {
    success: { data: MerchantEnrollmentRow } | null;
    error: { code: string; message: string } | null;
  };
}
