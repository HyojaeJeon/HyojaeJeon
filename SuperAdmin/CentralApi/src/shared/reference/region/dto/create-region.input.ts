/**
 * 한국어: CreateRegion 입력 DTO — 지역 생성/수정 시 사용하는 GraphQL InputType.
 *         모든 필드가 필수이며, class-validator 데코레이터로 유효성을 검증한다.
 *         countryCode는 ISO 3166-1, currencyCode는 ISO 4217, timeZoneCode는 IANA 표준을 따른다.
 * Tiếng Việt: DTO đầu vào CreateRegion — GraphQL InputType dùng khi tạo/sửa khu vực.
 *             Tất cả trường đều bắt buộc, xác thực tính hợp lệ bằng decorator class-validator.
 *             countryCode theo ISO 3166-1, currencyCode theo ISO 4217, timeZoneCode theo chuẩn IANA.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateRegionInput {
  /** 한국어: 지역 코드 (플랫폼 내부 코드, 필수) / Tiếng Việt: Mã khu vực (mã nội bộ nền tảng, bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  regionCode!: string;

  /** 한국어: 국가 코드 (ISO 3166-1, 필수, 예: 'KR', 'VN') / Tiếng Việt: Mã quốc gia (ISO 3166-1, bắt buộc, ví dụ: 'KR', 'VN') */
  @Field()
  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  /** 한국어: 지역 이름 (필수) / Tiếng Việt: Tên khu vực (bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  regionName!: string;

  /** 한국어: 해당 지역의 기본 통화 코드 (ISO 4217, 필수) / Tiếng Việt: Mã tiền tệ mặc định của khu vực (ISO 4217, bắt buộc) */
  @Field()
  @IsString()
  @IsNotEmpty()
  currencyCode!: string;

  /** 한국어: 시간대 코드 (IANA, 필수, 예: 'Asia/Seoul') / Tiếng Việt: Mã múi giờ (IANA, bắt buộc, ví dụ: 'Asia/Seoul') */
  @Field()
  @IsString()
  @IsNotEmpty()
  timeZoneCode!: string;
}
