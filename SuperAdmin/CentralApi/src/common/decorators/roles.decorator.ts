/**
 * 한국어: 역할 기반 접근 제어(RBAC)를 위한 커스텀 메타데이터 데코레이터.
 *   GraphQL 리졸버 또는 컨트롤러 메서드에 @Roles('PLATFORM_SUPER_ADMIN', 'BRAND_OWNER') 형태로
 *   적용하면, 해당 엔드포인트에 접근 가능한 역할 목록을 메타데이터로 저장한다.
 *   RolesGuard에서 이 메타데이터를 읽어 사용자의 역할과 비교하여 접근을 허용/거부한다.
 *
 * Tiếng Việt: Decorator metadata tùy chỉnh cho Kiểm soát truy cập dựa trên vai trò (RBAC).
 *   Khi áp dụng dạng @Roles('PLATFORM_SUPER_ADMIN', 'BRAND_OWNER') vào GraphQL resolver
 *   hoặc phương thức controller, lưu danh sách vai trò được phép truy cập endpoint dưới dạng metadata.
 *   RolesGuard đọc metadata này để so sánh với vai trò của người dùng và cho phép/từ chối truy cập.
 */
import { SetMetadata } from '@nestjs/common';

/**
 * 한국어: Reflector가 메타데이터를 조회할 때 사용하는 키 상수.
 *   RolesGuard에서 동일한 키로 메타데이터를 읽는다.
 *
 * Tiếng Việt: Hằng số khóa mà Reflector sử dụng khi truy vấn metadata.
 *   RolesGuard đọc metadata bằng cùng khóa này.
 */
export const ROLES_KEY = 'roles';

/**
 * 한국어: @Roles() 데코레이터 함수. 가변 인자로 역할 코드 문자열을 받아 메타데이터에 저장한다.
 *   사용 예: @Roles('PLATFORM_SUPER_ADMIN', 'REGIONAL_DISTRIBUTOR_ADMIN')
 *
 * Tiếng Việt: Hàm decorator @Roles(). Nhận các chuỗi mã vai trò dạng tham số biến đổi
 *   và lưu vào metadata.
 *   Ví dụ sử dụng: @Roles('PLATFORM_SUPER_ADMIN', 'REGIONAL_DISTRIBUTOR_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
