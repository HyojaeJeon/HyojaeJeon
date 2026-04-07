/**
 * 한국어: 브랜드 메뉴 항목(MenuItem) GraphQL 모델.
 *   브랜드 본사(BrandHQ)에서 관리하는 개별 메뉴 항목을 표현하는 ObjectType이다.
 *   각 메뉴 항목은 하나의 카테고리에 소속되며, 기본 가격(basePrice), 세율(taxRate),
 *   단위 유형(unitType), 품절 상태(isSoldOut) 등의 속성을 가진다.
 *   searchKeywords를 통해 POS 화면에서의 검색을 지원한다.
 *
 * Tiếng Việt: Model GraphQL Mục Menu Thương hiệu (MenuItem).
 *   ObjectType biểu diễn mục menu riêng lẻ được quản lý bởi trụ sở thương hiệu (BrandHQ).
 *   Mỗi mục menu thuộc về một danh mục, có các thuộc tính như giá cơ bản (basePrice),
 *   thuế suất (taxRate), loại đơn vị (unitType), trạng thái hết hàng (isSoldOut).
 *   Hỗ trợ tìm kiếm trên màn hình POS thông qua searchKeywords.
 */
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class BrandMenuItemModel {
  /** 한국어: 메뉴 항목 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất mục menu (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 브랜드 본사 ID / Tiếng Việt: ID trụ sở thương hiệu sở thuộc */
  @Field()
  brandHQId!: string;

  /** 한국어: 상품 코드 (고유 식별 코드) / Tiếng Việt: Mã sản phẩm (mã định danh duy nhất) */
  @Field()
  itemCode!: string;

  /** 한국어: 상품 이름 / Tiếng Việt: Tên sản phẩm */
  @Field()
  itemName!: string;

  /** 한국어: 소속 카테고리 ID / Tiếng Việt: ID danh mục sở thuộc */
  @Field()
  categoryId!: string;

  /** 한국어: 상품 유형 (예: 'Standard', 'Option', 'Set') / Tiếng Việt: Loại sản phẩm (vd: 'Standard', 'Option', 'Set') */
  @Field()
  itemType!: string;

  /** 한국어: 기본 단가 / Tiếng Việt: Đơn giá cơ bản */
  @Field(() => Float)
  basePrice!: number;

  /** 한국어: 세율 (0~1 사이 소수, 예: 0.1 = 10%) / Tiếng Việt: Thuế suất (số thập phân 0~1, vd: 0.1 = 10%) */
  @Field(() => Float)
  taxRate!: number;

  /** 한국어: 단위 유형 (예: 'EA', 'KG', 'L') / Tiếng Việt: Loại đơn vị (vd: 'EA', 'KG', 'L') */
  @Field()
  unitType!: string;

  /** 한국어: 품절 상태 여부 / Tiếng Việt: Trạng thái hết hàng */
  @Field()
  isSoldOut!: boolean;

  /** 한국어: 표시 순서 (낮을수록 먼저 표시) / Tiếng Việt: Thứ tự hiển thị (càng thấp càng hiển thị trước) */
  @Field(() => Int)
  displayOrder!: number;

  /** 한국어: 검색용 키워드 (선택, POS 화면 검색용) / Tiếng Việt: Từ khóa tìm kiếm (tùy chọn, dùng cho tìm kiếm trên màn hình POS) */
  @Field(() => String, { nullable: true })
  searchKeywords?: string | null;

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
