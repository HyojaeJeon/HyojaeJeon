/**
 * 한국어: SuperAdmin 사용자 생성 입력 DTO.
 *   새 SuperAdmin 사용자를 등록할 때 사용되는 GraphQL InputType이다.
 *   loginId, password, displayName, roleCode가 필수이며,
 *   email과 phone은 선택 입력이다.
 *   비밀번호는 최소 8자, roleCode는 RoleCode enum 값만 허용된다.
 *
 * Tiếng Việt: DTO đầu vào tạo người dùng SuperAdmin.
 *   Là GraphQL InputType được sử dụng khi đăng ký người dùng SuperAdmin mới.
 *   loginId, password, displayName, roleCode là bắt buộc,
 *   email và phone là tùy chọn.
 *   Mật khẩu tối thiểu 8 ký tự, roleCode chỉ chấp nhận giá trị enum RoleCode.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleCode } from '../constants/roles.constant';

@InputType()
export class CreateSuperAdminUserInput {
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

  /**
   * 한국어: 역할 코드 (필수). RoleCode enum 값만 허용된다.
   * Tiếng Việt: Mã vai trò (bắt buộc). Chỉ chấp nhận giá trị enum RoleCode.
   */
  @Field()
  @IsEnum(RoleCode)
  roleCode!: string;
}
