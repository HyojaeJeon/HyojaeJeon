/**
 * 한국어: 다국어 필드를 locale 기반으로 해석하는 유틸.
 *   DB에 저장된 {field} (vi) / {field}Ko / {field}En 3벌 중
 *   요청 locale에 맞는 값을 {field}에 덮어씌운다.
 *   클라이언트는 {field}만 읽으면 된다.
 *
 * Tiếng Việt: Tiện ích phân giải trường đa ngôn ngữ theo locale.
 *   Từ 3 bản {field} (vi) / {field}Ko / {field}En trong DB,
 *   chọn giá trị phù hợp locale và ghi đè vào {field}.
 *   Client chỉ cần đọc {field}.
 */

import type { SupportedLocale } from './locale.util';

/**
 * 다국어 필드 매핑 정의.
 * 예: { title: ['titleKo', 'titleEn'] }
 * → locale='ko' 이면 row.title = row.titleKo ?? row.title
 */
type LocalizedFieldMap = Record<string, [koField: string, enField: string]>;

/**
 * 단일 row의 다국어 필드를 locale 기반으로 해석.
 * vi(기본): 원본 필드 유지
 * ko: {field}Ko 값으로 덮어쓰기 (없으면 원본 유지)
 * en: {field}En 값으로 덮어쓰기 (없으면 원본 유지)
 */
export function resolveLocalizedRow<T extends Record<string, unknown>>(
  row: T,
  locale: SupportedLocale,
  fieldMap: LocalizedFieldMap,
): T {
  if (locale === 'vi') return row; // vi가 기본 — 원본 그대로

  // Prisma 객체는 frozen/prototype-bound일 수 있으므로 plain object로 변환
  const resolved = JSON.parse(JSON.stringify(row)) as T;
  for (const [baseField, [koField, enField]] of Object.entries(fieldMap)) {
    const localeField = locale === 'ko' ? koField : enField;
    const localeValue = row[localeField];
    if (localeValue != null && localeValue !== '') {
      (resolved as Record<string, unknown>)[baseField] = localeValue;
    }
  }
  return resolved;
}

/**
 * 배열의 모든 row에 다국어 해석 적용.
 */
export function resolveLocalizedRows<T extends Record<string, unknown>>(
  rows: T[],
  locale: SupportedLocale,
  fieldMap: LocalizedFieldMap,
): T[] {
  if (locale === 'vi') return rows;
  return rows.map((row) => resolveLocalizedRow(row, locale, fieldMap));
}

/* ─────────────────────── 미리 정의된 필드 맵 ─────────────────────── */

/** Contract: title → titleKo / titleEn */
export const CONTRACT_FIELDS: LocalizedFieldMap = {
  title: ['titleKo', 'titleEn'],
};

/** ContractActivity: summary → summaryKo / summaryEn */
export const CONTRACT_ACTIVITY_FIELDS: LocalizedFieldMap = {
  summary: ['summaryKo', 'summaryEn'],
};

/** Permission: name → nameKo / nameEn, description → descriptionKo / descriptionEn */
export const PERMISSION_FIELDS: LocalizedFieldMap = {
  name: ['nameKo', 'nameEn'],
  description: ['descriptionKo', 'descriptionEn'],
};

/** Role: roleName → roleNameKo / roleNameEn, description → descriptionKo / descriptionEn */
export const ROLE_FIELDS: LocalizedFieldMap = {
  roleName: ['roleNameKo', 'roleNameEn'],
  description: ['descriptionKo', 'descriptionEn'],
};

/** BrandProfile: brandName → brandNameKo / brandNameEn */
export const BRAND_FIELDS: LocalizedFieldMap = {
  brandName: ['brandNameKo', 'brandNameEn'],
};

/** BrandMenuItem: itemName → itemNameKo / itemNameEn, description → descriptionKo / descriptionEn */
export const MENU_ITEM_FIELDS: LocalizedFieldMap = {
  itemName: ['itemNameKo', 'itemNameEn'],
  description: ['descriptionKo', 'descriptionEn'],
};

/** PricePolicy: name → nameKo / nameEn */
export const PRICE_POLICY_FIELDS: LocalizedFieldMap = {
  name: ['nameKo', 'nameEn'],
};

/** Promotion: name → nameKo / nameEn */
export const PROMOTION_FIELDS: LocalizedFieldMap = {
  name: ['nameKo', 'nameEn'],
};
