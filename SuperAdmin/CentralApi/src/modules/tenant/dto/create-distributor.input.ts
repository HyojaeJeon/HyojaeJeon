/**
 * 한국어: 대리점(Distributor) 생성 입력 DTO.
 *   새 대리점/유통사를 등록할 때 사용되는 GraphQL InputType이다.
 *   대리점 코드, 회사명, 국가, 관할 지역이 필수이며,
 *   법인명, 사업자번호, 기본 언어, 담당자 정보는 선택 입력이다.
 *
 * Tiếng Việt: DTO đầu vào tạo Đại lý (Distributor).
 *   Là GraphQL InputType được sử dụng khi đăng ký đại lý/nhà phân phối mới.
 *   Mã đại lý, tên công ty, quốc gia, và tên lãnh thổ là bắt buộc.
 *   Tên pháp lý, mã số doanh nghiệp, ngôn ngữ mặc định, và thông tin người liên hệ là tùy chọn.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateDistributorInput {
  /** 한국어: 대리점 코드 (필수, 고유값) / Tiếng Việt: Mã đại lý (bắt buộc, giá trị duy nhất) */
  @Field()
  @IsString()
  @IsNotEmpty()
  distributorCode!: string;

  /** 한국어: 회사명 (필수) / Tiếng Việt: Tên công ty (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  /** 한국어: 법인명 (선택) / Tiếng Việt: Tên pháp lý (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  legalName?: string;

  /** 한국어: 사업자 등록 번호 (선택) / Tiếng Việt: Mã số doanh nghiệp (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessNumber?: string;

  /** 한국어: 국가 코드 (필수, ISO 3166-1) / Tiếng Việt: Mã quốc gia (bắt buộc, ISO 3166-1) */
  @Field()
  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  /** 한국어: 관할 지역/영역 이름 (필수) / Tiếng Việt: Tên vùng lãnh thổ quản lý (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  territoryName!: string;

  /** 한국어: 기본 언어 코드 (선택, 미지정 시 서비스에서 'ko' 기본값 적용) / Tiếng Việt: Mã ngôn ngữ mặc định (tùy chọn, service áp dụng mặc định 'ko' nếu không chỉ định) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultLanguageCode?: string;

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
