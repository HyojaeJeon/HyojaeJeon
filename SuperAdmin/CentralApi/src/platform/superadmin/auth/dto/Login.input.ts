/**
 * 한국어: 로그인 요청 입력 DTO.
 *   GraphQL 로그인 Mutation에서 사용되는 입력 타입이다.
 *   loginId(로그인 ID)와 password(비밀번호)를 기본 필드로 받는다.
 *   userType 및 tenant scope 는 선택값이며, 생략 시 SuperAdmin 로그인으로 처리한다.
 *   class-validator를 통해 서버 측 유효성 검사를 수행한다.
 *
 * Tiếng Việt: DTO đầu vào yêu cầu đăng nhập.
 *   Là kiểu đầu vào được sử dụng trong GraphQL Mutation đăng nhập.
 *   Nhận loginId (ID đăng nhập) và password (mật khẩu) là các trường bắt buộc.
 *   Thực hiện xác thực phía server thông qua class-validator.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AUTH_USER_TYPES, DEFAULT_AUTH_USER_TYPE } from '@core/auth/constants/UserTypes.constant';

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

  /**
   * 한국어: 로그인 대상 사용자 유형.
   *   기본값은 SuperAdmin 이며, Distributor / Brand / Corporate 포털 로그인 시에는 반드시 지정한다.
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(AUTH_USER_TYPES)
  userType?: string = DEFAULT_AUTH_USER_TYPE;

  /** 한국어: 대리점 로그인 스코프 / Tiếng Việt: Phạm vi đăng nhập đại lý */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  distributorId?: string;

  /** 한국어: 브랜드 본사 로그인 스코프 / Tiếng Việt: Phạm vi đăng nhập thương hiệu */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandHqId?: string;

  /** 한국어: 기업 로그인 스코프 / Tiếng Việt: Phạm vi đăng nhập doanh nghiệp */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  corporateId?: string;
}
