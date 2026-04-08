/**
 * 한국어: 브랜드 프로필(BrandProfile) GraphQL 모델.
 *   대리점(Distributor) 산하의 브랜드 본사(BrandHQ)를 표현하는 ObjectType이다.
 *   브랜드 코드, 국가, 기본 언어, 사업자 정보, 담당자 연락처 등을 포함한다.
 *   하나의 브랜드는 반드시 하나의 대리점에 소속된다.
 *   하위에 지점(Branch), 메뉴 카테고리, 메뉴 항목, 가격 정책, 프로모션을 가진다 (1:N 관계).
 *
 * Tiếng Việt: Model GraphQL Hồ sơ Thương hiệu (BrandProfile).
 *   ObjectType biểu diễn trụ sở thương hiệu (BrandHQ) thuộc Đại lý (Distributor).
 *   Bao gồm mã thương hiệu, quốc gia, ngôn ngữ mặc định, thông tin doanh nghiệp,
 *   và thông tin liên hệ người phụ trách.
 *   Mỗi thương hiệu bắt buộc thuộc về một đại lý.
 *   Có chi nhánh, danh mục menu, mục menu, chính sách giá, khuyến mãi bên dưới (quan hệ 1:N).
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BranchModel } from '@platform/branch/profile/models/branch.model';
import { BrandMenuCategoryModel } from '@platform/brand/catalog/menu-category/models/brand-menu-category.model';
import { BrandMenuItemModel } from '@platform/brand/catalog/menu-item/models/brand-menu-item.model';
import { PricePolicyModel } from '@platform/brand/catalog/price-policy/models/price-policy.model';
import { PromotionModel } from '@platform/brand/catalog/promotion/models/promotion.model';

@ObjectType()
export class BrandProfileModel {
  /** 한국어: 브랜드 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất thương hiệu (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 대리점 ID / Tiếng Việt: ID đại lý sở thuộc */
  @Field()
  distributorId!: string;

  /** 한국어: 브랜드 코드 (고유 식별 코드) / Tiếng Việt: Mã thương hiệu (mã định danh duy nhất) */
  @Field()
  brandCode!: string;

  /** 한국어: 브랜드 이름 / Tiếng Việt: Tên thương hiệu */
  @Field()
  brandName!: string;

  /** 한국어: 국가 코드 (ISO 3166-1) / Tiếng Việt: Mã quốc gia (ISO 3166-1) */
  @Field()
  countryCode!: string;

  /** 한국어: 기본 언어 코드 / Tiếng Việt: Mã ngôn ngữ mặc định */
  @Field()
  defaultLanguageCode!: string;

  /** 한국어: 사업자 등록 번호 (선택) / Tiếng Việt: Mã số doanh nghiệp (tùy chọn) */
  @Field(() => String, { nullable: true })
  businessNumber?: string | null;

  /** 한국어: 담당자 이름 (선택) / Tiếng Việt: Tên người liên hệ (tùy chọn) */
  @Field(() => String, { nullable: true })
  contactName?: string | null;

  /** 한국어: 담당자 이메일 (선택) / Tiếng Việt: Email người liên hệ (tùy chọn) */
  @Field(() => String, { nullable: true })
  contactEmail?: string | null;

  /** 한국어: 담당자 전화번호 (선택) / Tiếng Việt: Số điện thoại người liên hệ (tùy chọn) */
  @Field(() => String, { nullable: true })
  contactPhone?: string | null;

  /** 한국어: 브랜드 상태 (예: 'Active', 'Suspended') / Tiếng Việt: Trạng thái thương hiệu (vd: 'Active', 'Suspended') */
  @Field()
  status!: string;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;

  /** 한국어: 이 브랜드에 소속된 지점 목록 (관계 필드) / Tiếng Việt: Danh sách chi nhánh thuộc thương hiệu này (trường quan hệ) */
  @Field(() => [BranchModel])
  branches?: BranchModel[];

  /** 한국어: 이 브랜드의 메뉴 카테고리 목록 (관계 필드) / Tiếng Việt: Danh sách danh mục menu của thương hiệu này (trường quan hệ) */
  @Field(() => [BrandMenuCategoryModel])
  menuCategories?: BrandMenuCategoryModel[];

  /** 한국어: 이 브랜드의 메뉴 항목 목록 (관계 필드) / Tiếng Việt: Danh sách mục menu của thương hiệu này (trường quan hệ) */
  @Field(() => [BrandMenuItemModel])
  menuItems?: BrandMenuItemModel[];

  /** 한국어: 이 브랜드의 가격 정책 목록 (관계 필드) / Tiếng Việt: Danh sách chính sách giá của thương hiệu này (trường quan hệ) */
  @Field(() => [PricePolicyModel])
  pricePolicies?: PricePolicyModel[];

  /** 한국어: 이 브랜드의 프로모션 목록 (관계 필드) / Tiếng Việt: Danh sách khuyến mãi của thương hiệu này (trường quan hệ) */
  @Field(() => [PromotionModel])
  promotions?: PromotionModel[];
}
