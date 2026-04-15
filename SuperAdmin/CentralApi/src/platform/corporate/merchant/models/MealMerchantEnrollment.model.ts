/**
 * [KO] 식권 제휴 가맹점 등록(Enrollment) 모델
 *      BrandHQ(브랜드 본사)가 식권 서비스에 가맹점으로 등록될 때 생성되는 GraphQL 응답 모델입니다.
 *      하나의 BrandHQ 는 하나의 Enrollment 만 가질 수 있습니다 (brandHqId unique).
 *
 *      loopType 에 따라 가맹점 성격이 달라집니다:
 *        - OPEN_LOOP  : 도심 제휴 식당. 여러 기업의 직원이 자유롭게 사용 가능.
 *                        플랫폼이 결제를 중개하고, 수수료를 받아 정산합니다.
 *        - CLOSED_LOOP: 구내식당(사내식당). 특정 기업 전용으로 운영.
 *                        기업이 직접 식당을 운영하거나 위탁하며, 정산 구조가 단순합니다.
 *
 * [VI] Model đăng ký (Enrollment) nhà hàng đối tác phiếu ăn
 *      Được tạo khi BrandHQ (trụ sở thương hiệu) đăng ký làm merchant trong hệ thống phiếu ăn.
 *      Mỗi BrandHQ chỉ có duy nhất một Enrollment (brandHqId là unique).
 *
 *      Phân loại theo loopType:
 *        - OPEN_LOOP  : Nhà hàng liên kết ngoài. Nhân viên nhiều công ty có thể sử dụng.
 *                        Nền tảng trung gian thanh toán và thu phí hoa hồng.
 *        - CLOSED_LOOP: Canteen nội bộ. Chỉ phục vụ nhân viên một công ty cụ thể.
 *                        Cấu trúc quyết toán đơn giản hơn.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantEnrollmentModel {
  /** [KO] 등록 고유 ID (UUID) / [VI] ID duy nhất của enrollment (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 브랜드 본사 ID — BrandProfile 과 1:1 연결 / [VI] ID trụ sở thương hiệu — liên kết 1:1 với BrandProfile */
  @Field() brandHqId!: string;

  /** [KO] 브랜드명 (조회 시 BrandProfile 에서 JOIN) / [VI] Tên thương hiệu (JOIN từ BrandProfile khi truy vấn) */
  @Field(() => String, { nullable: true }) brandName?: string | null;

  /** [KO] 요리 카테고리 (JOIN) / [VI] Loại ẩm thực (JOIN) */
  @Field(() => String, { nullable: true }) cuisineType?: string | null;

  /** [KO] 로고 이미지 URL (JOIN) / [VI] URL ảnh logo (JOIN) */
  @Field(() => String, { nullable: true }) logoUrl?: string | null;

  /**
   * [KO] 활성 상태. true 면 식권 거래 가능, false 면 거래 차단.
   *      activate/deactivate mutation 으로 전환합니다.
   * [VI] Trạng thái hoạt động. true = có thể giao dịch phiếu ăn, false = bị chặn.
   *      Chuyển đổi qua mutation activate/deactivate.
   */
  @Field() isActive!: boolean;

  /**
   * [KO] 루프 유형: 'OPEN_LOOP'(도심 제휴 식당) 또는 'CLOSED_LOOP'(구내식당)
   *      등록 시 결정되며, 수수료 구조와 정산 방식에 영향을 줍니다.
   * [VI] Loại vòng lặp: 'OPEN_LOOP' (nhà hàng liên kết) hoặc 'CLOSED_LOOP' (canteen nội bộ)
   *      Quyết định khi đăng ký, ảnh hưởng đến cấu trúc hoa hồng và quyết toán.
   */
  @Field() loopType!: string;

  /** [KO] 등록 일시 / [VI] Ngày giờ đăng ký */
  @Field() enrolledAt!: Date;

  /**
   * [KO] 계약 만료일. null 이면 무기한 계약.
   * [VI] Ngày hết hạn hợp đồng. null = hợp đồng vô thời hạn.
   */
  @Field(() => Date, { nullable: true }) contractEndsAt?: Date | null;

  /** [KO] 레코드 생성 일시 / [VI] Ngày giờ tạo bản ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 일시 / [VI] Ngày giờ cập nhật bản ghi lần cuối */
  @Field() updatedAt!: Date;
}
