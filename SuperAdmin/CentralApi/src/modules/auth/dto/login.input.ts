/**
 * 한국어: 로그인 요청 입력 DTO.
 *   GraphQL 로그인 Mutation에서 사용되는 입력 타입이다.
 *   loginId(로그인 ID)와 password(비밀번호)를 필수 필드로 받는다.
 *   class-validator를 통해 서버 측 유효성 검사를 수행한다.
 *
 * Tiếng Việt: DTO đầu vào yêu cầu đăng nhập.
 *   Là kiểu đầu vào được sử dụng trong GraphQL Mutation đăng nhập.
 *   Nhận loginId (ID đăng nhập) và password (mật khẩu) là các trường bắt buộc.
 *   Thực hiện xác thực phía server thông qua class-validator.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  /** 한국어: 로그인 ID (빈 문자열 불허) / Tiếng Việt: ID đăng nhập (không cho phép chuỗi rỗng) */
  @Field()
  @IsString()
  @IsNotEmpty()
  loginId!: string;

  /**
   * 한국어: 비밀번호. 최소 6자 이상이어야 한다.
   * Tiếng Việt: Mật khẩu. Phải có ít nhất 6 ký tự.
   */
  @Field()
  @IsString()
  @MinLength(6)
  password!: string;
}
