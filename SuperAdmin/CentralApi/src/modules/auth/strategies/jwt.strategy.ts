/**
 * 한국어: JWT 인증 전략 (Passport).
 *   NestJS Passport 모듈과 passport-jwt 전략을 활용하여 JWT 토큰 검증을 수행한다.
 *   Authorization 헤더의 Bearer 토큰에서 JWT를 추출하고,
 *   환경 변수 JWT_SECRET을 사용하여 서명을 검증한다.
 *   만료된 토큰은 거부된다 (ignoreExpiration: false).
 *
 * Tiếng Việt: Chiến lược xác thực JWT (Passport).
 *   Sử dụng module NestJS Passport và chiến lược passport-jwt để xác minh JWT token.
 *   Trích xuất JWT từ Bearer token trong header Authorization,
 *   và xác minh chữ ký bằng biến môi trường JWT_SECRET.
 *   Token hết hạn sẽ bị từ chối (ignoreExpiration: false).
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // 한국어: 환경 변수에서 JWT_SECRET을 로드하고, 미설정 시 즉시 에러를 발생시킨다.
    // Tiếng Việt: Tải JWT_SECRET từ biến môi trường, ném lỗi ngay nếu chưa cấu hình.
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not configured');

    super({
      // 한국어: Authorization: Bearer <token> 헤더에서 JWT를 추출
      // Tiếng Việt: Trích xuất JWT từ header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 한국어: 만료된 토큰 거부 (false = 만료 검사 활성)
      // Tiếng Việt: Từ chối token hết hạn (false = bật kiểm tra hết hạn)
      ignoreExpiration: false,
      // 한국어: JWT 서명 검증에 사용할 비밀키
      // Tiếng Việt: Khóa bí mật dùng để xác minh chữ ký JWT
      secretOrKey: secret,
    });
  }

  /**
   * 한국어: JWT 페이로드 검증 콜백.
   *   Passport가 토큰 서명/만료를 검증한 후 호출된다.
   *   페이로드를 그대로 반환하면 request.user에 주입된다.
   *
   * Tiếng Việt: Callback xác minh JWT payload.
   *   Được gọi sau khi Passport xác minh chữ ký/hết hạn của token.
   *   Trả về payload nguyên vẹn để được inject vào request.user.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
