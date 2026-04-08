/**
 * 한국어: 대리점(Distributor) 수정 입력 DTO.
 *   기존 대리점 정보를 부분 수정할 때 사용되는 GraphQL InputType이다.
 *   모든 필드가 선택(optional)이므로, 변경하고 싶은 필드만 전달하면 된다.
 *
 * Tiếng Việt: DTO đầu vào cập nhật Đại lý (Distributor).
 *   Là GraphQL InputType được sử dụng khi cập nhật một phần thông tin đại lý hiện tại.
 *   Tất cả các trường đều tùy chọn (optional), chỉ cần truyền các trường muốn thay đổi.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateDistributorInput {
  /** 한국어: 회사명 (선택) / Tiếng Việt: Tên công ty (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

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

  /** 한국어: 국가 코드 (선택) / Tiếng Việt: Mã quốc gia (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

  /** 한국어: 관할 지역/영역 이름 (선택) / Tiếng Việt: Tên vùng lãnh thổ quản lý (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  territoryName?: string;

  /** 한국어: 기본 언어 코드 (선택) / Tiếng Việt: Mã ngôn ngữ mặc định (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultLanguageCode?: string;

  /** 한국어: 대리점 상태 (선택, 예: 'Active', 'Suspended') / Tiếng Việt: Trạng thái đại lý (tùy chọn, vd: 'Active', 'Suspended') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

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
