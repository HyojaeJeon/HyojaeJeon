/**
 * 한국어: 가격 정책(PricePolicy) GraphQL 모델.
 *   브랜드 본사(BrandHQ)에서 관리하는 가격 정책을 표현하는 ObjectType이다.
 *   ruleJson 필드에 JSON 형태로 가격 규칙(할인율, 시간대별 가격 등)을 저장한다.
 *   effectiveFrom/effectiveTo로 정책 유효 기간을 관리하며,
 *   status로 정책 상태(Active, Draft, Expired 등)를 제어한다.
 *
 * Tiếng Việt: Model GraphQL Chính sách Giá (PricePolicy).
 *   ObjectType biểu diễn chính sách giá được quản lý bởi trụ sở thương hiệu (BrandHQ).
 *   Lưu quy tắc giá (tỷ lệ giảm giá, giá theo khung giờ, v.v.) dưới dạng JSON trong trường ruleJson.
 *   Quản lý thời gian hiệu lực chính sách bằng effectiveFrom/effectiveTo,
 *   kiểm soát trạng thái chính sách (Active, Draft, Expired, v.v.) bằng status.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class PricePolicyModel {
  /** 한국어: 가격 정책 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất chính sách giá (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 브랜드 본사 ID / Tiếng Việt: ID trụ sở thương hiệu sở thuộc */
  @Field()
  brandHQId!: string;

  /** 한국어: 정책 코드 (고유 식별 코드) / Tiếng Việt: Mã chính sách (mã định danh duy nhất) */
  @Field()
  policyCode!: string;

  /** 한국어: 정책 이름 / Tiếng Việt: Tên chính sách */
  @Field()
  policyName!: string;

  /** 한국어: 정책 유형 (예: 'Discount', 'TimeBasedPrice', 'VolumeDiscount') / Tiếng Việt: Loại chính sách (vd: 'Discount', 'TimeBasedPrice', 'VolumeDiscount') */
  @Field()
  policyType!: string;

  /**
   * 한국어: 가격 규칙 JSON. 정책 유형에 따라 구조가 달라진다.
   * Tiếng Việt: JSON quy tắc giá. Cấu trúc thay đổi theo loại chính sách.
   */
  @Field(() => GraphQLJSON)
  ruleJson!: unknown;

  /** 한국어: 정책 시작일 / Tiếng Việt: Ngày bắt đầu chính sách */
  @Field()
  effectiveFrom!: Date;

  /** 한국어: 정책 종료일 (선택, null이면 무기한) / Tiếng Việt: Ngày kết thúc chính sách (tùy chọn, null = vô thời hạn) */
  @Field(() => Date, { nullable: true })
  effectiveTo?: Date | null;

  /** 한국어: 정책 상태 (예: 'Active', 'Draft', 'Expired') / Tiếng Việt: Trạng thái chính sách (vd: 'Active', 'Draft', 'Expired') */
  @Field()
  status!: string;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;
}
