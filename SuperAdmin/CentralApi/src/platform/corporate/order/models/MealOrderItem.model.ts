/**
 * [KO] MealOrderItem GraphQL 모델
 *
 * 주문(MealOrder) 내 개별 메뉴 항목을 표현하는 GraphQL ObjectType이다.
 * 하나의 주문은 하나 이상의 MealOrderItem을 가지며,
 * 각 항목은 메뉴 이름, 수량, 단가, 선택 옵션(JSON)으로 구성된다.
 *
 * [VI] Model GraphQL MealOrderItem
 *
 * ObjectType biểu diễn một mục menu trong đơn hàng (MealOrder).
 * Một đơn hàng có một hoặc nhiều MealOrderItem,
 * mỗi mục gồm tên menu, số lượng, đơn giá, và tùy chọn (JSON).
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class MealOrderItemModel {
  /** [KO] 주문 항목 고유 식별자 (UUID) / [VI] Mã định danh duy nhất của mục đơn hàng (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 소속 주문 ID / [VI] ID đơn hàng sở hữu */
  @Field() orderId!: string;

  /** [KO] 메뉴 항목 이름 (주문 시점 스냅샷) / [VI] Tên mục menu (snapshot tại thời điểm đặt) */
  @Field() menuItemName!: string;

  /** [KO] 수량 / [VI] Số lượng */
  @Field(() => Int) quantity!: number;

  /** [KO] 단가 (VND, bigint) / [VI] Đơn giá (VND, bigint) */
  @Field(() => GraphQLBigInt) unitPriceVnd!: bigint;

  /**
   * [KO] 선택 옵션 JSON — 사이즈, 토핑, 특별 요청 등.
   *      주문 시점의 옵션을 비정규화하여 저장한다 (메뉴 변경에 무관하게 원래 옵션 보존).
   * [VI] JSON tùy chọn — size, topping, yêu cầu đặc biệt, v.v.
   *      Lưu phi chuẩn hóa tùy chọn tại thời điểm đặt (bảo toàn bất kể menu thay đổi).
   */
  @Field(() => GraphQLJSON) optionsJson!: unknown;

  /** [KO] 항목 생성 시각 / [VI] Thời điểm tạo mục */
  @Field() createdAt!: Date;
}
