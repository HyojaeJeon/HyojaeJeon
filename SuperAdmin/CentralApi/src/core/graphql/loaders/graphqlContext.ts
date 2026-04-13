/**
 * 한국어: GraphQL 요청 컨텍스트와 DataLoader bag 의 공용 타입.
 *   core 레이어는 platform 도메인 모델을 직접 import 하지 않는다.
 *   대신 loader 가 다루는 row shape 를 로컬 인터페이스로 선언하여 표현 계층과 분리한다.
 *   resolver 는 자신이 기대하는 GraphQL ObjectType 으로 자유롭게 캐스트할 수 있다.
 *
 * Tiếng Việt: Định nghĩa context GraphQL và DataLoader bag — không phụ thuộc model domain.
 */
import type DataLoader from 'dataloader';
import type { AuthUserType } from '@core/auth/constants/UserTypes.constant';

export interface CentralGraphQLRequest {
  cookies?: Record<string, string | undefined>;
  user?: {
    sub: string;
    loginId: string;
    userType: AuthUserType;
    sessionId?: string;
    tenantContext?: {
      distributorId?: string;
      brandHQId?: string;
      branchId?: string;
      corporateId?: string;
    };
  };
  [key: string]: unknown;
}

// ───────────────────────────────────────── 로컬 row shape (도메인 모델과 분리)

export interface LoaderBrandRow {
  id: string;
  distributorId: string;
  brandCode: string;
  brandName: string;
  countryCode: string;
  defaultLanguageCode: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface LoaderBranchRow {
  id: string;
  brandHQId: string;
  distributorId: string;
  branchCode: string;
  branchName: string;
  branchType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface LoaderEdgePosRow {
  id: string;
  branchId: string;
  terminalCode: string;
  terminalName: string;
  terminalRole: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface LoaderMenuCategoryRow {
  id: string;
  brandHQId: string;
  categoryCode: string;
  categoryName: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface LoaderMenuItemRow {
  id: string;
  brandHQId: string;
  itemCode: string;
  itemName: string;
  basePrice: number;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface LoaderPricePolicyRow {
  id: string;
  brandHQId: string;
  policyCode: string;
  policyName: string;
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface LoaderPromotionRow {
  id: string;
  brandHQId: string;
  promotionCode: string;
  promotionName: string;
  startAt: Date;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

// ───────────────────────────────────────── DataLoader bag

export interface CentralGraphQLLoaders {
  brandsByDistributorId: DataLoader<string, LoaderBrandRow[]>;
  branchesByBrandHQId: DataLoader<string, LoaderBranchRow[]>;
  edgePosTerminalsByBranchId: DataLoader<string, LoaderEdgePosRow[]>;
  menuCategoriesByBrandHQId: DataLoader<string, LoaderMenuCategoryRow[]>;
  menuItemsByBrandHQId: DataLoader<string, LoaderMenuItemRow[]>;
  pricePoliciesByBrandHQId: DataLoader<string, LoaderPricePolicyRow[]>;
  promotionsByBrandHQId: DataLoader<string, LoaderPromotionRow[]>;
}

export interface CentralGraphQLContext {
  req: CentralGraphQLRequest;
  reply?: { raw?: { setHeader?: (name: string, value: string | string[]) => void } };
  responseCookies?: string[];
  requestId?: string;
  acceptLanguage?: string;
  locale?: string;
  loaders: CentralGraphQLLoaders;
}
