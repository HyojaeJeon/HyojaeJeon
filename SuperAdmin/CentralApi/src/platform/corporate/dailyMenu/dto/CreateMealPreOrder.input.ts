/**
 * [KO] 사전 주문 생성 입력(Input) DTO
 *
 * 직원이 일일 메뉴를 기반으로 사전 주문을 등록할 때 사용한다.
 * items 배열로 주문 항목(메뉴 항목 ID, 수량)을 지정한다.
 * 결제는 지갑의 2-Bucket split payment 모델을 따른다.
 *
 * [VI] DTO Input tao don dat truoc
 *
 * Dung khi nhan vien dat truoc dua tren thuc don hang ngay.
 * Mang items chi dinh cac muc dat (ID muc thuc don, so luong).
 * Thanh toan theo mo hinh split payment 2-Bucket cua vi.
 */
import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsString, IsUUID, ValidateNested, ArrayMinSize, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * [KO] 사전 주문 항목 입력
 * [VI] Input muc dat truoc
 */
@InputType()
export class CreateMealPreOrderItemInput {
  /** [KO] 일일 메뉴 항목 ID (필수) / [VI] ID muc thuc don hang ngay (bat buoc) */
  @Field(() => ID) @IsUUID() dailyMenuItemId!: string;

  /** [KO] 주문 수량 (기본값: 1, 최소: 1) / [VI] So luong (mac dinh: 1, toi thieu: 1) */
  @Field(() => Int, { defaultValue: 1 }) @IsInt() @Min(1) quantity: number = 1;
}

@InputType()
export class CreateMealPreOrderInput {
  /** [KO] 결제에 사용할 지갑 ID (필수) / [VI] ID vi de thanh toan (bat buoc) */
  @Field(() => ID) @IsUUID() walletId!: string;

  /** [KO] 주문 대상 일일 메뉴 ID (필수) / [VI] ID thuc don hang ngay can dat (bat buoc) */
  @Field(() => ID) @IsUUID() dailyMenuId!: string;

  /**
   * [KO] 픽업 시간대 (HH:mm 형식, 예: "12:00")
   * [VI] Khung gio lay hang (dinh dang HH:mm, vi du: "12:00")
   */
  @Field() @IsString() pickupSlot!: string;

  /**
   * [KO] 멱등성 키 — 동일한 주문 요청의 중복 방지
   * [VI] Khoa idempotency — ngan chan dat hang trung lap
   */
  @Field() @IsString() idempotencyKey!: string;

  /**
   * [KO] 주문 항목 목록 (최소 1개 필수)
   * [VI] Danh sach cac muc dat hang (toi thieu 1 muc)
   */
  @Field(() => [CreateMealPreOrderItemInput])
  @ValidateNested({ each: true })
  @Type(() => CreateMealPreOrderItemInput)
  @ArrayMinSize(1)
  items!: CreateMealPreOrderItemInput[];
}
