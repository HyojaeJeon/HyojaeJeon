/**
 * 한국어: 메뉴 항목 생성/수정 입력 DTO.
 *   CreateMenuItemInput: 새 메뉴 항목을 생성할 때 사용되는 GraphQL InputType이다.
 *   UpdateMenuItemInput: 기존 메뉴 항목을 부분 수정할 때 사용되는 GraphQL InputType이다.
 *
 * Tiếng Việt: DTO đầu vào tạo/cập nhật Mục Menu.
 *   CreateMenuItemInput: GraphQL InputType được sử dụng khi tạo mục menu mới.
 *   UpdateMenuItemInput: GraphQL InputType được sử dụng khi cập nhật một phần mục menu hiện tại.
 */
import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 한국어: 메뉴 항목 생성 입력.
 *   brandHQId, itemCode, itemName, categoryId가 필수이다.
 *   itemType 기본값 'Standard', basePrice 기본값 0, taxRate 기본값 0, unitType 기본값 'EA'.
 *
 * Tiếng Việt: Đầu vào tạo mục menu.
 *   brandHQId, itemCode, itemName, categoryId là bắt buộc.
 *   itemType mặc định 'Standard', basePrice mặc định 0, taxRate mặc định 0, unitType mặc định 'EA'.
 */
// P2-4: 수치/문자 길이 범위를 schema 단에서 강제해 잘못된 값(음수 가격, 1 초과 세율, 초과 길이 등)을
//   애플리케이션/DB 에 도달하지 않도록 한다.
const PRICE_MAX = 99_999_999_999.99; // Decimal(14, 2) 최대
const TAX_RATE_MAX = 1; // 0~1 소수 (10% = 0.1)
const ITEM_CODE_MAX = 80;
const ITEM_NAME_MAX = 200;
const SEARCH_KEYWORDS_MAX = 500;

@InputType()
export class CreateMenuItemInput {
  /** 한국어: 소속 브랜드 본사 ID (필수) / Tiếng Việt: ID trụ sở thương hiệu sở thuộc (bắt buộc) */
  @Field() @IsString() @IsNotEmpty() brandHQId!: string;
  /** 한국어: 상품 코드 (필수) / Tiếng Việt: Mã sản phẩm (bắt buộc) */
  @Field() @IsString() @IsNotEmpty() @MaxLength(ITEM_CODE_MAX) itemCode!: string;
  /** 한국어: 상품 이름 (필수) / Tiếng Việt: Tên sản phẩm (bắt buộc) */
  @Field() @IsString() @IsNotEmpty() @MaxLength(ITEM_NAME_MAX) itemName!: string;
  /** 한국어: 소속 카테고리 ID (필수) / Tiếng Việt: ID danh mục sở thuộc (bắt buộc) */
  @Field() @IsString() @IsNotEmpty() categoryId!: string;
  /** 한국어: 상품 유형 (선택, 기본값 'STANDARD') / Tiếng Việt: Loại sản phẩm (tùy chọn, mặc định 'STANDARD') */
  @Field({ defaultValue: 'STANDARD' }) @IsOptional() @IsString() itemType?: string;
  /** 한국어: 기본 단가 (선택, 기본값 0, 음수 금지) / Tiếng Việt: Đơn giá cơ bản (tùy chọn, mặc định 0) */
  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(PRICE_MAX)
  basePrice?: number;
  /** 한국어: 세율 (선택, 기본값 0, 0~1 범위) / Tiếng Việt: Thuế suất (tùy chọn, mặc định 0, 0~1) */
  @Field(() => Float, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(TAX_RATE_MAX)
  taxRate?: number;
  /** 한국어: 단위 유형 (선택, 기본값 'EA') / Tiếng Việt: Loại đơn vị (tùy chọn, mặc định 'EA') */
  @Field({ defaultValue: 'EA' }) @IsOptional() @IsString() unitType?: string;
  /** 한국어: 표시 순서 (선택, 기본값 0, 음수 금지) / Tiếng Việt: Thứ tự hiển thị (tùy chọn, mặc định 0) */
  @Field(() => Int, { defaultValue: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  /** 한국어: 검색 키워드 (선택) / Tiếng Việt: Từ khóa tìm kiếm (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(SEARCH_KEYWORDS_MAX) searchKeywords?: string;
}

/**
 * 한국어: 메뉴 항목 수정 입력. 모든 필드가 선택이다.
 * Tiếng Việt: Đầu vào cập nhật mục menu. Tất cả các trường đều tùy chọn.
 */
@InputType()
export class UpdateMenuItemInput {
  /** 한국어: 상품 이름 (선택) / Tiếng Việt: Tên sản phẩm (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(ITEM_NAME_MAX) itemName?: string;
  /** 한국어: 소속 카테고리 ID (선택) / Tiếng Việt: ID danh mục sở thuộc (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() categoryId?: string;
  /** 한국어: 상품 유형 (선택) / Tiếng Việt: Loại sản phẩm (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() itemType?: string;
  /** 한국어: 기본 단가 (선택, 음수 금지) / Tiếng Việt: Đơn giá cơ bản (tùy chọn) */
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(PRICE_MAX)
  basePrice?: number;
  /** 한국어: 세율 (선택, 0~1 범위) / Tiếng Việt: Thuế suất (tùy chọn, 0~1) */
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(TAX_RATE_MAX)
  taxRate?: number;
  /** 한국어: 단위 유형 (선택) / Tiếng Việt: Loại đơn vị (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() unitType?: string;
  /** 한국어: 품절 상태 (선택) / Tiếng Việt: Trạng thái hết hàng (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() isSoldOut?: boolean;
  /** 한국어: 표시 순서 (선택, 음수 금지) / Tiếng Việt: Thứ tự hiển thị (tùy chọn) */
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  /** 한국어: 검색 키워드 (선택) / Tiếng Việt: Từ khóa tìm kiếm (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() @MaxLength(SEARCH_KEYWORDS_MAX) searchKeywords?: string;
  /** 한국어: 활성 상태 (선택) / Tiếng Việt: Trạng thái kích hoạt (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() isActive?: boolean;
}
