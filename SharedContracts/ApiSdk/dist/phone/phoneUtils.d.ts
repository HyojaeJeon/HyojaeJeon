/**
 * E.164 전화번호 유효성 검사 및 정규화 유틸.
 *
 * 플랫폼 전화번호 표준: E.164 형식 (예: +84795050727, +821012345678).
 * 클라이언트/서버 양쪽에서 동일하게 사용한다.
 *
 * 규칙:
 *   - 저장/전송 시 항상 E.164 (+ 국가번호 + 로컬번호, 선행 0 제거)
 *   - 로컬 번호의 선행 0 은 자동 제거 (베트남 0795050727 → 795050727)
 *   - 지원 국가: VN (+84), KR (+82). 추가 시 PHONE_COUNTRIES 에 등록.
 */
export interface PhoneCountry {
    code: string;
    dialCode: string;
    /** 국가번호 제외 최소 자릿수 */
    minDigits: number;
    /** 국가번호 제외 최대 자릿수 */
    maxDigits: number;
    /** 정규식 (E.164 전체 매칭) */
    regex: RegExp;
}
export declare const PHONE_COUNTRIES: PhoneCountry[];
/**
 * 로컬 번호의 선행 0 을 제거한다.
 * 예: '0795050727' → '795050727'
 */
export declare function stripLeadingZero(localNumber: string): string;
/**
 * 국가코드 + 로컬번호 → E.164 문자열.
 * 선행 0 자동 제거, 숫자 외 문자 제거.
 *
 * @example
 * toE164('VN', '0795050727') // '+84795050727'
 * toE164('KR', '010-1234-5678') // '+821012345678'
 */
export declare function toE164(countryCode: string, localNumber: string): string;
/**
 * E.164 문자열 → { countryCode, localNumber } 파싱.
 * 매칭되는 국가가 없으면 null.
 */
export declare function parseE164(e164: string): {
    countryCode: string;
    localNumber: string;
} | null;
/**
 * E.164 전화번호 유효성 검사.
 *
 * @returns null 이면 유효, 문자열이면 에러 코드.
 */
export declare function validatePhone(e164: string): 'INVALID_FORMAT' | 'UNSUPPORTED_COUNTRY' | 'TOO_SHORT' | 'TOO_LONG' | null;
/**
 * 원시 전화번호를 정규화한다.
 * 선행 0 제거 + 국가번호 없으면 기본 국가(VN) 추가.
 *
 * @example
 * normalizePhone('0795050727')       // '+84795050727'
 * normalizePhone('+84795050727')     // '+84795050727'
 * normalizePhone('010-1234-5678', 'KR') // '+821012345678'
 */
export declare function normalizePhone(raw: string, defaultCountry?: string): string;
