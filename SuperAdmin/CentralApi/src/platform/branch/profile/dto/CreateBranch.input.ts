/**
 * 한국어: 지점(Branch) 생성 입력 DTO.
 *   새 지점을 등록할 때 사용되는 GraphQL InputType이다.
 *   소속 브랜드 본사 ID, 대리점 ID, 지점 코드, 지점명, 국가, 시간대, 언어가 필수이며,
 *   지점 유형, 지역, 주소, 우편번호는 선택 입력이다.
 *
 * Tiếng Việt: DTO đầu vào tạo Chi nhánh (Branch).
 *   Là GraphQL InputType được sử dụng khi đăng ký chi nhánh mới.
 *   ID trụ sở thương hiệu, ID đại lý, mã chi nhánh, tên chi nhánh, quốc gia,
 *   múi giờ, và ngôn ngữ là bắt buộc. Loại chi nhánh, vùng, địa chỉ, mã bưu chính là tùy chọn.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBranchInput {
  /** 한국어: 소속 브랜드 본사 ID (필수) / Tiếng Việt: ID trụ sở thương hiệu sở thuộc (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  brandHQId!: string;

  /** 한국어: 소속 대리점 ID (필수) / Tiếng Việt: ID đại lý sở thuộc (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  distributorId!: string;

  /** 한국어: 지점 코드 (필수, 고유값) / Tiếng Việt: Mã chi nhánh (bắt buộc, giá trị duy nhất) */
  @Field()
  @IsString()
  @IsNotEmpty()
  branchCode!: string;

  /** 한국어: 지점 이름 (필수) / Tiếng Việt: Tên chi nhánh (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  branchName!: string;

  /** 한국어: 지점 유형 (선택, 예: 'Dine-In', 'Takeout') / Tiếng Việt: Loại chi nhánh (tùy chọn, vd: 'Dine-In', 'Takeout') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchType?: string;

  /** 한국어: 국가 코드 (필수, ISO 3166-1) / Tiếng Việt: Mã quốc gia (bắt buộc, ISO 3166-1) */
  @Field()
  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  /** 한국어: 지역 코드 (선택) / Tiếng Việt: Mã vùng (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  regionCode?: string;

  /** 한국어: 주소 1 (선택) / Tiếng Việt: Địa chỉ dòng 1 (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  /** 한국어: 주소 2 (선택) / Tiếng Việt: Địa chỉ dòng 2 (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  /** 한국어: 우편번호 (선택) / Tiếng Việt: Mã bưu chính (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  postalCode?: string;

  /** 한국어: 시간대 코드 (필수, 예: 'Asia/Seoul') / Tiếng Việt: Mã múi giờ (bắt buộc, vd: 'Asia/Seoul') */
  @Field()
  @IsString()
  @IsNotEmpty()
  timeZoneCode!: string;

  /** 한국어: 기본 언어 코드 (필수, 예: 'ko', 'vi') / Tiếng Việt: Mã ngôn ngữ mặc định (bắt buộc, vd: 'ko', 'vi') */
  @Field()
  @IsString()
  @IsNotEmpty()
  defaultLanguageCode!: string;
}
