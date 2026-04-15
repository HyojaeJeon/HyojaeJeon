/**
 * [KO] MealDailyMenu 필터 Args — 일일 메뉴 목록 조회 시 사용하는 필터 DTO.
 *      branchId(필수) + date(선택) + mealType(선택)으로 필터링한다.
 *
 * [VI] Args bo loc MealDailyMenu — DTO bo loc khi truy van danh sach thuc don hang ngay.
 *      Loc theo branchId (bat buoc) + date (tuy chon) + mealType (tuy chon).
 */
import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class MealDailyMenuFilterArgs {
  /** [KO] 지점 ID (필수) / [VI] ID chi nhanh (bat buoc) */
  @Field(() => ID)
  @IsUUID()
  branchId!: string;

  /**
   * [KO] 메뉴 날짜 필터 (선택) — 지정하지 않으면 전체 날짜
   * [VI] Bo loc ngay thuc don (tuy chon) — khong chi dinh thi tra ve tat ca ngay
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  /**
   * [KO] 식사 유형 필터 (선택) — BREAKFAST | LUNCH | DINNER
   * [VI] Bo loc loai bua an (tuy chon) — BREAKFAST | LUNCH | DINNER
   */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mealType?: string;
}
