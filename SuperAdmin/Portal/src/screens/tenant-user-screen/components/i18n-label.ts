/**
 * Locale-aware label picker for RBAC Role/Permission rows.
 * name (vi default) / nameKo / nameEn  및  description / descriptionKo / descriptionEn 공통.
 * 이 헬퍼가 raw-key 노출 버그의 실제 해결점이다.
 */
export type LocaleKey = 'ko' | 'en' | 'vi';

interface LabelFields {
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
}

interface DescriptionFields {
  description?: string | null;
  descriptionKo?: string | null;
  descriptionEn?: string | null;
}

export function pickLabel(locale: string, fields: LabelFields, fallback: string): string {
  if (locale === 'ko') return fields.nameKo ?? fields.name ?? fallback;
  if (locale === 'en') return fields.nameEn ?? fields.name ?? fallback;
  return fields.name ?? fields.nameEn ?? fields.nameKo ?? fallback;
}

export function pickDescription(locale: string, fields: DescriptionFields, fallback = ''): string {
  if (locale === 'ko') return fields.descriptionKo ?? fields.description ?? fallback;
  if (locale === 'en') return fields.descriptionEn ?? fields.description ?? fallback;
  return fields.description ?? fields.descriptionEn ?? fields.descriptionKo ?? fallback;
}
