/**
 * 한국어: 플랫폼 역할(Role) 코드 및 계층 구조 정의.
 *   SuperAdmin 플랫폼에서 사용되는 모든 역할 코드를 열거형으로 정의하고,
 *   역할 간 계층 관계를 숫자 값으로 표현한다.
 *   숫자가 높을수록 더 높은 권한을 가진다.
 *   이 값은 RolesGuard에서 접근 제어 시 참조된다.
 *
 * Tiếng Việt: Định nghĩa mã vai trò (Role) và cấu trúc phân cấp của nền tảng.
 *   Định nghĩa tất cả mã vai trò được sử dụng trong nền tảng SuperAdmin dưới dạng enum,
 *   và biểu diễn mối quan hệ phân cấp giữa các vai trò bằng giá trị số.
 *   Số càng cao thì quyền hạn càng lớn.
 *   Giá trị này được RolesGuard tham chiếu khi kiểm soát truy cập.
 */

/**
 * 한국어: 플랫폼 역할 코드 열거형.
 *   - PLATFORM_SUPER_ADMIN: 플랫폼 최고 관리자 (공급사 최상위)
 *   - PLATFORM_SUPPORT_ENGINEER: 플랫폼 기술 지원 엔지니어
 *   - REGIONAL_DISTRIBUTOR_ADMIN: 지역 대리점/유통사 관리자
 *   - BRAND_OWNER: 브랜드 소유자
 *   - BRAND_HQ_ADMIN: 브랜드 본사 관리자
 *   - BRAND_HQ_OPERATOR: 브랜드 본사 운영자
 *   - BRANCH_MANAGER: 지점 매니저
 *   - STORE_OPERATOR: 매장 운영자 (POS 사용자)
 *
 * Tiếng Việt: Enum mã vai trò nền tảng.
 *   - PLATFORM_SUPER_ADMIN: Quản trị viên cao nhất nền tảng (cấp cao nhất nhà cung cấp)
 *   - PLATFORM_SUPPORT_ENGINEER: Kỹ sư hỗ trợ kỹ thuật nền tảng
 *   - REGIONAL_DISTRIBUTOR_ADMIN: Quản trị viên đại lý/nhà phân phối khu vực
 *   - BRAND_OWNER: Chủ sở hữu thương hiệu
 *   - BRAND_HQ_ADMIN: Quản trị viên trụ sở thương hiệu
 *   - BRAND_HQ_OPERATOR: Nhân viên vận hành trụ sở thương hiệu
 *   - BRANCH_MANAGER: Quản lý chi nhánh
 *   - STORE_OPERATOR: Nhân viên vận hành cửa hàng (người dùng POS)
 */
export enum RoleCode {
  PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
  PLATFORM_SUPPORT_ENGINEER = 'PLATFORM_SUPPORT_ENGINEER',
  REGIONAL_DISTRIBUTOR_ADMIN = 'REGIONAL_DISTRIBUTOR_ADMIN',
  BRAND_OWNER = 'BRAND_OWNER',
  BRAND_HQ_ADMIN = 'BRAND_HQ_ADMIN',
  BRAND_HQ_OPERATOR = 'BRAND_HQ_OPERATOR',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  STORE_OPERATOR = 'STORE_OPERATOR',
}

/**
 * 한국어: 역할 계층 구조. 숫자가 높을수록 상위 권한이다.
 *   예: PLATFORM_SUPER_ADMIN(100)은 모든 역할보다 상위이며,
 *   STORE_OPERATOR(30)은 가장 하위 역할이다.
 *
 * Tiếng Việt: Cấu trúc phân cấp vai trò. Số càng cao thì quyền hạn càng lớn.
 *   Ví dụ: PLATFORM_SUPER_ADMIN (100) có quyền cao nhất,
 *   STORE_OPERATOR (30) là vai trò thấp nhất.
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  [RoleCode.PLATFORM_SUPER_ADMIN]: 100,
  [RoleCode.PLATFORM_SUPPORT_ENGINEER]: 90,
  [RoleCode.REGIONAL_DISTRIBUTOR_ADMIN]: 80,
  [RoleCode.BRAND_OWNER]: 70,
  [RoleCode.BRAND_HQ_ADMIN]: 60,
  [RoleCode.BRAND_HQ_OPERATOR]: 50,
  [RoleCode.BRANCH_MANAGER]: 40,
  [RoleCode.STORE_OPERATOR]: 30,
};
