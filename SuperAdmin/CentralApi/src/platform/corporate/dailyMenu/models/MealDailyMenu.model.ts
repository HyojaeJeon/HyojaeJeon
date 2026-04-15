/**
 * [KO] MealDailyMenu GraphQL 모델 (일일 메뉴)
 *      가맹점(Branch)이 날짜 + 식사 유형별로 제공하는 메뉴판을 표현한다.
 *      하나의 branchId + date + mealType 조합은 고유하다 (DB unique constraint).
 *
 * [VI] Model GraphQL MealDailyMenu (thuc don hang ngay)
 *      Bieu dien thuc don ma cua hang (Branch) cung cap theo ngay + loai bua an.
 *      Mot to hop branchId + date + mealType la duy nhat (DB unique constraint).
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MealDailyMenuItemModel } from './MealDailyMenuItem.model';

@ObjectType()
export class MealDailyMenuModel {
  /** [KO] 일일 메뉴 고유 ID (UUID) / [VI] ID duy nhat cua thuc don hang ngay (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 메뉴를 제공하는 지점(Branch) ID / [VI] ID chi nhanh (Branch) cung cap thuc don */
  @Field() branchId!: string;

  /** [KO] 메뉴 제공 날짜 / [VI] Ngay cung cap thuc don */
  @Field() date!: Date;

  /**
   * [KO] 식사 유형 (BREAKFAST | LUNCH | DINNER)
   * [VI] Loai bua an (BREAKFAST | LUNCH | DINNER)
   */
  @Field() mealType!: string;

  /**
   * [KO] 메뉴 상태 (ACTIVE | CLOSED)
   * [VI] Trang thai thuc don (ACTIVE | CLOSED)
   */
  @Field() status!: string;

  /** [KO] 메뉴 항목 목록 / [VI] Danh sach cac mon an trong thuc don */
  @Field(() => [MealDailyMenuItemModel], { nullable: true })
  items?: MealDailyMenuItemModel[];

  /** [KO] 레코드 생성 시각 / [VI] Thoi gian tao ban ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 시각 / [VI] Thoi gian cap nhat ban ghi lan cuoi */
  @Field() updatedAt!: Date;
}
