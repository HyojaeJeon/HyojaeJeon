/**
 * [KO] 식권 정산 배치(Settlement Batch) 모델
 *      특정 BrandHQ + 기간(periodStart~periodEnd) 단위로 생성되는 정산 배치의
 *      GraphQL 응답 모델입니다. brandHqId + periodStart + periodEnd 조합이 unique 합니다.
 *
 *      === 3-Way Matching 정산 프로세스 ===
 *      3개 데이터 소스를 대조(matching)하여 정산 금액의 정합성을 검증합니다:
 *
 *        소스 1) POS 거래 원장 (MealTransaction)
 *           -> 기간 내 APPROVED 상태 거래의 approvedAmountVnd 합산 = grossAmountVnd
 *        소스 2) 기업 지원금 원장 (MealWalletFundingEntry)
 *           -> 기간 내 POSTED 상태 충전의 amountVnd 합산 = corporateLedgerTotal
 *        소스 3) 거래별 회사 부담금 (MealTransaction.companyShareVnd)
 *           -> 기간 내 거래의 companyShareVnd 합산 = companyShareTotal
 *
 *        소스 2 와 소스 3 이 일치하면 MATCHED, 불일치하면 EXCEPTION.
 *
 *      === status 상태 머신 ===
 *        MATCHED           : 3-Way 매칭 성공. 승인 대기 상태.
 *        EXCEPTION         : 3-Way 불일치 발생. resolveException() 으로 수동 보정 후 MATCHED 로 복귀.
 *        APPROVED          : 관리자 승인 완료. 지급 요청 가능 상태.
 *        PAYOUT_REQUESTED  : 은행 이체 요청됨. 외부 ACK 대기.
 *        PAID              : 은행 이체 완료. 최종 상태.
 *
 *        상태 전이 흐름:
 *          MATCHED -> APPROVED -> PAYOUT_REQUESTED -> PAID
 *          EXCEPTION -> (resolveException) -> MATCHED -> ...
 *
 *      === payoutStatus 지급 상태 ===
 *        null       : 아직 지급 요청 안 됨
 *        REQUESTED  : 은행 이체 요청됨 (requestPayout 호출 시)
 *        (향후 COMPLETED, FAILED 등 확장 가능)
 *
 * [VI] Model batch quyết toán phiếu ăn (Settlement Batch)
 *      Model GraphQL cho batch quyết toán tạo theo đơn vị BrandHQ + giai đoạn (periodStart~periodEnd).
 *      Tổ hợp brandHqId + periodStart + periodEnd là unique.
 *
 *      === Quy trình quyết toán 3-Way Matching ===
 *      Đối chiếu 3 nguồn dữ liệu để xác minh tính chính xác của số tiền quyết toán:
 *
 *        Nguồn 1) Sổ cái giao dịch POS (MealTransaction)
 *           -> Tổng approvedAmountVnd các giao dịch APPROVED trong kỳ = grossAmountVnd
 *        Nguồn 2) Sổ cái nạp tiền doanh nghiệp (MealWalletFundingEntry)
 *           -> Tổng amountVnd các khoản nạp POSTED trong kỳ = corporateLedgerTotal
 *        Nguồn 3) Phần công ty chịu mỗi giao dịch (MealTransaction.companyShareVnd)
 *           -> Tổng companyShareVnd các giao dịch trong kỳ = companyShareTotal
 *
 *        Nguồn 2 khớp Nguồn 3 = MATCHED, không khớp = EXCEPTION.
 *
 *      === Máy trạng thái status ===
 *        MATCHED           : 3-Way matching thành công. Chờ phê duyệt.
 *        EXCEPTION         : Phát hiện bất khớp 3-Way. Gọi resolveException() để sửa thủ công rồi về MATCHED.
 *        APPROVED          : Đã được admin phê duyệt. Có thể yêu cầu thanh toán.
 *        PAYOUT_REQUESTED  : Đã yêu cầu chuyển khoản ngân hàng. Chờ ACK.
 *        PAID              : Chuyển khoản hoàn tất. Trạng thái cuối cùng.
 *
 *        Luồng chuyển trạng thái:
 *          MATCHED -> APPROVED -> PAYOUT_REQUESTED -> PAID
 *          EXCEPTION -> (resolveException) -> MATCHED -> ...
 *
 *      === payoutStatus trạng thái thanh toán ===
 *        null       : Chưa yêu cầu thanh toán
 *        REQUESTED  : Đã yêu cầu chuyển khoản (khi gọi requestPayout)
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealSettlementBatchModel {
  /** [KO] 정산 배치 고유 ID (UUID) / [VI] ID duy nhất batch quyết toán (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 대상 브랜드 본사 ID / [VI] ID trụ sở thương hiệu mục tiêu */
  @Field() brandHqId!: string;

  /**
   * [KO] 브랜드명 (가상 필드 — BrandProfile.brandName에서 resolve).
   *      DB 컬럼이 아니며, Resolver의 @ResolveField로 런타임에 채워집니다.
   * [VI] Tên thương hiệu (trường ảo — resolve từ BrandProfile.brandName).
   *      Không phải cột DB, được điền runtime bởi @ResolveField trong Resolver.
   */
  @Field(() => String, { nullable: true }) brandName?: string | null;

  /** [KO] 정산 대상 기간 시작일 / [VI] Ngày bắt đầu kỳ quyết toán */
  @Field() periodStart!: Date;

  /** [KO] 정산 대상 기간 종료일 / [VI] Ngày kết thúc kỳ quyết toán */
  @Field() periodEnd!: Date;

  /**
   * [KO] 배치 상태: MATCHED | EXCEPTION | APPROVED | PAYOUT_REQUESTED | PAID
   *      위의 "status 상태 머신" 참조.
   * [VI] Trạng thái batch: MATCHED | EXCEPTION | APPROVED | PAYOUT_REQUESTED | PAID
   *      Xem "Máy trạng thái status" ở trên.
   */
  @Field() status!: string;

  /**
   * [KO] 총 거래 금액 (VND). 기간 내 APPROVED 거래의 approvedAmountVnd 합산.
   * [VI] Tổng giá trị giao dịch (VND). Tổng approvedAmountVnd các giao dịch APPROVED trong kỳ.
   */
  @Field(() => GraphQLBigInt) grossAmountVnd!: bigint;

  /**
   * [KO] 수수료 금액 (VND). grossAmountVnd * baseRatePct / 100 으로 계산.
   * [VI] Số tiền hoa hồng (VND). Tính bằng grossAmountVnd * baseRatePct / 100.
   */
  @Field(() => GraphQLBigInt) commissionAmountVnd!: bigint;

  /**
   * [KO] 가맹점 지급액 (VND). grossAmountVnd - commissionAmountVnd.
   *      가맹점이 실제로 수령하는 금액.
   * [VI] Số tiền thanh toán cho merchant (VND). grossAmountVnd - commissionAmountVnd.
   *      Số tiền merchant thực nhận.
   */
  @Field(() => GraphQLBigInt) netPayableVnd!: bigint;

  /**
   * [KO] 3-Way Matching 불일치 건수. 0 이면 MATCHED, 1 이상이면 EXCEPTION.
   *      기업 원장(corporateLedgerTotal) 과 회사 지원 사용 총액(companyShareTotal) 의 차이.
   * [VI] Số bất khớp 3-Way Matching. 0 = MATCHED, >= 1 = EXCEPTION.
   *      Chênh lệch giữa sổ cái doanh nghiệp (corporateLedgerTotal) và tổng phần công ty chịu (companyShareTotal).
   */
  @Field(() => Int) threeWayMismatchCount!: number;

  // ───── 승인 워크플로우 / Quy trình phê duyệt ─────

  /** [KO] 승인자 사용자 ID / [VI] ID người dùng phê duyệt */
  @Field(() => String, { nullable: true }) approvedBy?: string | null;

  /** [KO] 승인 일시 / [VI] Ngày giờ phê duyệt */
  @Field(() => Date, { nullable: true }) approvedAt?: Date | null;

  /** [KO] 승인 메모 (또는 예외 해결 메모) / [VI] Ghi chú phê duyệt (hoặc ghi chú giải quyết bất thường) */
  @Field(() => String, { nullable: true }) approvalMemo?: string | null;

  // ───── 지급(Payout) 워크플로우 / Quy trình thanh toán (Payout) ─────

  /** [KO] 외부 은행 이체 참조 번호 / [VI] Số tham chiếu chuyển khoản ngân hàng */
  @Field(() => String, { nullable: true }) payoutReference?: string | null;

  /**
   * [KO] 지급 상태: null(미요청) | 'REQUESTED'(이체 요청됨)
   * [VI] Trạng thái thanh toán: null (chưa yêu cầu) | 'REQUESTED' (đã yêu cầu chuyển khoản)
   */
  @Field(() => String, { nullable: true }) payoutStatus?: string | null;

  /** [KO] 지급 요청 일시 / [VI] Ngày giờ yêu cầu thanh toán */
  @Field(() => Date, { nullable: true }) payoutRequestedAt?: Date | null;

  /** [KO] 지급 완료 일시 / [VI] Ngày giờ hoàn tất thanh toán */
  @Field(() => Date, { nullable: true }) payoutCompletedAt?: Date | null;

  /** [KO] 레코드 생성 일시 / [VI] Ngày giờ tạo bản ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 일시 / [VI] Ngày giờ cập nhật bản ghi lần cuối */
  @Field() updatedAt!: Date;
}
