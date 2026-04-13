/**
 * 한국어: Currency GraphQL 모델 — 통화 엔티티의 GraphQL ObjectType 정의.
 *         플랫폼에서 사용하는 통화 마스터 데이터로, currencyCode(ISO 4217),
 *         심볼, 소수점 자릿수, 반올림 모드 등을 정의한다.
 *         isDefault로 기본 통화를, isActive로 활성/비활성 상태를 관리한다.
 * Tiếng Việt: Model GraphQL Currency — định nghĩa ObjectType GraphQL cho entity tiền tệ.
 *             Dữ liệu master tiền tệ dùng trong nền tảng, định nghĩa currencyCode (ISO 4217),
 *             ký hiệu, số chữ số thập phân, chế độ làm tròn.
 *             Quản lý tiền tệ mặc định qua isDefault và trạng thái hoạt động/không hoạt động qua isActive.
 */
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class CurrencyModel {
  /** 한국어: 통화 고유 ID (UUID) / Tiếng Việt: ID duy nhất của tiền tệ (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 통화 코드 (ISO 4217, 예: 'KRW', 'VND', 'USD') / Tiếng Việt: Mã tiền tệ (ISO 4217, ví dụ: 'KRW', 'VND', 'USD') */
  @Field()
  currencyCode!: string;

  /** 한국어: 통화 이름 (예: '대한민국 원', 'Đồng Việt Nam') / Tiếng Việt: Tên tiền tệ (ví dụ: '대한민국 원', 'Đồng Việt Nam') */
  @Field()
  currencyName!: string;

  /** 한국어: 통화 심볼 (예: '₩', '₫', '$') / Tiếng Việt: Ký hiệu tiền tệ (ví dụ: '₩', '₫', '$') */
  @Field()
  symbol!: string;

  /** 한국어: 소수점 자릿수 (예: KRW=0, VND=0, USD=2) / Tiếng Việt: Số chữ số thập phân (ví dụ: KRW=0, VND=0, USD=2) */
  @Field(() => Int)
  decimalDigits!: number;

  /** 한국어: 반올림 모드 (예: 'HALF_UP', 'FLOOR', 'CEILING') / Tiếng Việt: Chế độ làm tròn (ví dụ: 'HALF_UP', 'FLOOR', 'CEILING') */
  @Field()
  roundingMode!: string;

  /** 한국어: 기본 통화 여부 / Tiếng Việt: Có phải tiền tệ mặc định không */
  @Field()
  isDefault!: boolean;

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
