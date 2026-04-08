/**
 * 한국어: 인증 없이 접근 가능한 공개(Public) 엔드포인트를 선언하는 커스텀 데코레이터.
 *   GraphQL 리졸버 또는 컨트롤러 메서드에 @Public()을 적용하면,
 *   GqlAuthGuard가 해당 엔드포인트의 JWT 인증 검사를 건너뛴다.
 *   로그인, 헬스체크 등 인증이 필요 없는 엔드포인트에 사용한다.
 *
 * Tiếng Việt: Decorator tùy chỉnh để khai báo endpoint công khai (Public) có thể truy cập
 *   mà không cần xác thực. Khi áp dụng @Public() vào GraphQL resolver hoặc phương thức controller,
 *   GqlAuthGuard sẽ bỏ qua việc kiểm tra xác thực JWT cho endpoint đó.
 *   Sử dụng cho các endpoint không cần xác thực như đăng nhập, health check, v.v.
 */
import { SetMetadata } from '@nestjs/common';

/**
 * 한국어: GqlAuthGuard가 공개 엔드포인트 여부를 확인할 때 사용하는 메타데이터 키 상수.
 *
 * Tiếng Việt: Hằng số khóa metadata mà GqlAuthGuard sử dụng để kiểm tra endpoint có phải
 *   là công khai hay không.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 한국어: @Public() 데코레이터 함수. 적용된 핸들러의 isPublic 메타데이터를 true로 설정한다.
 *   사용 예: @Public() 을 @Query() 또는 @Mutation() 위에 붙인다.
 *
 * Tiếng Việt: Hàm decorator @Public(). Đặt metadata isPublic của handler được áp dụng thành true.
 *   Ví dụ sử dụng: Đặt @Public() phía trên @Query() hoặc @Mutation().
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
