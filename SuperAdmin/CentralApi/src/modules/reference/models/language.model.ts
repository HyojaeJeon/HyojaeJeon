/**
 * 한국어: Language GraphQL 모델 — 언어 엔티티의 GraphQL ObjectType 정의.
 *         플랫폼에서 지원하는 언어 마스터 데이터로, i18n 기반 다국어 지원의 핵심 참조 테이블이다.
 *         direction으로 텍스트 방향(LTR/RTL)을 지정하며, isDefault로 기본 언어를 관리한다.
 * Tiếng Việt: Model GraphQL Language — định nghĩa ObjectType GraphQL cho entity ngôn ngữ.
 *             Dữ liệu master ngôn ngữ nền tảng hỗ trợ, là bảng tham chiếu cốt lõi cho hỗ trợ đa ngôn ngữ dựa trên i18n.
 *             direction chỉ định hướng văn bản (LTR/RTL), isDefault quản lý ngôn ngữ mặc định.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class LanguageModel {
  /** 한국어: 언어 고유 ID (UUID) / Tiếng Việt: ID duy nhất của ngôn ngữ (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 언어 코드 (BCP-47/ISO 639-1, 예: 'ko', 'vi', 'en') / Tiếng Việt: Mã ngôn ngữ (BCP-47/ISO 639-1, ví dụ: 'ko', 'vi', 'en') */
  @Field()
  languageCode!: string;

  /** 한국어: 해당 언어의 원어 이름 (예: '한국어', 'Tiếng Việt') / Tiếng Việt: Tên ngôn ngữ bản địa (ví dụ: '한국어', 'Tiếng Việt') */
  @Field()
  nativeName!: string;

  /** 한국어: 표시용 이름 (예: 'Korean', 'Vietnamese') / Tiếng Việt: Tên hiển thị (ví dụ: 'Korean', 'Vietnamese') */
  @Field()
  displayName!: string;

  /** 한국어: 텍스트 방향 ('LTR' = 왼쪽→오른쪽, 'RTL' = 오른쪽→왼쪽) / Tiếng Việt: Hướng văn bản ('LTR' = trái→phải, 'RTL' = phải→trái) */
  @Field()
  direction!: string;

  /** 한국어: 기본 언어 여부 / Tiếng Việt: Có phải ngôn ngữ mặc định không */
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
