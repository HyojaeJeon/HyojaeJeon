/**
 * 한국어: Edge POS 터미널 등록 입력 DTO.
 *   새 Edge POS 단말기를 중앙 서버에 등록할 때 사용되는 GraphQL InputType이다.
 *   소속 지점 ID, 터미널 코드, 터미널 이름, 앱 버전, DB 버전이 필수이며,
 *   터미널 역할(terminalRole)은 선택이다 (미지정 시 서비스에서 'Main' 기본값 적용).
 *
 * Tiếng Việt: DTO đầu vào đăng ký Terminal Edge POS.
 *   Là GraphQL InputType được sử dụng khi đăng ký thiết bị Edge POS mới vào server trung tâm.
 *   ID chi nhánh, mã terminal, tên terminal, phiên bản app, và phiên bản DB là bắt buộc.
 *   Vai trò terminal (terminalRole) là tùy chọn (service áp dụng mặc định 'Main' nếu không chỉ định).
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class RegisterEdgePosInput {
  /** 한국어: 소속 지점 ID (필수) / Tiếng Việt: ID chi nhánh sở thuộc (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  /** 한국어: 터미널 코드 (필수, 매장 내 고유) / Tiếng Việt: Mã terminal (bắt buộc, duy nhất trong cửa hàng) */
  @Field()
  @IsString()
  @IsNotEmpty()
  terminalCode!: string;

  /** 한국어: 터미널 이름 (필수) / Tiếng Việt: Tên terminal (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  terminalName!: string;

  /** 한국어: 터미널 역할 (선택, 'Main' 또는 'Sub') / Tiếng Việt: Vai trò terminal (tùy chọn, 'Main' hoặc 'Sub') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  terminalRole?: string;

  /** 한국어: 설치된 앱 버전 (필수) / Tiếng Việt: Phiên bản app đã cài đặt (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  appVersion!: string;

  /** 한국어: 로컬 DB 스키마 버전 (필수) / Tiếng Việt: Phiên bản schema DB cục bộ (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  dbVersion!: string;
}
