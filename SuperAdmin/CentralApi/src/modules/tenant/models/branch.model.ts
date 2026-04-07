/**
 * 한국어: 지점(Branch) GraphQL 모델.
 *   브랜드 본사(BrandHQ) 산하 개별 지점(매장)을 표현하는 ObjectType이다.
 *   하나의 지점은 반드시 하나의 브랜드 본사와 하나의 대리점에 소속된다.
 *   지점 유형(branchType), 위치 정보, 시간대, 기본 언어 등의 운영 속성을 포함한다.
 *   하위에 여러 Edge POS 터미널을 가질 수 있다 (1:N 관계).
 *
 * Tiếng Việt: Model GraphQL Chi nhánh (Branch).
 *   ObjectType biểu diễn chi nhánh (cửa hàng) riêng lẻ thuộc trụ sở thương hiệu (BrandHQ).
 *   Mỗi chi nhánh bắt buộc thuộc về một trụ sở thương hiệu và một đại lý.
 *   Bao gồm các thuộc tính vận hành như loại chi nhánh (branchType), thông tin vị trí,
 *   múi giờ, và ngôn ngữ mặc định.
 *   Có thể có nhiều Edge POS terminal bên dưới (quan hệ 1:N).
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { EdgePosTerminalModel } from './edge-pos-terminal.model';

@ObjectType()
export class BranchModel {
  /** 한국어: 지점 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất chi nhánh (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 브랜드 본사 ID / Tiếng Việt: ID trụ sở thương hiệu sở thuộc */
  @Field()
  brandHQId!: string;

  /** 한국어: 소속 대리점 ID / Tiếng Việt: ID đại lý sở thuộc */
  @Field()
  distributorId!: string;

  /** 한국어: 지점 코드 (고유 식별 코드) / Tiếng Việt: Mã chi nhánh (mã định danh duy nhất) */
  @Field()
  branchCode!: string;

  /** 한국어: 지점 이름 / Tiếng Việt: Tên chi nhánh */
  @Field()
  branchName!: string;

  /** 한국어: 지점 유형 (예: 'Dine-In', 'Takeout', 'Delivery') / Tiếng Việt: Loại chi nhánh (vd: 'Dine-In', 'Takeout', 'Delivery') */
  @Field()
  branchType!: string;

  /** 한국어: 국가 코드 (ISO 3166-1) / Tiếng Việt: Mã quốc gia (ISO 3166-1) */
  @Field()
  countryCode!: string;

  /** 한국어: 지역 코드 (선택) / Tiếng Việt: Mã vùng (tùy chọn) */
  @Field(() => String, { nullable: true })
  regionCode?: string | null;

  /** 한국어: 주소 1 (선택) / Tiếng Việt: Địa chỉ dòng 1 (tùy chọn) */
  @Field(() => String, { nullable: true })
  addressLine1?: string | null;

  /** 한국어: 주소 2 (선택) / Tiếng Việt: Địa chỉ dòng 2 (tùy chọn) */
  @Field(() => String, { nullable: true })
  addressLine2?: string | null;

  /** 한국어: 우편번호 (선택) / Tiếng Việt: Mã bưu chính (tùy chọn) */
  @Field(() => String, { nullable: true })
  postalCode?: string | null;

  /** 한국어: 시간대 코드 (예: 'Asia/Seoul') / Tiếng Việt: Mã múi giờ (vd: 'Asia/Seoul') */
  @Field()
  timeZoneCode!: string;

  /** 한국어: 기본 언어 코드 (예: 'ko', 'vi', 'en') / Tiếng Việt: Mã ngôn ngữ mặc định (vd: 'ko', 'vi', 'en') */
  @Field()
  defaultLanguageCode!: string;

  /** 한국어: 지점 상태 (예: 'Active', 'Suspended', 'Closed') / Tiếng Việt: Trạng thái chi nhánh (vd: 'Active', 'Suspended', 'Closed') */
  @Field()
  status!: string;

  /** 한국어: 개점일 (선택) / Tiếng Việt: Ngày khai trương (tùy chọn) */
  @Field(() => Date, { nullable: true })
  openingDate?: Date | null;

  /** 한국어: 폐점일 (선택) / Tiếng Việt: Ngày đóng cửa (tùy chọn) */
  @Field(() => Date, { nullable: true })
  closingDate?: Date | null;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;

  /** 한국어: 이 지점에 소속된 Edge POS 터미널 목록 (관계 필드) / Tiếng Việt: Danh sách Edge POS terminal thuộc chi nhánh này (trường quan hệ) */
  @Field(() => [EdgePosTerminalModel])
  edgePosTerminals?: EdgePosTerminalModel[];
}
