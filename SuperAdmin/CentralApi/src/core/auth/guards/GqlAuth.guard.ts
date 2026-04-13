/**
 * 한국어: GraphQL 요청에 대한 JWT 인증 가드.
 *   NestJS의 AuthGuard('jwt')를 확장하여 GraphQL 실행 컨텍스트에서 동작하도록 구현한다.
 *   @Public() 데코레이터가 적용된 엔드포인트는 인증을 건너뛰고,
 *   그 외 모든 요청은 JWT 토큰의 유효성을 검증한다.
 *   Passport JWT 전략과 연동하여 토큰 파싱 및 사용자 정보 추출을 수행한다.
 *
 * Tiếng Việt: Guard xác thực JWT cho các yêu cầu GraphQL.
 *   Mở rộng AuthGuard('jwt') của NestJS để hoạt động trong ngữ cảnh thực thi GraphQL.
 *   Endpoint có decorator @Public() sẽ bỏ qua xác thực,
 *   tất cả yêu cầu khác sẽ được xác minh tính hợp lệ của JWT token.
 *   Liên kết với chiến lược Passport JWT để parse token và trích xuất thông tin người dùng.
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/Public.decorator';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 한국어: 요청의 인증 여부를 결정하는 메서드.
   *   1. Reflector를 사용하여 핸들러 또는 클래스 레벨에서 isPublic 메타데이터를 확인한다.
   *   2. @Public()이 적용된 경우 true를 반환하여 인증 없이 접근을 허용한다.
   *   3. 그 외에는 상위 AuthGuard의 canActivate를 호출하여 JWT 토큰을 검증한다.
   *
   * Tiếng Việt: Phương thức quyết định xác thực yêu cầu.
   *   1. Sử dụng Reflector để kiểm tra metadata isPublic ở cấp handler hoặc class.
   *   2. Nếu @Public() được áp dụng, trả về true để cho phép truy cập không cần xác thực.
   *   3. Trường hợp khác, gọi canActivate của AuthGuard cha để xác minh JWT token.
   */
  canActivate(context: ExecutionContext) {
    // 한국어: 핸들러와 클래스 양쪽에서 isPublic 메타데이터를 확인 (핸들러 우선)
    // Tiếng Việt: Kiểm tra metadata isPublic từ cả handler và class (ưu tiên handler)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  /**
   * 한국어: GraphQL 컨텍스트에서 HTTP 요청 객체를 추출하는 메서드.
   *   기본 AuthGuard는 REST 컨텍스트를 기대하므로, GraphQL 환경에서는
   *   GqlExecutionContext로 변환하여 요청 객체를 가져와야 한다.
   *   Passport가 이 요청 객체의 user 속성에 인증된 사용자 정보를 저장한다.
   *
   * Tiếng Việt: Phương thức trích xuất đối tượng HTTP request từ ngữ cảnh GraphQL.
   *   AuthGuard mặc định mong đợi ngữ cảnh REST, nên trong môi trường GraphQL
   *   cần chuyển đổi sang GqlExecutionContext để lấy đối tượng request.
   *   Passport lưu thông tin người dùng đã xác thực vào thuộc tính user của request này.
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
