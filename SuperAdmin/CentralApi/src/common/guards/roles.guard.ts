/**
 * 한국어: 역할 계층(Role Hierarchy) 기반의 접근 제어 가드.
 *   @Roles() 데코레이터로 지정된 최소 역할 등급 이상의 사용자만 접근을 허용한다.
 *   역할 간에 계층 구조가 있어, 상위 역할은 하위 역할이 접근 가능한 리소스에도 접근할 수 있다.
 *   예: PLATFORM_SUPER_ADMIN(100)은 BRAND_OWNER(70) 이상을 요구하는 엔드포인트에 접근 가능.
 *   GqlAuthGuard 이후에 실행되어, 인증된 사용자의 권한을 추가로 확인한다.
 *
 * Tiếng Việt: Guard kiểm soát truy cập dựa trên Phân cấp vai trò (Role Hierarchy).
 *   Chỉ cho phép người dùng có cấp vai trò tối thiểu trở lên (được chỉ định qua decorator @Roles())
 *   truy cập. Có cấu trúc phân cấp giữa các vai trò, vai trò cấp cao hơn có thể truy cập
 *   tài nguyên mà vai trò cấp thấp hơn được phép.
 *   Ví dụ: PLATFORM_SUPER_ADMIN(100) có thể truy cập endpoint yêu cầu BRAND_OWNER(70) trở lên.
 *   Chạy sau GqlAuthGuard để kiểm tra thêm quyền hạn của người dùng đã xác thực.
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';

/**
 * 한국어: 역할 계층 정의. 숫자가 높을수록 상위 권한을 의미한다.
 *   - PLATFORM_SUPER_ADMIN(100): 플랫폼 최고 관리자 (공급사)
 *   - PLATFORM_SUPPORT_ENGINEER(90): 플랫폼 기술 지원 엔지니어
 *   - REGIONAL_DISTRIBUTOR_ADMIN(80): 지역 대리점 관리자
 *   - BRAND_OWNER(70): 브랜드 소유자
 *   - BRAND_HQ_ADMIN(60): 브랜드 본사 관리자
 *   - BRAND_HQ_OPERATOR(50): 브랜드 본사 운영자
 *   - BRANCH_MANAGER(40): 지점 매니저
 *   - STORE_OPERATOR(30): 매장 운영자 (POS 사용자)
 *
 * Tiếng Việt: Định nghĩa phân cấp vai trò. Số càng cao nghĩa là quyền hạn càng cao.
 *   - PLATFORM_SUPER_ADMIN(100): Quản trị viên cao nhất của nền tảng (nhà cung cấp)
 *   - PLATFORM_SUPPORT_ENGINEER(90): Kỹ sư hỗ trợ kỹ thuật nền tảng
 *   - REGIONAL_DISTRIBUTOR_ADMIN(80): Quản trị viên đại lý khu vực
 *   - BRAND_OWNER(70): Chủ sở hữu thương hiệu
 *   - BRAND_HQ_ADMIN(60): Quản trị viên trụ sở thương hiệu
 *   - BRAND_HQ_OPERATOR(50): Nhân viên vận hành trụ sở thương hiệu
 *   - BRANCH_MANAGER(40): Quản lý chi nhánh
 *   - STORE_OPERATOR(30): Nhân viên vận hành cửa hàng (người dùng POS)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  PLATFORM_SUPER_ADMIN: 100,
  PLATFORM_SUPPORT_ENGINEER: 90,
  REGIONAL_DISTRIBUTOR_ADMIN: 80,
  BRAND_OWNER: 70,
  BRAND_HQ_ADMIN: 60,
  BRAND_HQ_OPERATOR: 50,
  BRANCH_MANAGER: 40,
  STORE_OPERATOR: 30,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * 한국어: 요청자의 역할이 필요한 최소 역할 등급 이상인지 확인하는 메서드.
   *   1. Reflector로 @Roles() 메타데이터에서 요구 역할 목록을 조회한다.
   *   2. 요구 역할이 없으면 모든 인증된 사용자에게 접근을 허용한다.
   *   3. GraphQL 컨텍스트에서 JWT 페이로드의 사용자 정보를 추출한다.
   *   4. 사용자의 역할 등급이 요구 역할 중 하나 이상의 등급 이상이면 접근을 허용한다.
   *
   * Tiếng Việt: Phương thức kiểm tra xem vai trò của người yêu cầu có đạt cấp tối thiểu
   *   yêu cầu hay không.
   *   1. Dùng Reflector để truy vấn danh sách vai trò yêu cầu từ metadata @Roles().
   *   2. Nếu không có vai trò yêu cầu, cho phép tất cả người dùng đã xác thực truy cập.
   *   3. Trích xuất thông tin người dùng từ JWT payload trong ngữ cảnh GraphQL.
   *   4. Cho phép truy cập nếu cấp vai trò của người dùng >= cấp của ít nhất một vai trò yêu cầu.
   */
  canActivate(context: ExecutionContext): boolean {
    // 한국어: 핸들러와 클래스에서 @Roles() 메타데이터를 조회
    // Tiếng Việt: Truy vấn metadata @Roles() từ handler và class
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 한국어: @Roles()가 없으면 역할 제한 없이 통과 (인증만 되면 허용)
    // Tiếng Việt: Nếu không có @Roles(), cho phép không giới hạn vai trò (chỉ cần xác thực)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // 한국어: GraphQL 컨텍스트에서 인증된 사용자 정보를 추출
    // Tiếng Việt: Trích xuất thông tin người dùng đã xác thực từ ngữ cảnh GraphQL
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req?.user as JwtPayload | undefined;
    if (!user) return false;

    // 한국어: 사용자의 역할 등급을 조회 (알 수 없는 역할은 0으로 처리)
    // Tiếng Việt: Tra cứu cấp vai trò của người dùng (vai trò không xác định được xử lý là 0)
    const userLevel = ROLE_HIERARCHY[user.roleCode] ?? 0;

    // 한국어: 요구 역할 중 하나라도 사용자 등급 이상이면 접근 허용.
    //   알 수 없는 요구 역할은 Infinity로 처리하여 절대 통과 불가.
    // Tiếng Việt: Cho phép truy cập nếu cấp người dùng >= ít nhất một vai trò yêu cầu.
    //   Vai trò yêu cầu không xác định được xử lý là Infinity nên không bao giờ cho phép.
    return requiredRoles.some((role) => userLevel >= (ROLE_HIERARCHY[role] ?? Infinity));
  }
}
