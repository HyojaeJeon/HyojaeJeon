/**
 * 한국어: 브랜드(Brand) 생성 입력 DTO.
 *   새 브랜드를 등록할 때 사용되는 GraphQL InputType이다.
 *   소속 대리점 ID, 브랜드 코드, 브랜드명, 국가, 기본 언어가 필수이며,
 *   사업자번호, 담당자 정보는 선택 입력이다.
 *
 * Tiếng Việt: DTO đầu vào tạo Thương hiệu (Brand).
 *   Là GraphQL InputType được sử dụng khi đăng ký thương hiệu mới.
 *   ID đại lý, mã thương hiệu, tên thương hiệu, quốc gia, và ngôn ngữ mặc định là bắt buộc.
 *   Mã số doanh nghiệp và thông tin người liên hệ là tùy chọn.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBrandInput {
  /** 한국어: 소속 대리점 ID (필수) / Tiếng Việt: ID đại lý sở thuộc (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  distributorId!: string;

  /** 한국어: 브랜드 코드 (필수, 고유값) / Tiếng Việt: Mã thương hiệu (bắt buộc, giá trị duy nhất) */
  @Field()
  @IsString()
  @IsNotEmpty()
  brandCode!: string;

  /** 한국어: 브랜드 이름 (필수) / Tiếng Việt: Tên thương hiệu (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  brandName!: string;

  /** 한국어: 국가 코드 (필수, ISO 3166-1) / Tiếng Việt: Mã quốc gia (bắt buộc, ISO 3166-1) */
  @Field()
  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  /** 한국어: 기본 언어 코드 (필수) / Tiếng Việt: Mã ngôn ngữ mặc định (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  defaultLanguageCode!: string;

  /** 한국어: 사업자 등록 번호 (선택) / Tiếng Việt: Mã số doanh nghiệp (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessNumber?: string;

  /** 한국어: 담당자 이름 (선택) / Tiếng Việt: Tên người liên hệ (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactName?: string;

  /** 한국어: 담당자 이메일 (선택, 형식 검증) / Tiếng Việt: Email người liên hệ (tùy chọn, kiểm tra định dạng) */
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  /** 한국어: 담당자 전화번호 (선택) / Tiếng Việt: Số điện thoại người liên hệ (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
