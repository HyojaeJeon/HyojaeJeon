/**
 * 한국어: request-scoped DataLoader bag 팩토리.
 *   prisma 직접 쿼리만 수행하고, 결과 row shape 는 graphql-context.ts 의 로컬 인터페이스로
 *   반환한다. core 레이어가 platform 도메인 모델을 import 하지 않도록 분리되어 있다.
 *
 * Tiếng Việt: Factory DataLoader bag — chỉ phụ thuộc Prisma và shape row cục bộ.
 */
import DataLoader from 'dataloader';
import { PrismaService } from '@core/prisma/Prisma.service';
import {
  brandScopeWhere,
  branchScopeWhere,
  combineWhere,
  edgePosScopeWhere,
  menuCategoryScopeWhere,
  menuItemScopeWhere,
  pricePolicyScopeWhere,
  promotionScopeWhere,
} from '@core/tenancy/tenantScope';
import type {
  CentralGraphQLLoaders,
  CentralGraphQLRequest,
  LoaderBrandRow,
  LoaderBranchRow,
  LoaderEdgePosRow,
  LoaderMenuCategoryRow,
  LoaderMenuItemRow,
  LoaderPricePolicyRow,
  LoaderPromotionRow,
} from './graphqlContext';

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

/**
 * P1-6: maxBatchSize 를 명시하여 DataLoader 가 한 번에 처리하는 key 수를 제한한다.
 *   대용량 요청 (예: 1000+ id) 이 들어와도 DB 쿼리는 100 개 단위로 분할되어
 *   pool 고갈과 쿼리 플래너 부담을 완화한다.
 */
const DATA_LOADER_MAX_BATCH_SIZE = 100;

function createListLoader<T>(
  fetchRows: (keys: readonly string[]) => Promise<T[]>,
  getKey: (row: T) => string,
) {
  return new DataLoader<string, T[]>(
    async (keys) => {
      const normalizedKeys = [...keys];
      const rows = await fetchRows(normalizedKeys);
      return groupByKey(normalizedKeys, rows, getKey);
    },
    { maxBatchSize: DATA_LOADER_MAX_BATCH_SIZE },
  );
}

function normalizeMenuItem(row: BrandMenuItemRow): LoaderMenuItemRow {
  return {
    ...row,
    basePrice: Number(row.basePrice),
    taxRate: Number(row.taxRate),
  } as LoaderMenuItemRow;
}

export function createRequestLoaders(
  prisma: PrismaService,
  getUser: () => CentralGraphQLRequest['user'] | undefined,
): CentralGraphQLLoaders {
  return {
    brandsByDistributorId: createListLoader<LoaderBrandRow>(
      async (distributorIds) =>
        (await prisma.brandProfile.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              distributorId: { in: [...distributorIds] },
            },
            brandScopeWhere(getUser()),
          ),
          orderBy: [{ createdAt: 'desc' }, { brandCode: 'asc' }],
        })) as unknown as LoaderBrandRow[],
      (row) => row.distributorId,
    ),

    branchesByBrandHQId: createListLoader<LoaderBranchRow>(
      async (brandHQIds) =>
        (await prisma.branch.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            branchScopeWhere(getUser()),
          ),
          orderBy: [{ createdAt: 'desc' }, { branchCode: 'asc' }],
        })) as unknown as LoaderBranchRow[],
      (row) => row.brandHQId,
    ),

    edgePosTerminalsByBranchId: createListLoader<LoaderEdgePosRow>(
      async (branchIds) =>
        (await prisma.edgePosTerminal.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              branchId: { in: [...branchIds] },
            },
            edgePosScopeWhere(getUser()),
          ),
          orderBy: [{ createdAt: 'desc' }, { terminalCode: 'asc' }],
        })) as unknown as LoaderEdgePosRow[],
      (row) => row.branchId,
    ),

    menuCategoriesByBrandHQId: createListLoader<LoaderMenuCategoryRow>(
      async (brandHQIds) =>
        (await prisma.brandMenuCategory.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            menuCategoryScopeWhere(getUser()),
          ),
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        })) as unknown as LoaderMenuCategoryRow[],
      (row) => row.brandHQId,
    ),

    menuItemsByBrandHQId: createListLoader<LoaderMenuItemRow>(
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

    pricePoliciesByBrandHQId: createListLoader<LoaderPricePolicyRow>(
      async (brandHQIds) =>
        (await prisma.pricePolicy.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            pricePolicyScopeWhere(getUser()),
          ),
          orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
        })) as unknown as LoaderPricePolicyRow[],
      (row) => row.brandHQId,
    ),

    promotionsByBrandHQId: createListLoader<LoaderPromotionRow>(
      async (brandHQIds) =>
        (await prisma.promotion.findMany({
          where: combineWhere(
            {
              deletedAt: null,
              brandHQId: { in: [...brandHQIds] },
            },
            promotionScopeWhere(getUser()),
          ),
          orderBy: [{ startAt: 'desc' }, { createdAt: 'desc' }],
        })) as unknown as LoaderPromotionRow[],
      (row) => row.brandHQId,
    ),
  };
}
