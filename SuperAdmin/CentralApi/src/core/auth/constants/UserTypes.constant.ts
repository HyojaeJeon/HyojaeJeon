/**
 * 한국어:
 *   플랫폼에서 인증할 수 있는 사용자 유형(User Type) 상수를 정의합니다.
 *   - SUPER_ADMIN       : 플랫폼 최고 관리자 (모든 권한)
 *   - DISTRIBUTOR_USER   : 지역 총판 사용자
 *   - BRAND_ADMIN        : 브랜드(가맹본부) 관리자
 *   - CORPORATE_ADMIN    : 기업(법인) 관리자
 *
 *   `as const` 를 사용하면 배열이 읽기 전용(readonly) 튜플이 되어,
 *   TypeScript 가 각 요소를 정확한 문자열 리터럴로 인식합니다.
 *   AuthUserType 은 이 배열에서 자동으로 만들어지는 유니온 타입입니다.
 *
 * Tiếng Việt:
 *   Định nghĩa hằng số các loại người dùng (User Type) có thể xác thực trên nền tảng.
 *   - SUPER_ADMIN       : Quản trị viên cao nhất (toàn quyền)
 *   - DISTRIBUTOR_USER   : Người dùng nhà phân phối khu vực
 *   - BRAND_ADMIN        : Quản trị viên thương hiệu (trụ sở chính)
 *   - CORPORATE_ADMIN    : Quản trị viên doanh nghiệp (pháp nhân)
 *
 *   `as const` biến mảng thành tuple chỉ đọc (readonly),
 *   giúp TypeScript nhận diện từng phần tử là chuỗi literal chính xác.
 *   AuthUserType là kiểu union được tạo tự động từ mảng này.
 */

// 플랫폼 계층별 4가지 사용자 유형 / 4 loại người dùng theo cấp bậc nền tảng
// `as const` → 읽기 전용 튜플로 만들어 타입 안전성 확보 / biến thành tuple readonly để đảm bảo an toàn kiểu
export const AUTH_USER_TYPES = [
  'SUPER_ADMIN',
  'DISTRIBUTOR_USER',
  'BRAND_ADMIN',
  'CORPORATE_ADMIN',
] as const;

// 배열의 요소들로부터 유니온 타입을 자동 생성: 'SUPER_ADMIN' | 'DISTRIBUTOR_USER' | ...
// Tạo union type tự động từ các phần tử mảng: 'SUPER_ADMIN' | 'DISTRIBUTOR_USER' | ...
export type AuthUserType = (typeof AUTH_USER_TYPES)[number];

// 기본 사용자 유형 (특별히 지정하지 않으면 SUPER_ADMIN)
// Loại người dùng mặc định (nếu không chỉ định thì là SUPER_ADMIN)
export const DEFAULT_AUTH_USER_TYPE: AuthUserType = 'SUPER_ADMIN';

// 타입 가드 함수: 문자열이 유효한 사용자 유형인지 런타임에 검사합니다.
// `value is AuthUserType` 반환 타입 덕분에, 이 함수를 통과하면 TypeScript 가
// 해당 변수를 AuthUserType 으로 자동 좁혀(narrow) 줍니다.
//
// Hàm type guard: kiểm tra xem chuỗi có phải loại người dùng hợp lệ không (lúc runtime).
// Nhờ kiểu trả về `value is AuthUserType`, sau khi qua hàm này TypeScript
// tự động thu hẹp (narrow) biến thành AuthUserType.
export function isAuthUserType(value: string): value is AuthUserType {
  return (AUTH_USER_TYPES as readonly string[]).includes(value);
}
