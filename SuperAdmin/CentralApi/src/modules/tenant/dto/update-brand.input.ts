/**
 * 한국어: 브랜드(Brand) 수정 입력 DTO.
 *   기존 브랜드 정보를 부분 수정할 때 사용되는 GraphQL InputType이다.
 *   모든 필드가 선택(optional)이므로, 변경하고 싶은 필드만 전달하면 된다.
 *
 * Tiếng Việt: DTO đầu vào cập nhật Thương hiệu (Brand).
 *   Là GraphQL InputType được sử dụng khi cập nhật một phần thông tin thương hiệu hiện tại.
 *   Tất cả các trường đều tùy chọn (optional), chỉ cần truyền các trường muốn thay đổi.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateBrandInput {
  /** 한국어: 브랜드 이름 (선택) / Tiếng Việt: Tên thương hiệu (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandName?: string;

  /** 한국어: 국가 코드 (선택) / Tiếng Việt: Mã quốc gia (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

  /** 한국어: 기본 언어 코드 (선택) / Tiếng Việt: Mã ngôn ngữ mặc định (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultLanguageCode?: string;

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

  /** 한국어: 브랜드 상태 (선택, 예: 'Active', 'Suspended') / Tiếng Việt: Trạng thái thương hiệu (tùy chọn, vd: 'Active', 'Suspended') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
