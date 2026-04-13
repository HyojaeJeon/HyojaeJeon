/**
 * [KO] 식권 가맹점 등록(Enroll) 입력 DTO
 *      BrandHQ 를 식권 가맹점으로 최초 등록할 때 사용하는 GraphQL Input 입니다.
 *      등록 직후 isActive=false 상태이며, 별도로 activate mutation 을 호출해야 거래가 가능합니다.
 *
 *      loopType 선택 기준:
 *        - OPEN_LOOP  : 도심 제휴 식당 — 여러 기업 직원이 식권으로 결제 가능한 외부 식당.
 *                        플랫폼이 결제 중개, 수수료 정산을 담당합니다.
 *        - CLOSED_LOOP: 구내식당 — 특정 기업 내부에서만 운영되는 식당.
 *                        기업이 직접 관리하므로 정산 구조가 단순합니다.
 *
 * [VI] DTO đầu vào đăng ký (Enroll) merchant phiếu ăn
 *      GraphQL Input dùng khi đăng ký BrandHQ làm merchant phiếu ăn lần đầu.
 *      Sau đăng ký, isActive=false; cần gọi mutation activate riêng để cho phép giao dịch.
 *
 *      Tiêu chí chọn loopType:
 *        - OPEN_LOOP  : Nhà hàng liên kết ngoài — nhân viên nhiều công ty dùng phiếu ăn thanh toán.
 *                        Nền tảng trung gian thanh toán và quyết toán hoa hồng.
 *        - CLOSED_LOOP: Canteen nội bộ — chỉ phục vụ nhân viên một công ty.
 *                        Cấu trúc quyết toán đơn giản hơn.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsUUID } from 'class-validator';

@InputType()
export class EnrollMealMerchantInput {
  /** [KO] 등록할 브랜드 본사 ID (UUID) / [VI] ID trụ sở thương hiệu cần đăng ký (UUID) */
  @Field(() => ID) @IsUUID() brandHqId!: string;

  /**
   * [KO] 루프 유형. 기본값 'OPEN_LOOP'. 'OPEN_LOOP' 또는 'CLOSED_LOOP' 만 허용.
   * [VI] Loại vòng lặp. Mặc định 'OPEN_LOOP'. Chỉ chấp nhận 'OPEN_LOOP' hoặc 'CLOSED_LOOP'.
   */
  @Field({ defaultValue: 'OPEN_LOOP' })
  @IsIn(['OPEN_LOOP', 'CLOSED_LOOP'])
  loopType!: string;

  /**
   * [KO] 계약 만료일 (선택). null/미입력 시 무기한 계약.
   * [VI] Ngày hết hạn hợp đồng (tùy chọn). null/bỏ trống = hợp đồng vô thời hạn.
   */
  @Field(() => Date, { nullable: true }) contractEndsAt?: Date;
}
