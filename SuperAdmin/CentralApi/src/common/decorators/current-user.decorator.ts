/**
 * 한국어: 현재 인증된 사용자 정보를 GraphQL 리졸버에서 추출하는 커스텀 파라미터 데코레이터.
 *   JWT 토큰에서 파싱된 사용자 페이로드(JwtPayload)를 리졸버 메서드의 파라미터로 직접 주입한다.
 *   NestJS의 createParamDecorator를 활용하여, GraphQL 실행 컨텍스트에서 request.user 객체를 반환한다.
 *
 * Tiếng Việt: Decorator tham số tùy chỉnh dùng để trích xuất thông tin người dùng đã xác thực
 *   từ GraphQL resolver. Inject trực tiếp payload người dùng (JwtPayload) đã được parse từ JWT token
 *   vào tham số của phương thức resolver. Sử dụng createParamDecorator của NestJS để trả về
 *   đối tượng request.user từ ngữ cảnh thực thi GraphQL.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * 한국어: JWT 토큰 페이로드의 타입 정의.
 *   - sub: 사용자 고유 식별자 (UUID)
 *   - loginId: 로그인 ID
 *   - roleCode: 역할 코드 (PLATFORM_SUPER_ADMIN, BRAND_OWNER 등)
 *   - userType: 사용자 유형 - SuperAdmin(공급사 관리자) 또는 ChannelUser(채널/대리점 사용자)
 *   - tenantContext: 멀티테넌트 컨텍스트 (대리점ID, 브랜드본사ID, 지점ID를 선택적으로 포함)
 *
 * Tiếng Việt: Định nghĩa kiểu cho payload của JWT token.
 *   - sub: Mã định danh duy nhất của người dùng (UUID)
 *   - loginId: ID đăng nhập
 *   - roleCode: Mã vai trò (PLATFORM_SUPER_ADMIN, BRAND_OWNER, v.v.)
 *   - userType: Loại người dùng - SuperAdmin (quản trị viên nhà cung cấp) hoặc ChannelUser (người dùng kênh/đại lý)
 *   - tenantContext: Ngữ cảnh đa thuê bao (tùy chọn bao gồm distributorId, brandHQId, branchId)
 */
export interface JwtPayload {
  sub: string;
  loginId: string;
  roleCode: string;
  userType: 'SuperAdmin' | 'ChannelUser';
  tenantContext?: {
    distributorId?: string;
    brandHQId?: string;
    branchId?: string;
  };
}

/**
 * 한국어: @CurrentUser() 파라미터 데코레이터.
 *   GraphQL 리졸버에서 @CurrentUser() user: JwtPayload 형태로 사용하면,
 *   GqlAuthGuard가 검증한 JWT 토큰의 사용자 정보를 자동으로 주입받을 수 있다.
 *   내부적으로 GqlExecutionContext를 생성하여 HTTP 요청 객체에서 user 속성을 추출한다.
 *
 * Tiếng Việt: Decorator tham số @CurrentUser().
 *   Khi sử dụng dạng @CurrentUser() user: JwtPayload trong GraphQL resolver,
 *   tự động inject thông tin người dùng từ JWT token đã được GqlAuthGuard xác thực.
 *   Bên trong tạo GqlExecutionContext để trích xuất thuộc tính user từ đối tượng HTTP request.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    // 한국어: GraphQL 실행 컨텍스트를 생성하여 HTTP 요청 객체에 접근
    // Tiếng Việt: Tạo ngữ cảnh thực thi GraphQL để truy cập đối tượng HTTP request
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // 한국어: Passport JWT 전략이 검증 후 request.user에 저장한 페이로드를 반환
    // Tiếng Việt: Trả về payload mà chiến lược Passport JWT đã lưu vào request.user sau khi xác thực
    return request.user as JwtPayload;
  },
);
