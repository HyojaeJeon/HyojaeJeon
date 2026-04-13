/**
 * [KO] 가맹점 수수료율 설정 입력 DTO
 *      기존 Enrollment 에 새로운 수수료율 레코드를 추가할 때 사용합니다.
 *      기존 레코드를 수정하지 않고 항상 새 레코드를 생성(append-only)합니다.
 *      정산 시점에 effectiveFrom/effectiveTo 범위 내 가장 최근 레코드를 적용합니다.
 *
 *      수수료율 적용 시나리오:
 *        1) 일반 가맹점: baseRatePct 만 설정 (예: 3.5%)
 *        2) 공단/특수지역 가맹점: baseRatePct + specialZoneRatePct 설정
 *           (예: base 3.5% + specialZone 1.5% -> 특수지역 우대 적용)
 *        3) 프랜차이즈 가맹점: franchiseFlatRatePct 설정 시 해당 값이 최우선 적용
 *           (예: 본사 계약 2.0% 균일 수수료)
 *
 * [VI] DTO đầu vào cài đặt tỷ lệ hoa hồng merchant
 *      Dùng để thêm bản ghi hoa hồng mới cho Enrollment hiện tại.
 *      Không sửa bản ghi cũ, luôn tạo mới (append-only).
 *      Khi quyết toán, bản ghi mới nhất trong khoảng effectiveFrom/effectiveTo được áp dụng.
 *
 *      Kịch bản áp dụng hoa hồng:
 *        1) Merchant thông thường: chỉ đặt baseRatePct (ví dụ: 3.5%)
 *        2) Merchant vùng đặc biệt: baseRatePct + specialZoneRatePct
 *           (ví dụ: base 3.5% + specialZone 1.5% -> ưu đãi vùng đặc biệt)
 *        3) Franchise: franchiseFlatRatePct được ưu tiên cao nhất
 *           (ví dụ: hợp đồng trụ sở 2.0% đồng nhất)
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class SetMealMerchantCommissionInput {
  /** [KO] 대상 가맹점 등록 ID / [VI] ID enrollment merchant mục tiêu */
  @Field(() => ID) @IsUUID() enrollmentId!: string;

  /** [KO] 수수료율 적용 시작일 / [VI] Ngày bắt đầu hiệu lực hoa hồng */
  @Field() effectiveFrom!: Date;

  /**
   * [KO] 수수료율 적용 종료일. null 이면 무기한.
   * [VI] Ngày kết thúc hiệu lực. null = vô thời hạn.
   */
  @Field(() => Date, { nullable: true }) effectiveTo?: Date;

  /**
   * [KO] 기본 수수료율(%). 모든 거래에 기본 적용되는 비율.
   * [VI] Tỷ lệ hoa hồng cơ bản (%). Áp dụng mặc định cho mọi giao dịch.
   */
  @Field() baseRatePct!: number;

  /**
   * [KO] 특별 구역 수수료율(%). 공단/특수지역 전용. 미해당 시 null.
   * [VI] Tỷ lệ hoa hồng vùng đặc biệt (%). Dành cho KCN/vùng đặc biệt. null = không áp dụng.
   */
  @Field({ nullable: true }) specialZoneRatePct?: number;

  /**
   * [KO] 프랜차이즈 고정 수수료율(%). 본사 단위 균일 계약 비율. 미해당 시 null.
   * [VI] Tỷ lệ hoa hồng cố định franchise (%). Hợp đồng đồng nhất trụ sở. null = không áp dụng.
   */
  @Field({ nullable: true }) franchiseFlatRatePct?: number;
}
