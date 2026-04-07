/**
 * 한국어: 프로모션(Promotion) GraphQL 모델.
 *   브랜드 본사(BrandHQ)에서 관리하는 프로모션/판촉 행사를 표현하는 ObjectType이다.
 *   ruleJson 필드에 JSON 형태로 프로모션 규칙(1+1, N% 할인 등)을 저장한다.
 *   startAt/endAt으로 프로모션 기간을 관리하며,
 *   status로 프로모션 상태(Active, Scheduled, Ended 등)를 제어한다.
 *
 * Tiếng Việt: Model GraphQL Khuyến mãi (Promotion).
 *   ObjectType biểu diễn chương trình khuyến mãi/quảng cáo được quản lý bởi trụ sở thương hiệu (BrandHQ).
 *   Lưu quy tắc khuyến mãi (mua 1 tặng 1, giảm N%, v.v.) dưới dạng JSON trong trường ruleJson.
 *   Quản lý thời gian khuyến mãi bằng startAt/endAt,
 *   kiểm soát trạng thái khuyến mãi (Active, Scheduled, Ended, v.v.) bằng status.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class PromotionModel {
  /** 한국어: 프로모션 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất khuyến mãi (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 브랜드 본사 ID / Tiếng Việt: ID trụ sở thương hiệu sở thuộc */
  @Field()
  brandHQId!: string;

  /** 한국어: 프로모션 코드 (고유 식별 코드) / Tiếng Việt: Mã khuyến mãi (mã định danh duy nhất) */
  @Field()
  promotionCode!: string;

  /** 한국어: 프로모션 이름 / Tiếng Việt: Tên khuyến mãi */
  @Field()
  promotionName!: string;

  /** 한국어: 프로모션 유형 (예: 'BuyOneGetOne', 'PercentOff', 'FreeItem') / Tiếng Việt: Loại khuyến mãi (vd: 'BuyOneGetOne', 'PercentOff', 'FreeItem') */
  @Field()
  promotionType!: string;

  /**
   * 한국어: 프로모션 규칙 JSON. 프로모션 유형에 따라 구조가 달라진다.
   * Tiếng Việt: JSON quy tắc khuyến mãi. Cấu trúc thay đổi theo loại khuyến mãi.
   */
  @Field(() => GraphQLJSON)
  ruleJson!: unknown;

  /** 한국어: 프로모션 시작 시각 / Tiếng Việt: Thời gian bắt đầu khuyến mãi */
  @Field()
  startAt!: Date;

  /** 한국어: 프로모션 종료 시각 (선택, null이면 무기한) / Tiếng Việt: Thời gian kết thúc khuyến mãi (tùy chọn, null = vô thời hạn) */
  @Field(() => Date, { nullable: true })
  endAt?: Date | null;

  /** 한국어: 프로모션 상태 (예: 'Active', 'Scheduled', 'Ended') / Tiếng Việt: Trạng thái khuyến mãi (vd: 'Active', 'Scheduled', 'Ended') */
  @Field()
  status!: string;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;
}
