/**
 * 한국어: Region GraphQL 모델 — 지역 엔티티의 GraphQL ObjectType 정의.
 *         국가/지역별 설정(통화, 시간대 등)을 관리하는 마스터 데이터이다.
 *         countryCode(ISO 3166-1)와 currencyCode(ISO 4217), timeZoneCode(IANA)를 참조한다.
 * Tiếng Việt: Model GraphQL Region — định nghĩa ObjectType GraphQL cho entity khu vực.
 *             Dữ liệu master quản lý cấu hình theo quốc gia/khu vực (tiền tệ, múi giờ...).
 *             Tham chiếu countryCode (ISO 3166-1), currencyCode (ISO 4217), timeZoneCode (IANA).
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class RegionModel {
  /** 한국어: 지역 고유 ID (UUID) / Tiếng Việt: ID duy nhất của khu vực (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 지역 코드 (플랫폼 내부 코드, 예: 'KR-SEO', 'VN-HCM') / Tiếng Việt: Mã khu vực (mã nội bộ nền tảng, ví dụ: 'KR-SEO', 'VN-HCM') */
  @Field()
  regionCode!: string;

  /** 한국어: 국가 코드 (ISO 3166-1, 예: 'KR', 'VN', 'US') / Tiếng Việt: Mã quốc gia (ISO 3166-1, ví dụ: 'KR', 'VN', 'US') */
  @Field()
  countryCode!: string;

  /** 한국어: 지역 이름 (예: '서울', 'Hồ Chí Minh') / Tiếng Việt: Tên khu vực (ví dụ: '서울', 'Hồ Chí Minh') */
  @Field()
  regionName!: string;

  /** 한국어: 해당 지역의 기본 통화 코드 (ISO 4217) / Tiếng Việt: Mã tiền tệ mặc định của khu vực (ISO 4217) */
  @Field()
  currencyCode!: string;

  /** 한국어: 해당 지역의 시간대 코드 (IANA, 예: 'Asia/Seoul', 'Asia/Ho_Chi_Minh') / Tiếng Việt: Mã múi giờ của khu vực (IANA, ví dụ: 'Asia/Seoul', 'Asia/Ho_Chi_Minh') */
  @Field()
  timeZoneCode!: string;

  /** 한국어: 활성 상태 여부 / Tiếng Việt: Trạng thái hoạt động */
  @Field()
  isActive!: boolean;

  /** 한국어: 생성 일시 / Tiếng Việt: Thời gian tạo */
  @Field()
  createdAt!: Date;

  /** 한국어: 수정 일시 / Tiếng Việt: Thời gian cập nhật */
  @Field()
  updatedAt!: Date;
}
