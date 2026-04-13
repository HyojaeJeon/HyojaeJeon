/**
 * [KO] 수익 요약(Revenue Summary) 모델
 *      특정 기간의 전체 식권 서비스 수익 현황을 요약하는 GraphQL 응답 모델입니다.
 *      SUPER_ADMIN 전용 대시보드에서 사용하며, 개별 BrandHQ 가 아닌 플랫폼 전체를 집계합니다.
 *
 *      포함하는 지표:
 *        - 총 거래 금액/건수    : 기간 내 APPROVED + SETTLED 상태 거래 합산
 *        - 총 수수료            : 정산 배치의 commissionAmountVnd 합산 (플랫폼 매출)
 *        - 미결 정산            : MATCHED/APPROVED/PAYOUT_REQUESTED 배치의 netPayableVnd 합산
 *        - 연체 크레딧          : CREDIT_NET15/CREDIT_NET30 펀딩 모델 기업의 미상환 크레딧
 *
 * [VI] Model tóm tắt doanh thu (Revenue Summary)
 *      Model GraphQL tóm tắt tình hình doanh thu toàn bộ dịch vụ phiếu ăn trong một kỳ.
 *      Dùng cho dashboard SUPER_ADMIN, tổng hợp toàn nền tảng (không phải từng BrandHQ).
 *
 *      Các chỉ số bao gồm:
 *        - Tổng giá trị/số lượng giao dịch : Tổng hợp giao dịch APPROVED + SETTLED trong kỳ
 *        - Tổng hoa hồng                   : Tổng commissionAmountVnd các batch (doanh thu nền tảng)
 *        - Quyết toán chưa xử lý           : Tổng netPayableVnd batch MATCHED/APPROVED/PAYOUT_REQUESTED
 *        - Tín dụng quá hạn                : Tín dụng chưa hoàn trả của DN mô hình CREDIT_NET15/CREDIT_NET30
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

/**
 * [KO] 브랜드별 미정산 거래 집계 — 배치 실행 전 APPROVED 상태 거래를 브랜드별로 그룹화.
 * [VI] Tổng hợp giao dịch chưa quyết toán theo thương hiệu — nhóm giao dịch APPROVED chưa thuộc batch nào.
 */
@ObjectType()
export class UnsettledBrandSummaryModel {
  /** [KO] 브랜드 본사 ID / [VI] ID trụ sở thương hiệu */
  @Field(() => ID) brandHqId!: string;

  /** [KO] 브랜드명 (resolve) / [VI] Tên thương hiệu */
  @Field(() => String, { nullable: true }) brandName?: string | null;

  /** [KO] 미정산 거래 금액 (VND) / [VI] Số tiền giao dịch chưa quyết toán (VND) */
  @Field(() => GraphQLBigInt) totalVnd!: bigint;

  /** [KO] 미정산 거래 건수 / [VI] Số giao dịch chưa quyết toán */
  @Field(() => Int) count!: number;

  /** [KO] 가장 오래된 미정산 거래일 / [VI] Ngày giao dịch chưa quyết toán cũ nhất */
  @Field(() => String, { nullable: true }) oldestTransactionDate?: string | null;
}

@ObjectType()
export class RevenueSummaryModel {
  /**
   * [KO] 총 거래 금액 (VND). 기간 내 APPROVED + SETTLED 거래의 approvedAmountVnd 합산.
   * [VI] Tổng giá trị giao dịch (VND). Tổng approvedAmountVnd giao dịch APPROVED + SETTLED trong kỳ.
   */
  @Field(() => GraphQLBigInt) totalTransactionVnd!: bigint;

  /**
   * [KO] 확정 수수료 금액 (VND). 정산 배치의 commissionAmountVnd 합산.
   * [VI] Hoa hồng đã xác nhận (VND). Tổng commissionAmountVnd các batch.
   */
  @Field(() => GraphQLBigInt) settledCommissionVnd!: bigint;

  /**
   * [KO] 미정산 거래 예상 수수료 (VND). APPROVED 거래에 가맹점별 수수료율 적용한 추정치.
   * [VI] Hoa hồng ước tính từ giao dịch chưa quyết toán (VND). Áp dụng tỷ lệ hoa hồng merchant.
   */
  @Field(() => GraphQLBigInt) estimatedCommissionVnd!: bigint;

  /**
   * [KO] 총 수수료 금액 (VND) = 확정 + 예상. 이것이 플랫폼의 기간 내 전체 매출.
   * [VI] Tổng hoa hồng (VND) = đã xác nhận + ước tính. Đây là tổng doanh thu nền tảng trong kỳ.
   */
  @Field(() => GraphQLBigInt) totalCommissionVnd!: bigint;

  /**
   * [KO] 미결 정산 금액 (VND). 아직 가맹점에 지급되지 않은 정산 대기 금액.
   *      MATCHED + APPROVED + PAYOUT_REQUESTED 상태 배치의 netPayableVnd 합산.
   * [VI] Số tiền quyết toán chưa xử lý (VND). Số tiền chưa thanh toán cho merchant.
   *      Tổng netPayableVnd batch trạng thái MATCHED + APPROVED + PAYOUT_REQUESTED.
   */
  @Field(() => GraphQLBigInt) pendingSettlementVnd!: bigint;

  /**
   * [KO] 연체 크레딧 금액 (VND). CREDIT_NET15/CREDIT_NET30 펀딩 모델 기업 중
   *      creditOutstandingVnd > 0 인 기업의 미상환 크레딧 합산.
   * [VI] Tín dụng quá hạn (VND). Tổng creditOutstandingVnd > 0 của các doanh nghiệp
   *      theo mô hình nạp tiền CREDIT_NET15/CREDIT_NET30.
   */
  @Field(() => GraphQLBigInt) overdueCreditVnd!: bigint;

  /** [KO] 총 거래 건수 / [VI] Tổng số lượng giao dịch */
  @Field(() => Int) totalTransactionCount!: number;

  /** [KO] 미결 정산 배치 건수 / [VI] Số batch quyết toán chưa xử lý */
  @Field(() => Int) pendingBatchCount!: number;

  /**
   * [KO] 미정산 거래 금액 (VND). APPROVED 상태이지만 아직 정산 배치에 포함되지 않은 거래의 합산.
   *      정산 배치 실행(runBatch) 전 단계의 거래들.
   * [VI] Số tiền giao dịch chưa quyết toán (VND). Tổng giao dịch APPROVED nhưng chưa thuộc batch nào.
   */
  @Field(() => GraphQLBigInt) unsettledTransactionVnd!: bigint;

  /** [KO] 미정산 거래 건수 / [VI] Số giao dịch chưa quyết toán */
  @Field(() => Int) unsettledTransactionCount!: number;

  /** [KO] 조회 기간 시작일 (ISO 문자열) / [VI] Ngày bắt đầu kỳ truy vấn (chuỗi ISO) */
  @Field() periodStart!: string;

  /** [KO] 조회 기간 종료일 (ISO 문자열) / [VI] Ngày kết thúc kỳ truy vấn (chuỗi ISO) */
  @Field() periodEnd!: string;
}

/**
 * [KO] 정산 대시보드 통합 응답 — 1P1Q 원칙에 따라 단일 쿼리로 수익 요약 + 배치 리스트 + 미정산 거래를 반환.
 * [VI] Phản hồi tổng hợp dashboard quyết toán — theo nguyên tắc 1P1Q, trả về tóm tắt doanh thu + danh sách batch + giao dịch chưa QT trong một query duy nhất.
 */
@ObjectType()
export class SettlementDashboardModel {
  @Field(() => RevenueSummaryModel) revenue!: RevenueSummaryModel;

  @Field(() => [MealSettlementBatchRef]) batches!: MealSettlementBatchRef[];
  @Field(() => Int) batchTotalCount!: number;

  @Field(() => [UnsettledBrandSummaryModel]) unsettledBrands!: UnsettledBrandSummaryModel[];
}

/** [KO] 배치 목록용 — MealSettlementBatch의 인라인 참조 (brandName 포함) */
@ObjectType()
export class MealSettlementBatchRef {
  @Field(() => ID) id!: string;
  @Field() brandHqId!: string;
  @Field(() => String, { nullable: true }) brandName?: string | null;
  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
  @Field() status!: string;
  @Field(() => GraphQLBigInt) grossAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) commissionAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) netPayableVnd!: bigint;
  @Field(() => Int) threeWayMismatchCount!: number;
  @Field(() => String, { nullable: true }) approvedBy?: string | null;
  @Field(() => Date, { nullable: true }) approvedAt?: Date | null;
  @Field(() => String, { nullable: true }) approvalMemo?: string | null;
  @Field(() => String, { nullable: true }) payoutReference?: string | null;
  @Field(() => String, { nullable: true }) payoutStatus?: string | null;
  @Field(() => Date, { nullable: true }) payoutRequestedAt?: Date | null;
  @Field(() => Date, { nullable: true }) payoutCompletedAt?: Date | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
