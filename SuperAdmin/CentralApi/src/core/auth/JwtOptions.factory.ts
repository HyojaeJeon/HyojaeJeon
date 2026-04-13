/**
 * 한국어:
 *   JWT(JSON Web Token) 모듈 옵션을 환경 변수로부터 생성하는 팩토리 함수입니다.
 *
 *   JWT 란? — 사용자 인증 정보를 담은 서명된 토큰입니다.
 *   서버가 비밀 키(secret)로 서명하고, 클라이언트가 이 토큰을 보내면
 *   서버가 서명을 검증하여 "이 사용자가 맞다"고 확인합니다.
 *
 *   프로덕션에서 기본 비밀 키('change-me-in-production')를 그대로 쓰면
 *   누구나 토큰을 위조할 수 있으므로, 반드시 안전한 비밀 키를 설정해야 합니다.
 *
 * Tiếng Việt:
 *   Hàm factory tạo tùy chọn module JWT từ biến môi trường.
 *
 *   JWT là gì? — Là token đã ký chứa thông tin xác thực người dùng.
 *   Server ký bằng khóa bí mật (secret), client gửi token này,
 *   server xác minh chữ ký để xác nhận "đây đúng là người dùng đó".
 *
 *   Trong production, nếu dùng khóa mặc định ('change-me-in-production')
 *   thì ai cũng có thể giả mạo token, nên bắt buộc phải cấu hình khóa an toàn.
 */
import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

import { parseExpiresIn } from './parseExpiresIn';

export function createJwtModuleOptions(
  configService: ConfigService,
): JwtModuleOptions {
  // 환경 변수에서 JWT 비밀 키를 읽습니다 / Đọc khóa bí mật JWT từ biến môi trường
  const secret = configService.get<string>('JWT_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // 프로덕션에서 안전하지 않은 비밀 키를 사용하면 서버 시작을 차단합니다.
  // 이유: 기본 키로는 누구나 유효한 토큰을 만들 수 있어 보안이 무너집니다.
  //
  // Chặn khởi động server nếu dùng khóa không an toàn trong production.
  // Lý do: với khóa mặc định, ai cũng có thể tạo token hợp lệ → mất bảo mật.
  if (nodeEnv === 'production' && (!secret || secret === 'change-me-in-production')) {
    throw new Error('JWT_SECRET must be configured securely in production');
  }

  return {
    secret: secret || 'change-me-in-production',
    signOptions: {
      // expiresIn: 토큰 유효 시간(초). 86400초 = 24시간.
      // 이 시간이 지나면 토큰이 만료되어 재로그인 또는 리프레시가 필요합니다.
      //
      // expiresIn: thời gian hiệu lực token (giây). 86400 giây = 24 giờ.
      // Sau thời gian này token hết hạn, cần đăng nhập lại hoặc refresh.
      expiresIn: parseExpiresIn(
        configService.get<string>('JWT_EXPIRES_IN', '1d'),
      ),
    },
  };
}
