/**
 * 한국어: 공통 사용자 생성 입력 DTO.
 *   SuperAdmin / DistributorUser / BrandAdminUser / CorporateAdminUser 생성에 공통으로 사용된다.
 *   loginId, password, displayName, roleCode가 필수이며,
 *   email, phone, userType, tenant scope 는 선택 입력이다.
 *   roleCode는 DB Role 테이블에서 검증된다.
 *
 * Tiếng Việt: DTO đầu vào tạo người dùng dùng chung.
 *   Dùng chung cho SuperAdmin / DistributorUser / BrandAdminUser / CorporateAdminUser.
 *   loginId, password, displayName, roleCode là bắt buộc,
 *   email, phone, userType và tenant scope là tùy chọn.
 *   roleCode được xác thực từ bảng Role trong DB.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AUTH_USER_TYPES, DEFAULT_AUTH_USER_TYPE } from '@core/auth/constants/user-types.constant';

@InputType()
export class CreateAuthAccountInput {
  /** 한국어: 로그인 ID (필수, 빈 문자열 불허) / Tiếng Việt: ID đăng nhập (bắt buộc, không cho phép chuỗi rỗng) */
  @Field()
  @IsString()
  @IsNotEmpty()
  loginId!: string;

  /** 한국어: 비밀번호 (필수, 최소 8자) / Tiếng Việt: Mật khẩu (bắt buộc, tối thiểu 8 ký tự) */
  @Field()
  @IsString()
  @MinLength(8)
  password!: string;

  /** 한국어: 화면 표시 이름 (필수) / Tiếng Việt: Tên hiển thị (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  /** 한국어: 이메일 주소 (선택, 형식 검증) / Tiếng Việt: Địa chỉ email (tùy chọn, kiểm tra định dạng) */
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  /** 한국어: 전화번호 (선택) / Tiếng Việt: Số điện thoại (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  /** 한국어: 대상 사용자 유형 (기본값 SuperAdmin) / Tiếng Việt: Loại người dùng đích */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(AUTH_USER_TYPES)
  userType?: string = DEFAULT_AUTH_USER_TYPE;

  /** 한국어: 대리점 사용자일 때의 소속 대리점 ID / Tiếng Việt: ID đại lý sở hữu */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  distributorId?: string;

  /** 한국어: 브랜드 관리자일 때의 소속 브랜드 본사 ID / Tiếng Việt: ID trụ sở thương hiệu sở hữu */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandHqId?: string;

  /** 한국어: 기업 관리자일 때의 소속 기업 ID / Tiếng Việt: ID doanh nghiệp sở hữu */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  corporateId?: string;

  /**
   * 부여할 Role 의 코드. DB Role 테이블에서 검증된다.
   * 신규 사용자 생성 시 atomic 하게 UserRoleAssignment 를 함께 생성한다.
   */
  @Field()
  @IsString()
  @IsNotEmpty()
  roleCode!: string;
}
