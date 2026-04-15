/**
 * [KO] 일일 메뉴 생성 입력(Input) DTO
 *
 * 가맹점(Branch) 관리자가 특정 날짜 + 식사 유형에 대한 메뉴를 등록할 때 사용한다.
 * items 배열로 메뉴 항목(이름, 가격, 이미지, 칼로리, 정렬순서)을 함께 생성한다.
 *
 * [VI] DTO Input tao thuc don hang ngay
 *
 * Dung khi quan ly cua hang (Branch) dang ky thuc don cho ngay + loai bua an cu the.
 * Mang items tao cac muc thuc don (ten, gia, hinh, calo, thu tu) cung luc.
 */
import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsString, IsUUID, IsOptional, IsInt, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * [KO] 일일 메뉴 항목 생성 입력
 * [VI] Input tao muc thuc don hang ngay
 */
@InputType()
export class CreateMealDailyMenuItemInput {
  /** [KO] 음식 이름 (필수) / [VI] Ten mon an (bat buoc) */
  @Field() @IsString() name!: string;

  /** [KO] 가격 VND (필수) / [VI] Gia VND (bat buoc) */
  @Field(() => GraphQLBigInt) priceVnd!: bigint;

  /** [KO] 음식 이미지 URL (선택) / [VI] URL hinh anh (tuy chon) */
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() imageUrl?: string;

  /** [KO] 칼로리 (선택) / [VI] Calo (tuy chon) */
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() @Min(0) calories?: number;

  /** [KO] 정렬 순서 (기본값: 0) / [VI] Thu tu sap xep (mac dinh: 0) */
  @Field(() => Int, { defaultValue: 0 }) @IsInt() @Min(0) sortOrder: number = 0;
}

@InputType()
export class CreateMealDailyMenuInput {
  /**
   * [KO] 메뉴를 제공하는 지점 ID (필수)
   * [VI] ID chi nhanh cung cap thuc don (bat buoc)
   */
  @Field(() => ID) @IsUUID() branchId!: string;

  /**
   * [KO] 메뉴 제공 날짜 (필수)
   * [VI] Ngay cung cap thuc don (bat buoc)
   */
  @Field() date!: Date;

  /**
   * [KO] 식사 유형 (BREAKFAST | LUNCH | DINNER, 필수)
   * [VI] Loai bua an (BREAKFAST | LUNCH | DINNER, bat buoc)
   */
  @Field() @IsString() mealType!: string;

  /**
   * [KO] 메뉴 항목 목록 (최소 1개 필수)
   * [VI] Danh sach cac muc thuc don (toi thieu 1 muc)
   */
  @Field(() => [CreateMealDailyMenuItemInput])
  @ValidateNested({ each: true })
  @Type(() => CreateMealDailyMenuItemInput)
  @ArrayMinSize(1)
  items!: CreateMealDailyMenuItemInput[];
}
