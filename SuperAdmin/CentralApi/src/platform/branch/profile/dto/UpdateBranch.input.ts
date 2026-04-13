/**
 * 한국어: 지점(Branch) 수정 입력 DTO.
 *   기존 지점 정보를 부분 수정할 때 사용되는 GraphQL InputType이다.
 *   모든 필드가 선택(optional)이므로, 변경하고 싶은 필드만 전달하면 된다.
 *   상태, 개점일, 폐점일도 수정 가능하다.
 *
 * Tiếng Việt: DTO đầu vào cập nhật Chi nhánh (Branch).
 *   Là GraphQL InputType được sử dụng khi cập nhật một phần thông tin chi nhánh hiện tại.
 *   Tất cả các trường đều tùy chọn (optional), chỉ cần truyền các trường muốn thay đổi.
 *   Có thể cập nhật trạng thái, ngày khai trương, và ngày đóng cửa.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateBranchInput {
  /** 한국어: 지점 이름 (선택) / Tiếng Việt: Tên chi nhánh (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchName?: string;

  /** 한국어: 지점 유형 (선택) / Tiếng Việt: Loại chi nhánh (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchType?: string;

  /** 한국어: 국가 코드 (선택) / Tiếng Việt: Mã quốc gia (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

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

  /** 한국어: 시간대 코드 (선택) / Tiếng Việt: Mã múi giờ (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeZoneCode?: string;

  /** 한국어: 기본 언어 코드 (선택) / Tiếng Việt: Mã ngôn ngữ mặc định (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultLanguageCode?: string;

  /** 한국어: 지점 상태 (선택, 예: 'Active', 'Suspended', 'Closed') / Tiếng Việt: Trạng thái chi nhánh (tùy chọn, vd: 'Active', 'Suspended', 'Closed') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  /** 한국어: 개점일 (선택) / Tiếng Việt: Ngày khai trương (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  openingDate?: Date;

  /** 한국어: 폐점일 (선택) / Tiếng Việt: Ngày đóng cửa (tùy chọn) */
  @Field({ nullable: true })
  @IsOptional()
  closingDate?: Date;
}
