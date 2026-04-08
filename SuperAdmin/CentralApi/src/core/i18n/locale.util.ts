/**
 * 한국어: locale 헤더 정규화 유틸.
 *   - 'ko-KR', 'ko_KR', 'KO' 등을 'ko' 로 정규화한다.
 *   - Accept-Language 헤더의 q-value 우선순위를 파싱해 가장 적합한 지원 locale 을 선택한다.
 *   - 지원 locale 이 없으면 default 를 반환한다.
 *
 * Tiếng Việt: Tiện ích chuẩn hoá locale header.
 */
export const SUPPORTED_LOCALES = ['ko', 'en', 'vi'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function normalizeLocale(raw?: string | null): SupportedLocale | null {
  if (!raw) return null;
  const head = raw.toLowerCase().replace('_', '-').split('-')[0]?.trim();
  if (!head) return null;
  return (SUPPORTED_LOCALES as readonly string[]).includes(head)
    ? (head as SupportedLocale)
    : null;
}

interface AcceptLanguageEntry {
  tag: string;
  q: number;
}

function parseAcceptLanguage(header: string): AcceptLanguageEntry[] {
  return header
    .split(',')
    .map((part) => {
      const [tagRaw, ...params] = part.trim().split(';');
      let q = 1;
      for (const p of params) {
        const [k, v] = p.trim().split('=');
        if (k === 'q') q = Number(v);
      }
      return { tag: tagRaw?.trim() ?? '', q: Number.isFinite(q) ? q : 1 };
    })
    .filter((e) => e.tag.length > 0)
    .sort((a, b) => b.q - a.q);
}

export function pickLocaleFromAcceptLanguage(
  header?: string | null,
): SupportedLocale | null {
  if (!header) return null;
  for (const { tag } of parseAcceptLanguage(header)) {
    const norm = normalizeLocale(tag);
    if (norm) return norm;
  }
  return null;
}

/**
 * 한국어: locale 결정 우선순위.
 *   1) Accept-Language 헤더
 *   2) 사용자 / 테넌트 기본 언어
 *   3) DEFAULT_LOCALE ('en')
 */
export function resolveLocale(input: {
  acceptLanguage?: string | null;
  userLanguage?: string | null;
  tenantLanguage?: string | null;
}): SupportedLocale {
  return (
    pickLocaleFromAcceptLanguage(input.acceptLanguage) ??
    normalizeLocale(input.userLanguage) ??
    normalizeLocale(input.tenantLanguage) ??
    DEFAULT_LOCALE
  );
}
