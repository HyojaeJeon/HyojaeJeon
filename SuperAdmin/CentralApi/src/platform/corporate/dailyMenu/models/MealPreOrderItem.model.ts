/**
 * [KO] MealPreOrderItem GraphQL 모델 (사전 주문 항목)
 *      사전 주문(MealPreOrder)에 속하는 개별 메뉴 항목과 수량을 표현한다.
 *
 * [VI] Model GraphQL MealPreOrderItem (muc dat hang truoc)
 *      Bieu dien mot muc thuc don rieng le va so luong trong don dat truoc (MealPreOrder).
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealPreOrderItemModel {
  /** [KO] 주문 항목 고유 ID (UUID) / [VI] ID duy nhat cua muc don hang (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 소속 사전 주문 ID / [VI] ID don dat truoc chua muc nay */
  @Field() preOrderId!: string;

  /** [KO] 주문한 일일 메뉴 항목 ID / [VI] ID muc thuc don hang ngay da dat */
  @Field() dailyMenuItemId!: string;

  /** [KO] 주문 수량 / [VI] So luong dat hang */
  @Field(() => Int) quantity!: number;

  /** [KO] 레코드 생성 시각 / [VI] Thoi gian tao ban ghi */
  @Field() createdAt!: Date;
}
