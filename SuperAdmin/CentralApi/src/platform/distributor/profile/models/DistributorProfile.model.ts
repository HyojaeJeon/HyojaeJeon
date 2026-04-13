/**
 * 한국어: 대리점 프로필(DistributorProfile) GraphQL 모델.
 *   지역 대리점/유통사를 표현하는 ObjectType이다.
 *   대리점은 테넌트 계층의 최상위 엔티티로, 하위에 여러 브랜드를 가질 수 있다 (1:N 관계).
 *   대리점 코드, 회사명, 법인명, 사업자번호, 관할 지역, 담당자 정보 등을 포함한다.
 *
 * Tiếng Việt: Model GraphQL Hồ sơ Đại lý (DistributorProfile).
 *   ObjectType biểu diễn đại lý/nhà phân phối khu vực.
 *   Đại lý là entity cấp cao nhất trong hệ thống phân cấp tenant,
 *   có thể có nhiều thương hiệu bên dưới (quan hệ 1:N).
 *   Bao gồm mã đại lý, tên công ty, tên pháp lý, mã số doanh nghiệp,
 *   khu vực quản lý, và thông tin người liên hệ.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BrandProfileModel } from '@platform/brand/profile/models/BrandProfile.model';

@ObjectType()
export class DistributorProfileModel {
  /** 한국어: 대리점 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất đại lý (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 대리점 코드 (고유 식별 코드) / Tiếng Việt: Mã đại lý (mã định danh duy nhất) */
  @Field()
  distributorCode!: string;

  /** 한국어: 회사명 / Tiếng Việt: Tên công ty */
  @Field()
  companyName!: string;

  /** 한국어: 법인명 (선택) / Tiếng Việt: Tên pháp lý (tùy chọn) */
  @Field(() => String, { nullable: true })
  legalName?: string | null;

  /** 한국어: 사업자 등록 번호 (선택) / Tiếng Việt: Mã số doanh nghiệp (tùy chọn) */
  @Field(() => String, { nullable: true })
  businessNumber?: string | null;

  /** 한국어: 국가 코드 (ISO 3166-1) / Tiếng Việt: Mã quốc gia (ISO 3166-1) */
  @Field()
  countryCode!: string;

  /** 한국어: 관할 지역/영역 이름 / Tiếng Việt: Tên vùng lãnh thổ quản lý */
  @Field()
  territoryName!: string;

  /** 한국어: 기본 언어 코드 / Tiếng Việt: Mã ngôn ngữ mặc định */
  @Field()
  defaultLanguageCode!: string;

  /** 한국어: 대리점 상태 (예: 'Active', 'Suspended') / Tiếng Việt: Trạng thái đại lý (vd: 'Active', 'Suspended') */
  @Field()
  status!: string;

  /** 한국어: 담당자 이름 (선택) / Tiếng Việt: Tên người liên hệ (tùy chọn) */
  @Field(() => String, { nullable: true })
  contactName?: string | null;

  /** 한국어: 담당자 이메일 (선택) / Tiếng Việt: Email người liên hệ (tùy chọn) */
  @Field(() => String, { nullable: true })
  contactEmail?: string | null;

  /** 한국어: 담당자 전화번호 (선택) / Tiếng Việt: Số điện thoại người liên hệ (tùy chọn) */
  @Field(() => String, { nullable: true })
  contactPhone?: string | null;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;

  /** 한국어: 이 대리점에 소속된 브랜드 목록 (관계 필드) / Tiếng Việt: Danh sách thương hiệu thuộc đại lý này (trường quan hệ) */
  @Field(() => [BrandProfileModel])
  brands?: BrandProfileModel[];
}
