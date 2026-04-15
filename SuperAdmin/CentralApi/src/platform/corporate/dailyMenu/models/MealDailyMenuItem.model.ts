/**
 * [KO] MealDailyMenuItem GraphQL 모델 (일일 메뉴 항목)
 *      일일 메뉴(MealDailyMenu)에 속하는 개별 음식 항목을 표현한다.
 *      가격은 VND 단위의 BigInt 이다.
 *
 * [VI] Model GraphQL MealDailyMenuItem (muc thuc don hang ngay)
 *      Bieu dien mot mon an rieng le thuoc thuc don hang ngay (MealDailyMenu).
 *      Gia tien la BigInt don vi VND.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealDailyMenuItemModel {
  /** [KO] 메뉴 항목 고유 ID (UUID) / [VI] ID duy nhat cua muc thuc don (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 소속 일일 메뉴 ID / [VI] ID thuc don hang ngay chua muc nay */
  @Field() dailyMenuId!: string;

  /** [KO] 음식 이름 / [VI] Ten mon an */
  @Field() name!: string;

  /** [KO] 가격 (VND) / [VI] Gia tien (VND) */
  @Field(() => GraphQLBigInt) priceVnd!: bigint;

  /** [KO] 음식 이미지 URL (선택) / [VI] URL hinh anh mon an (tuy chon) */
  @Field(() => String, { nullable: true }) imageUrl?: string | null;

  /** [KO] 칼로리 (선택) / [VI] Calo (tuy chon) */
  @Field(() => Int, { nullable: true }) calories?: number | null;

  /** [KO] 정렬 순서 / [VI] Thu tu sap xep */
  @Field(() => Int) sortOrder!: number;

  /** [KO] 레코드 생성 시각 / [VI] Thoi gian tao ban ghi */
  @Field() createdAt!: Date;
}
