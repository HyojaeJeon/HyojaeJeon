import { gql } from '@apollo/client';

export const BRAND_LIST_QUERY = gql`
  query BrandList($skip: Int!, $take: Int!) {
    brands(skip: $skip, take: $take) {
      success {
        data {
          id
          brandCode
          brandName
          countryCode
          status
          createdAt
        }
      }
      error { code message }
    }
  }
`;

export interface BrandListRow {
  id: string;
  brandCode: string;
  brandName: string;
  countryCode: string;
  status: string;
  createdAt: string;
}
export interface BrandListData {
  brands: { success: { data: BrandListRow[] } | null; error: { code: string; message: string } | null };
}

/* ─────────────────────────── Brand Detail (1P1Q with branches + entitlements) ─────────────────────────── */

export const BRAND_DETAIL_QUERY = gql`
  query BrandDetail($id: ID!) {
    brand(id: $id) {
      success {
        data {
          id
          brandCode
          brandName
          countryCode
          status
          businessNumber
          contactName
          contactEmail
          contactPhone
          distributorId
          defaultLanguageCode
          createdAt
          updatedAt
        }
      }
      error { code message }
    }
    branches(brandHQId: $id, skip: 0, take: 50) {
      success {
        data {
          id
          branchCode
          branchName
          branchType
          countryCode
          status
          openingDate
        }
      }
    }
    brandHqEntitlements(brandHqId: $id) {
      success {
        data {
          id
          capability
          status
          activatedAt
          expiresAt
        }
      }
    }
    brandHqActiveCapabilities(brandHqId: $id) {
      success { data }
    }
  }
`;

export interface BrandDetailRow extends BrandListRow {
  businessNumber: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  distributorId: string | null;
  defaultLanguageCode: string | null;
  updatedAt: string;
}

export interface BrandBranchRow {
  id: string;
  branchCode: string;
  branchName: string;
  branchType: string;
  countryCode: string;
  status: string;
  openingDate: string | null;
}

export interface BrandEntitlementRow {
  id: string;
  capability: string;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

export interface BrandDetailData {
  brand: { success: { data: BrandDetailRow } | null; error: { code: string; message: string } | null };
  branches: { success: { data: BrandBranchRow[] } | null };
  brandHqEntitlements: { success: { data: BrandEntitlementRow[] } | null };
  brandHqActiveCapabilities: { success: { data: string[] } | null };
}

/* ─────────────────────────── Brand Catalog (menu categories + items) ─────────────────────────── */

export const BRAND_CATALOG_QUERY = gql`
  query BrandCatalog($brandHQId: ID!) {
    menuCategories(brandHQId: $brandHQId, skip: 0, take: 100) {
      success {
        data {
          id
          categoryCode
          categoryName
          displayOrder
          isActive
          parentCategoryId
        }
      }
    }
    menuItems(brandHQId: $brandHQId, skip: 0, take: 100) {
      success {
        data {
          id
          itemCode
          itemName
          categoryId
          basePrice
          taxRate
          isActive
          isSoldOut
        }
      }
    }
    pricePolicies(brandHQId: $brandHQId, skip: 0, take: 50) {
      success { data { id } }
    }
    promotions(brandHQId: $brandHQId, skip: 0, take: 50) {
      success { data { id } }
    }
  }
`;

export interface MenuCategoryRow {
  id: string;
  categoryCode: string;
  categoryName: string;
  displayOrder: number;
  isActive: boolean;
  parentCategoryId: string | null;
}

export interface MenuItemRow {
  id: string;
  itemCode: string;
  itemName: string;
  categoryId: string;
  basePrice: string;
  taxRate: string;
  isActive: boolean;
  isSoldOut: boolean;
}

export interface BrandCatalogData {
  menuCategories: { success: { data: MenuCategoryRow[] } | null };
  menuItems: { success: { data: MenuItemRow[] } | null };
  pricePolicies: { success: { data: Array<{ id: string }> } | null };
  promotions: { success: { data: Array<{ id: string }> } | null };
}

/* ─────────────────────────── Branch Detail (with EdgePos) ─────────────────────────── */

export const BRANCH_DETAIL_QUERY = gql`
  query BranchDetail($id: ID!) {
    branch(id: $id) {
      success {
        data {
          id
          branchCode
          branchName
          branchType
          brandHQId
          countryCode
          regionCode
          addressLine1
          addressLine2
          postalCode
          timeZoneCode
          openingDate
          closingDate
          status
          createdAt
          updatedAt
        }
      }
      error { code message }
    }
    edgePosTerminals(branchId: $id, skip: 0, take: 50) {
      success {
        data {
          id
          terminalCode
          terminalName
          status
        }
      }
    }
  }
`;

export interface BranchDetailRow {
  id: string;
  branchCode: string;
  branchName: string;
  branchType: string;
  brandHQId: string;
  countryCode: string;
  regionCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  timeZoneCode: string | null;
  openingDate: string | null;
  closingDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EdgePosTerminalRow {
  id: string;
  terminalCode: string;
  terminalName: string;
  status: string;
}

export interface BranchDetailData {
  branch: { success: { data: BranchDetailRow } | null; error: { code: string; message: string } | null };
  edgePosTerminals: { success: { data: EdgePosTerminalRow[] } | null };
}
