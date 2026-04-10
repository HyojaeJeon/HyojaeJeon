import { gql } from '@apollo/client';

export const AUDIT_LOG_CONNECTION_QUERY = gql`
  query AuditLogList($first: Int!, $after: String) {
    auditLogConnection(first: $first, after: $after) {
      success {
        data {
          edges {
            cursor
            node {
              id
              createdAt
              actorType
              actorId
              actionType
              targetType
              targetId
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
      error { code message }
    }
  }
`;

export interface AuditLogRow {
  id: string;
  createdAt: string;
  actorType: string;
  actorId: string | null;
  actionType: string;
  targetType: string;
  targetId: string | null;
}

export interface AuditLogData {
  auditLogConnection: {
    success: {
      data: {
        edges: Array<{ cursor: string; node: AuditLogRow }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}

/* ─────────────────────────── Reference ─────────────────────────── */

export const CURRENCIES_QUERY = gql`
  query Currencies($skip: Int!, $take: Int!) {
    currencies(skip: $skip, take: $take) {
      success {
        data { id currencyCode currencyName symbol decimalDigits isActive isDefault }
      }
      error { code message }
    }
  }
`;
export interface CurrencyRow {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string | null;
  decimalDigits: number;
  isActive: boolean;
  isDefault: boolean;
}
export interface CurrenciesData {
  currencies: { success: { data: CurrencyRow[] } | null; error: { code: string; message: string } | null };
}

export const LANGUAGES_QUERY = gql`
  query Languages($skip: Int!, $take: Int!) {
    languages(skip: $skip, take: $take) {
      success {
        data { id languageCode nativeName displayName direction isDefault }
      }
      error { code message }
    }
  }
`;
export interface LanguageRow {
  id: string;
  languageCode: string;
  nativeName: string;
  displayName: string;
  direction: string;
  isDefault: boolean;
}
export interface LanguagesData {
  languages: { success: { data: LanguageRow[] } | null; error: { code: string; message: string } | null };
}

export const REGIONS_QUERY = gql`
  query Regions($skip: Int!, $take: Int!) {
    regions(skip: $skip, take: $take) {
      success {
        data { id regionCode regionName countryCode timeZoneCode isActive }
      }
      error { code message }
    }
  }
`;
export interface RegionRow {
  id: string;
  regionCode: string;
  regionName: string;
  countryCode: string;
  timeZoneCode: string | null;
  isActive: boolean;
}
export interface RegionsData {
  regions: { success: { data: RegionRow[] } | null; error: { code: string; message: string } | null };
}
