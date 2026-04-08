/**
 * 한국어: 메뉴 카테고리 생성/수정 입력 DTO.
 *   CreateMenuCategoryInput: 새 메뉴 카테고리를 생성할 때 사용되는 GraphQL InputType이다.
 *   UpdateMenuCategoryInput: 기존 메뉴 카테고리를 부분 수정할 때 사용되는 GraphQL InputType이다.
 *
 * Tiếng Việt: DTO đầu vào tạo/cập nhật Danh mục Menu.
 *   CreateMenuCategoryInput: GraphQL InputType được sử dụng khi tạo danh mục menu mới.
 *   UpdateMenuCategoryInput: GraphQL InputType được sử dụng khi cập nhật một phần danh mục menu hiện tại.
 */
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * 한국어: 메뉴 카테고리 생성 입력. brandHQId, categoryCode, categoryName이 필수이다.
 * Tiếng Việt: Đầu vào tạo danh mục menu. brandHQId, categoryCode, categoryName là bắt buộc.
 */
@InputType()
export class CreateMenuCategoryInput {
  /** 한국어: 소속 브랜드 본사 ID (필수) / Tiếng Việt: ID trụ sở thương hiệu sở thuộc (bắt buộc) */
  @Field() @IsString() @IsNotEmpty() brandHQId!: string;
  /** 한국어: 카테고리 코드 (필수, 고유값) / Tiếng Việt: Mã danh mục (bắt buộc, giá trị duy nhất) */
  @Field() @IsString() @IsNotEmpty() categoryCode!: string;
  /** 한국어: 카테고리 이름 (필수) / Tiếng Việt: Tên danh mục (bắt buộc) */
  @Field() @IsString() @IsNotEmpty() categoryName!: string;
  /** 한국어: 상위 카테고리 ID (선택, UUID 형식) / Tiếng Việt: ID danh mục cha (tùy chọn, định dạng UUID) */
  @Field({ nullable: true }) @IsOptional() @IsUUID() parentCategoryId?: string;
  /** 한국어: 표시 순서 (선택, 기본값 0) / Tiếng Việt: Thứ tự hiển thị (tùy chọn, mặc định 0) */
  @Field(() => Int, { defaultValue: 0 }) @IsOptional() @IsInt() displayOrder?: number;
}

/**
 * 한국어: 메뉴 카테고리 수정 입력. 모든 필드가 선택이다.
 * Tiếng Việt: Đầu vào cập nhật danh mục menu. Tất cả các trường đều tùy chọn.
 */
@InputType()
export class UpdateMenuCategoryInput {
  /** 한국어: 카테고리 이름 (선택) / Tiếng Việt: Tên danh mục (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsString() categoryName?: string;
  /** 한국어: 상위 카테고리 ID (선택) / Tiếng Việt: ID danh mục cha (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() @IsUUID() parentCategoryId?: string;
  /** 한국어: 표시 순서 (선택) / Tiếng Việt: Thứ tự hiển thị (tùy chọn) */
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() displayOrder?: number;
  /** 한국어: 활성 상태 (선택) / Tiếng Việt: Trạng thái kích hoạt (tùy chọn) */
  @Field({ nullable: true }) @IsOptional() isActive?: boolean;
}
