/**
 * [KO] 정산 배치 실행 입력 DTO
 *      특정 BrandHQ + 기간에 대해 3-Way Matching 정산 배치를 실행할 때 사용하는
 *      GraphQL Input 입니다.
 *
 *      실행 시 수행되는 단계:
 *        1. 기간 내 APPROVED 상태 MealTransaction 을 조회하여 grossAmountVnd 계산
 *        2. 유효 수수료율(baseRatePct) 로 commissionAmountVnd 계산
 *        3. 기업 원장(MealWalletFundingEntry) 과 거래별 회사 부담금(companyShareVnd) 대조
 *        4. 불일치가 없으면 MATCHED, 있으면 EXCEPTION 상태로 배치 생성/갱신
 *        5. 대상 거래를 SETTLED 상태로 전환
 *
 *      동일 brandHqId + periodStart + periodEnd 조합이 이미 존재하면 upsert(갱신).
 *
 * [VI] DTO đầu vào chạy batch quyết toán
 *      GraphQL Input dùng khi chạy batch quyết toán 3-Way Matching cho BrandHQ + kỳ cụ thể.
 *
 *      Các bước thực hiện:
 *        1. Truy vấn MealTransaction APPROVED trong kỳ, tính grossAmountVnd
 *        2. Tính commissionAmountVnd theo baseRatePct hiệu lực
 *        3. Đối chiếu sổ cái DN (MealWalletFundingEntry) với phần công ty chịu (companyShareVnd)
 *        4. Khớp = MATCHED, không khớp = EXCEPTION, tạo/cập nhật batch
 *        5. Chuyển giao dịch mục tiêu sang trạng thái SETTLED
 *
 *      Nếu tổ hợp brandHqId + periodStart + periodEnd đã tồn tại thì upsert (cập nhật).
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class RunMealSettlementBatchInput {
  /** [KO] 정산 대상 브랜드 본사 ID / [VI] ID trụ sở thương hiệu mục tiêu quyết toán */
  @Field(() => ID) @IsUUID() brandHqId!: string;

  /** [KO] 정산 대상 기간 시작일 (inclusive) / [VI] Ngày bắt đầu kỳ quyết toán (bao gồm) */
  @Field() periodStart!: Date;

  /** [KO] 정산 대상 기간 종료일 (exclusive) / [VI] Ngày kết thúc kỳ quyết toán (không bao gồm) */
  @Field() periodEnd!: Date;
}
