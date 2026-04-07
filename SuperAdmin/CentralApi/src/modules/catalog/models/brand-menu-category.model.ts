/**
 * 한국어: 브랜드 메뉴 카테고리 GraphQL 모델.
 *   브랜드 본사(BrandHQ)에서 관리하는 메뉴 카테고리를 표현하는 ObjectType이다.
 *   parentCategoryId를 통해 계층형(트리) 카테고리 구조를 지원한다.
 *   displayOrder로 카테고리 표시 순서를 제어하며, isActive로 활성/비활성을 관리한다.
 *
 * Tiếng Việt: Model GraphQL Danh mục Menu Thương hiệu.
 *   ObjectType biểu diễn danh mục menu được quản lý bởi trụ sở thương hiệu (BrandHQ).
 *   Hỗ trợ cấu trúc danh mục phân cấp (cây) thông qua parentCategoryId.
 *   Kiểm soát thứ tự hiển thị danh mục bằng displayOrder, quản lý trạng thái kích hoạt/vô hiệu bằng isActive.
 */
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class BrandMenuCategoryModel {
  /** 한국어: 카테고리 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất danh mục (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 브랜드 본사 ID / Tiếng Việt: ID trụ sở thương hiệu sở thuộc */
  @Field()
  brandHQId!: string;

  /** 한국어: 카테고리 코드 (고유 식별 코드) / Tiếng Việt: Mã danh mục (mã định danh duy nhất) */
  @Field()
  categoryCode!: string;

  /** 한국어: 카테고리 이름 / Tiếng Việt: Tên danh mục */
  @Field()
  categoryName!: string;

  /**
   * 한국어: 상위 카테고리 ID (선택). null이면 최상위 카테고리이다.
   * Tiếng Việt: ID danh mục cha (tùy chọn). Nếu null thì là danh mục cấp cao nhất.
   */
  @Field(() => String, { nullable: true })
  parentCategoryId?: string | null;

  /** 한국어: 표시 순서 (낮을수록 먼저 표시) / Tiếng Việt: Thứ tự hiển thị (càng thấp càng hiển thị trước) */
  @Field(() => Int)
  displayOrder!: number;

  /** 한국어: 활성 상태 여부 / Tiếng Việt: Trạng thái kích hoạt */
  @Field()
  isActive!: boolean;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;
}
