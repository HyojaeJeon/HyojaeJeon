/**
 * 한국어: 인증 응답 페이로드 GraphQL 모델.
 *   로그인 성공 시 클라이언트에 반환되는 응답 구조를 정의한다.
 *   JWT 액세스 토큰, 토큰 만료 시간, 인증된 사용자 정보를 포함한다.
 *
 * Tiếng Việt: Model GraphQL payload phản hồi xác thực.
 *   Định nghĩa cấu trúc phản hồi trả về cho client khi đăng nhập thành công.
 *   Bao gồm JWT access token, thời gian hết hạn token, và thông tin người dùng đã xác thực.
 */
import { ObjectType, Field } from '@nestjs/graphql';
import { AuthAccountModel } from './auth-account.model';

@ObjectType()
export class AuthPayload {
  /** 한국어: JWT 액세스 토큰 문자열 / Tiếng Việt: Chuỗi JWT access token */
  @Field()
  accessToken!: string;

  /**
   * 한국어: 토큰 만료 시간 (예: '1d', '12h').
   *   환경 변수 JWT_EXPIRES_IN에서 결정된다.
   *
   * Tiếng Việt: Thời gian hết hạn token (vd: '1d', '12h').
   *   Được xác định từ biến môi trường JWT_EXPIRES_IN.
   */
  @Field()
  expiresIn!: string;

  /** 한국어: 인증된 사용자 정보 / Tiếng Việt: Thông tin người dùng đã xác thực */
  @Field(() => AuthAccountModel)
  user!: AuthAccountModel;
}
