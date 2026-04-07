import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import type { BrandProfileModel } from '../../modules/tenant/models/brand-profile.model';
import type { BranchModel } from '../../modules/tenant/models/branch.model';
import type { EdgePosTerminalModel } from '../../modules/tenant/models/edge-pos-terminal.model';
import type { BrandMenuCategoryModel } from '../../modules/catalog/models/brand-menu-category.model';
import type { BrandMenuItemModel } from '../../modules/catalog/models/brand-menu-item.model';
import type { PricePolicyModel } from '../../modules/catalog/models/price-policy.model';
import type { PromotionModel } from '../../modules/catalog/models/promotion.model';
import type { CentralGraphQLLoaders, CentralGraphQLRequest } from './graphql-context';
import {
  brandScopeWhere,
  branchScopeWhere,
  combineWhere,
  edgePosScopeWhere,
  menuCategoryScopeWhere,
  menuItemScopeWhere,
  pricePolicyScopeWhere,
  promotionScopeWhere,
} from '../tenant/tenant-scope';

type BrandMenuItemRow = Awaited<ReturnType<PrismaService['brandMenuItem']['findMany']>>[number];

function groupByKey<T>(
  keys: readonly string[],
  rows: T[],
  getKey: (row: T) => string,
): T[][] {
  const grouped = new Map<string, T[]>();

  for (const key of keys) {
    grouped.set(key, []);
  }

  for (const row of rows) {
    const key = getKey(row);
    const bucket = grouped.get(key);
    if (bucket) bucket.push(row);
  }

  return keys.map((key) => grouped.get(key) ?? []);
}

function createListLoader<T>(
  fetchRows: (keys: readonly string[]) => Promise<T[]>,
  getKey: (row: T) => string,
) {
  return new DataLoader<string, T[]>(async (keys) => {
    const normalizedKeys = [...keys];
    const rows = await fetchRows(normalizedKeys);
    return groupByKey(normalizedKeys, rows, getKey);
  });
}

function normalizeMenuItem(row: BrandMenuItemRow): BrandMenuItemModel {
  return {
    ...row,
    basePrice: Number(row.basePrice),
    taxRate: Number(row.taxRate),
  };
}

export function createRequestLoaders(
  prisma: PrismaService,
  getUser: () => CentralGraphQLRequest['user'] | undefined,
): CentralGraphQLLoaders {
  return {
    brandsByDistributorId: createListLoader<BrandProfileModel>(
      async (distributorIds) =>
        prisma.brandProfile.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              distributorId: { in: [...distributorIds] },
            },
            brandScopeWhere(getUser()),
          ),
          orderBy: [{ createdAt: 'desc' }, { brandCode: 'asc' }],
        }),
      (row) => row.distributorId,
    ),

    branchesByBrandHQId: createListLoader<BranchModel>(
      async (brandHQIds) =>
        prisma.branch.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            branchScopeWhere(getUser()),
          ),
          orderBy: [{ createdAt: 'desc' }, { branchCode: 'asc' }],
        }),
      (row) => row.brandHQId,
    ),

    edgePosTerminalsByBranchId: createListLoader<EdgePosTerminalModel>(
      async (branchIds) =>
        prisma.edgePosTerminal.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              branchId: { in: [...branchIds] },
            },
            edgePosScopeWhere(getUser()),
          ),
          orderBy: [{ createdAt: 'desc' }, { terminalCode: 'asc' }],
        }),
      (row) => row.branchId,
    ),

    menuCategoriesByBrandHQId: createListLoader<BrandMenuCategoryModel>(
      async (brandHQIds) =>
        prisma.brandMenuCategory.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            menuCategoryScopeWhere(getUser()),
          ),
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      (row) => row.brandHQId,
    ),

    menuItemsByBrandHQId: createListLoader<BrandMenuItemModel>(
      async (brandHQIds) =>
        prisma.brandMenuItem
          .findMany({
            where: combineWhere(
              {
                deletedAt: null,
                brandHQId: { in: [...brandHQIds] },
              },
              menuItemScopeWhere(getUser()),
            ),
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          })
          .then((rows) => rows.map(normalizeMenuItem)),
      (row) => row.brandHQId,
    ),

    pricePoliciesByBrandHQId: createListLoader<PricePolicyModel>(
      async (brandHQIds) =>
        prisma.pricePolicy.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            pricePolicyScopeWhere(getUser()),
          ),
          orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
        }),
      (row) => row.brandHQId,
    ),

    promotionsByBrandHQId: createListLoader<PromotionModel>(
      async (brandHQIds) =>
        prisma.promotion.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            promotionScopeWhere(getUser()),
          ),
          orderBy: [{ startAt: 'desc' }, { createdAt: 'desc' }],
        }),
      (row) => row.brandHQId,
    ),
  };
}
