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
export const PHONE_COUNTRIES = [
    {
        code: 'VN',
        dialCode: '+84',
        minDigits: 9,
        maxDigits: 10,
        // +84 뒤에 숫자 9~10자리
        regex: /^\+84\d{9,10}$/,
    },
    {
        code: 'KR',
        dialCode: '+82',
        minDigits: 9,
        maxDigits: 11,
        // +82 뒤에 숫자 9~11자리
        regex: /^\+82\d{9,11}$/,
    },
];
/**
 * 로컬 번호의 선행 0 을 제거한다.
 * 예: '0795050727' → '795050727'
 */
export function stripLeadingZero(localNumber) {
    return localNumber.replace(/^0+/, '');
}
/**
 * 국가코드 + 로컬번호 → E.164 문자열.
 * 선행 0 자동 제거, 숫자 외 문자 제거.
 *
 * @example
 * toE164('VN', '0795050727') // '+84795050727'
 * toE164('KR', '010-1234-5678') // '+821012345678'
 */
export function toE164(countryCode, localNumber) {
    const country = PHONE_COUNTRIES.find((c) => c.code === countryCode);
    if (!country)
        return '';
    const digitsOnly = localNumber.replace(/[^\d]/g, '');
    const cleaned = stripLeadingZero(digitsOnly);
    return `${country.dialCode}${cleaned}`;
}
/**
 * E.164 문자열 → { countryCode, localNumber } 파싱.
 * 매칭되는 국가가 없으면 null.
 */
export function parseE164(e164) {
    for (const c of PHONE_COUNTRIES) {
        if (e164.startsWith(c.dialCode)) {
            return { countryCode: c.code, localNumber: e164.slice(c.dialCode.length) };
        }
    }
    return null;
}
/**
 * E.164 전화번호 유효성 검사.
 *
 * @returns null 이면 유효, 문자열이면 에러 코드.
 */
export function validatePhone(e164) {
    if (!e164.startsWith('+'))
        return 'INVALID_FORMAT';
    const parsed = parseE164(e164);
    if (!parsed)
        return 'UNSUPPORTED_COUNTRY';
    const country = PHONE_COUNTRIES.find((c) => c.code === parsed.countryCode);
    if (parsed.localNumber.length < country.minDigits)
        return 'TOO_SHORT';
    if (parsed.localNumber.length > country.maxDigits)
        return 'TOO_LONG';
    if (!country.regex.test(e164))
        return 'INVALID_FORMAT';
    return null;
}
/**
 * 원시 전화번호를 정규화한다.
 * 선행 0 제거 + 국가번호 없으면 기본 국가(VN) 추가.
 *
 * @example
 * normalizePhone('0795050727')       // '+84795050727'
 * normalizePhone('+84795050727')     // '+84795050727'
 * normalizePhone('010-1234-5678', 'KR') // '+821012345678'
 */
export function normalizePhone(raw, defaultCountry = 'VN') {
    const cleaned = raw.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+')) {
        const parsed = parseE164(cleaned);
        if (parsed) {
            return toE164(parsed.countryCode, parsed.localNumber);
        }
        return cleaned;
    }
    return toE164(defaultCountry, cleaned);
}
