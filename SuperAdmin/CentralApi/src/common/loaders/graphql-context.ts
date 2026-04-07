import type DataLoader from 'dataloader';
import type { BrandProfileModel } from '../../modules/tenant/models/brand-profile.model';
import type { BranchModel } from '../../modules/tenant/models/branch.model';
import type { EdgePosTerminalModel } from '../../modules/tenant/models/edge-pos-terminal.model';
import type { BrandMenuCategoryModel } from '../../modules/catalog/models/brand-menu-category.model';
import type { BrandMenuItemModel } from '../../modules/catalog/models/brand-menu-item.model';
import type { PricePolicyModel } from '../../modules/catalog/models/price-policy.model';
import type { PromotionModel } from '../../modules/catalog/models/promotion.model';

export interface CentralGraphQLRequest {
  user?: {
    sub: string;
    loginId: string;
    roleCode: string;
    userType: 'SuperAdmin' | 'ChannelUser';
    tenantContext?: {
      distributorId?: string;
      brandHQId?: string;
      branchId?: string;
    };
  };
  [key: string]: unknown;
}

export interface CentralGraphQLLoaders {
  brandsByDistributorId: DataLoader<string, BrandProfileModel[]>;
  branchesByBrandHQId: DataLoader<string, BranchModel[]>;
  edgePosTerminalsByBranchId: DataLoader<string, EdgePosTerminalModel[]>;
  menuCategoriesByBrandHQId: DataLoader<string, BrandMenuCategoryModel[]>;
  menuItemsByBrandHQId: DataLoader<string, BrandMenuItemModel[]>;
  pricePoliciesByBrandHQId: DataLoader<string, PricePolicyModel[]>;
  promotionsByBrandHQId: DataLoader<string, PromotionModel[]>;
}

export interface CentralGraphQLContext {
  req: CentralGraphQLRequest;
  loaders: CentralGraphQLLoaders;
}
