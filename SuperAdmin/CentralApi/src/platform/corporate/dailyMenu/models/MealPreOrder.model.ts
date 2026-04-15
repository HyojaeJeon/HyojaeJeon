/**
 * [KO] MealPreOrder GraphQL 모델 (사전 주문)
 *      직원이 일일 메뉴를 기반으로 미리 주문한 내역을 표현한다.
 *      결제는 2-Bucket split payment 모델을 따른다.
 *
 *      status 흐름: PENDING -> CONFIRMED -> COMPLETED
 *                   PENDING -> CANCELLED (환불)
 *
 * [VI] Model GraphQL MealPreOrder (dat hang truoc)
 *      Bieu dien don hang nhan vien dat truoc dua tren thuc don hang ngay.
 *      Thanh toan theo mo hinh split payment 2-Bucket.
 *
 *      Luong status: PENDING -> CONFIRMED -> COMPLETED
 *                    PENDING -> CANCELLED (hoan tien)
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { MealPreOrderItemModel } from './MealPreOrderItem.model';

@ObjectType()
export class MealPreOrderModel {
  /** [KO] 사전 주문 고유 ID (UUID) / [VI] ID duy nhat cua don dat truoc (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 결제에 사용된 직원 지갑 ID / [VI] ID vi nhan vien dung de thanh toan */
  @Field() walletId!: string;

  /** [KO] 소속 기업 ID / [VI] ID doanh nghiep so huu */
  @Field() corporateId!: string;

  /** [KO] 주문 대상 지점 ID / [VI] ID chi nhanh dat hang */
  @Field() branchId!: string;

  /** [KO] 주문 대상 일일 메뉴 ID / [VI] ID thuc don hang ngay */
  @Field() dailyMenuId!: string;

  /**
   * [KO] 식사 유형 (BREAKFAST | LUNCH | DINNER)
   * [VI] Loai bua an (BREAKFAST | LUNCH | DINNER)
   */
  @Field() mealType!: string;

  /**
   * [KO] 픽업 시간대 (HH:mm 형식, 예: "12:00")
   * [VI] Khung gio lay hang (dinh dang HH:mm, vi du: "12:00")
   */
  @Field() pickupSlot!: string;

  /**
   * [KO] 주문 상태 (PENDING | CONFIRMED | COMPLETED | CANCELLED)
   * [VI] Trang thai don hang (PENDING | CONFIRMED | COMPLETED | CANCELLED)
   */
  @Field() status!: string;

  /** [KO] 총 주문 금액 (VND) / [VI] Tong so tien don hang (VND) */
  @Field(() => GraphQLBigInt) totalAmountVnd!: bigint;

  /**
   * [KO] 회사 부담 금액 (VND) — 회사 지원금에서 차감된 몫
   * [VI] Phan cong ty chi tra (VND) — so tien tru tu tro cap cong ty
   */
  @Field(() => GraphQLBigInt) companyShareVnd!: bigint;

  /**
   * [KO] 직원 부담 금액 (VND) — 개인 충전금에서 차감된 몫
   * [VI] Phan nhan vien chi tra (VND) — so tien tru tu nap ca nhan
   */
  @Field(() => GraphQLBigInt) employeeShareVnd!: bigint;

  /** [KO] 멱등성 키 / [VI] Khoa idempotency */
  @Field() idempotencyKey!: string;

  /** [KO] 주문 항목 목록 / [VI] Danh sach cac muc don hang */
  @Field(() => [MealPreOrderItemModel], { nullable: true })
  items?: MealPreOrderItemModel[];

  /** [KO] 레코드 생성 시각 / [VI] Thoi gian tao ban ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 시각 / [VI] Thoi gian cap nhat ban ghi lan cuoi */
  @Field() updatedAt!: Date;
}
