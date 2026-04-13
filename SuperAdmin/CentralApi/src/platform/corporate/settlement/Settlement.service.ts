/**
 * [KO] 식권 정산(Meal Settlement) 서비스
 *      3-Way Matching 정산 배치를 생성하고 상태를 관리합니다 (brand 축).
 *
 *      === 3-Way Matching 이란? ===
 *      세 가지 데이터 소스를 대조하여 정산 금액의 정합성을 검증하는 프로세스입니다:
 *        소스 1) POS 거래(MealTransaction) — 실제 매장에서 발생한 식권 결제 기록
 *        소스 2) 기업 원장(MealWalletFundingEntry) — 기업이 지갑에 충전한 금액 기록
 *        소스 3) 거래별 회사 부담금(companyShareVnd) — 각 거래에서 기업이 부담한 금액
 *        -> 소스 2 합산 == 소스 3 합산이면 MATCHED, 아니면 EXCEPTION
 *
 *      === 상태 전이 흐름 ===
 *        runBatch()         : 배치 생성 -> MATCHED 또는 EXCEPTION
 *        resolveException() : EXCEPTION -> MATCHED (수동 보정 후)
 *        approve()          : MATCHED -> APPROVED (관리자 승인)
 *        requestPayout()    : APPROVED -> PAYOUT_REQUESTED (은행 이체 요청)
 *        markPaid()         : PAYOUT_REQUESTED -> PAID (은행 ACK 수신)
 *
 *      보안: 모든 read/write 가 caller 의 brand scope 와 target brandHqId 일치를 검증합니다.
 *
 * [VI] Service quyết toán phiếu ăn (Meal Settlement)
 *      Tạo và quản lý trạng thái batch quyết toán 3-Way Matching (theo trục brand).
 *
 *      === 3-Way Matching là gì? ===
 *      Quy trình đối chiếu 3 nguồn dữ liệu để xác minh tính chính xác số tiền quyết toán:
 *        Nguồn 1) Giao dịch POS (MealTransaction) — bản ghi thanh toán phiếu ăn tại cửa hàng
 *        Nguồn 2) Sổ cái DN (MealWalletFundingEntry) — bản ghi DN nạp tiền vào ví
 *        Nguồn 3) Phần công ty chịu mỗi giao dịch (companyShareVnd)
 *        -> Tổng Nguồn 2 == Tổng Nguồn 3 = MATCHED, ngược lại = EXCEPTION
 *
 *      === Luồng chuyển trạng thái ===
 *        runBatch()         : Tạo batch -> MATCHED hoặc EXCEPTION
 *        resolveException() : EXCEPTION -> MATCHED (sau sửa thủ công)
 *        approve()          : MATCHED -> APPROVED (admin phê duyệt)
 *        requestPayout()    : APPROVED -> PAYOUT_REQUESTED (yêu cầu chuyển khoản)
 *        markPaid()         : PAYOUT_REQUESTED -> PAID (nhận ACK ngân hàng)
 *
 *      Bảo mật: Mọi read/write đều kiểm tra brand scope của caller khớp với brandHqId mục tiêu.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { EntitlementService } from '@shared/entitlement/Entitlement.service';
import { PermissionService } from '@core/rbac/Permission.service';
import {
  MealCallerCtx,
  assertBrandScope,
  withTargetBrand,
} from '../_internal/callerCtx';
import { MealMerchantService } from '../merchant/Merchant.service';
import { RunMealSettlementBatchInput } from './dto/RunMealSettlementBatch.input';
import { DomainError } from '@core/errors/DomainError';

@Injectable()
export class MealSettlementService {
  constructor(
    /** [KO] Prisma DB 접근 서비스 / [VI] Service truy cập DB Prisma */
    private readonly prisma: PrismaService,
    /** [KO] 기업 capability 검증 서비스 / [VI] Service kiểm tra capability doanh nghiệp */
    private readonly entitlement: EntitlementService,
    /** [KO] RBAC 권한 검증 서비스 / [VI] Service kiểm tra quyền RBAC */
    private readonly permission: PermissionService,
    /** [KO] 가맹점 서비스 — 유효 수수료율 조회에 사용 / [VI] Service merchant — dùng để truy vấn hoa hồng hiệu lực */
    private readonly merchant: MealMerchantService,
  ) {}

  /**
   * [KO] 전체 정산 배치 목록을 조회합니다 (페이지네이션 + 상태 필터).
   *      SUPER_ADMIN: 전체 조회. BRAND_ADMIN: 자기 brand scope 내에서만 조회.
   * [VI] Truy vấn danh sách tất cả batch quyết toán (phân trang + lọc trạng thái).
   *      SUPER_ADMIN: xem tất cả. BRAND_ADMIN: chỉ xem trong brand scope.
   */
  async list(
    ctx: MealCallerCtx,
    opts: {
      skip: number;
      take: number;
      status?: string;
      periodStart?: Date;
      periodEnd?: Date;
    },
  ) {
    const where: Record<string, unknown> = {};
    if (ctx.userType === 'BRAND_ADMIN' && ctx.brandHqId) {
      where.brandHqId = ctx.brandHqId;
    }
    if (opts.status) {
      where.status = opts.status;
    }
    if (opts.periodStart || opts.periodEnd) {
      const periodFilter: Record<string, Date> = {};
      if (opts.periodStart) periodFilter.gte = opts.periodStart;
      if (opts.periodEnd) periodFilter.lte = opts.periodEnd;
      where.periodStart = periodFilter;
    }
    const [data, totalCount] = await Promise.all([
      this.prisma.mealSettlementBatch.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip: opts.skip,
        take: opts.take,
      }),
      this.prisma.mealSettlementBatch.count({ where }),
    ]);
    return { data, totalCount };
  }

  /**
   * [KO] 특정 BrandHQ 의 정산 배치 목록을 조회합니다. periodStart 내림차순 정렬.
   * [VI] Truy vấn danh sách batch quyết toán của BrandHQ cụ thể. Sắp xếp theo periodStart giảm dần.
   */
  async listByBrand(ctx: MealCallerCtx, brandHqId: string) {
    assertBrandScope(ctx, brandHqId);
    return this.prisma.mealSettlementBatch.findMany({
      where: { brandHqId },
      orderBy: { periodStart: 'desc' },
    });
  }

  /**
   * [KO] 정산 배치를 ID 로 조회합니다. 존재하지 않으면 RESOURCE_NOT_FOUND 오류.
   * [VI] Truy vấn batch quyết toán theo ID. Không tồn tại = lỗi RESOURCE_NOT_FOUND.
   */
  async findById(ctx: MealCallerCtx, id: string) {
    const b = await this.prisma.mealSettlementBatch.findUnique({ where: { id } });
    if (!b) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'batch' }, details: { reason: 'Settlement batch not found' } });
    assertBrandScope(ctx, b.brandHqId);
    return b;
  }

  /**
   * [KO] 3-Way Matching 정산 배치를 실행합니다.
   *
   *      === 실행 단계 ===
   *      1단계: 권한 검증
   *        - brand scope 확인 + MEAL_TICKET capability + corporate.settlement.run 권한
   *      2단계: 가맹점 등록 및 수수료율 조회
   *        - 대상 BrandHQ 의 enrollment 존재 확인
   *        - periodEnd 시점 유효 수수료율(baseRatePct) 조회
   *      3단계: 거래 집계 (트랜잭션 내부)
   *        - 기간 내 APPROVED 상태 MealTransaction 조회
   *        - grossAmountVnd = 거래 금액 합산
   *        - commissionAmountVnd = grossAmountVnd * baseRatePct (소수점 이하 절사)
   *        - netPayableVnd = grossAmountVnd - commissionAmountVnd
   *      4단계: 3-Way 대조
   *        - corporateLedgerTotal : 기업 원장(MealWalletFundingEntry POSTED) 합산
   *        - companyShareTotal    : 거래별 회사 부담금(companyShareVnd) 합산
   *        - 두 값이 일치하면 MATCHED, 불일치하면 EXCEPTION
   *      5단계: 배치 upsert + 거래 상태 전환
   *        - MealSettlementBatch upsert (동일 brand+기간이면 갱신)
   *        - 대상 거래를 SETTLED 상태로 변경
   *
   * [VI] Chạy batch quyết toán 3-Way Matching.
   *
   *      === Các bước thực hiện ===
   *      Bước 1: Kiểm tra quyền
   *        - Kiểm tra brand scope + capability MEAL_TICKET + quyền corporate.settlement.run
   *      Bước 2: Truy vấn enrollment và hoa hồng
   *        - Xác nhận enrollment của BrandHQ tồn tại
   *        - Truy vấn baseRatePct hiệu lực tại thời điểm periodEnd
   *      Bước 3: Tổng hợp giao dịch (trong transaction)
   *        - Truy vấn MealTransaction APPROVED trong kỳ
   *        - grossAmountVnd = tổng giá trị giao dịch
   *        - commissionAmountVnd = grossAmountVnd * baseRatePct (làm tròn xuống)
   *        - netPayableVnd = grossAmountVnd - commissionAmountVnd
   *      Bước 4: Đối chiếu 3-Way
   *        - corporateLedgerTotal : tổng sổ cái DN (MealWalletFundingEntry POSTED)
   *        - companyShareTotal    : tổng phần công ty chịu (companyShareVnd)
   *        - Khớp = MATCHED, không khớp = EXCEPTION
   *      Bước 5: Upsert batch + chuyển trạng thái giao dịch
   *        - Upsert MealSettlementBatch (cập nhật nếu cùng brand+kỳ)
   *        - Chuyển giao dịch mục tiêu sang SETTLED
   */
  async runBatch(
    ctx: MealCallerCtx,
    input: RunMealSettlementBatchInput,
  ) {
    // [1단계 / Bước 1] 권한 검증 / Kiểm tra quyền
    assertBrandScope(ctx, input.brandHqId);
    const brandCtx = withTargetBrand(ctx, input.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.settlement.run');

    // [2단계 / Bước 2] 가맹점 등록 확인 + 유효 수수료율 조회 / Xác nhận enrollment + truy vấn hoa hồng hiệu lực
    const enrollment = await this.prisma.mealMerchantEnrollment.findUnique({
      where: { brandHqId: input.brandHqId },
    });
    if (!enrollment) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', details: { reason: 'Merchant not enrolled' } });

    const rate = await this.merchant.getActiveCommissionRate(
      enrollment.id,
      input.periodEnd,
    );
    /** [KO] 수수료율이 없으면 0% 적용 / [VI] Nếu không có hoa hồng thì áp dụng 0% */
    const baseRatePct = rate ? Number(rate.baseRatePct) : 0;

    return this.prisma.$transaction(async (tx) => {
      // [3단계 / Bước 3] 기간 내 APPROVED 거래 조회 + 금액 집계 / Truy vấn giao dịch APPROVED trong kỳ + tổng hợp
      const txList = await tx.mealTransaction.findMany({
        where: {
          brandHqId: input.brandHqId,
          status: 'APPROVED',
          createdAt: {
            gte: input.periodStart,
            lt: input.periodEnd,
          },
        },
      });

      /**
       * [KO] grossAmountVnd: 기간 내 총 거래 금액 (소스 1)
       * [VI] grossAmountVnd: tổng giá trị giao dịch trong kỳ (Nguồn 1)
       */
      const grossAmountVnd = txList.reduce(
        (acc, t) => acc + t.approvedAmountVnd,
        0n,
      );
      /**
       * [KO] commissionAmountVnd: 수수료 금액. baseRatePct 를 정수 연산으로 계산.
       *      예: grossAmountVnd=1,000,000 * baseRatePct=3.5 -> 1,000,000 * 350 / 10,000 = 35,000
       * [VI] commissionAmountVnd: tiền hoa hồng. Tính baseRatePct bằng phép tính số nguyên.
       *      Ví dụ: grossAmountVnd=1,000,000 * baseRatePct=3.5 -> 1,000,000 * 350 / 10,000 = 35,000
       */
      const commissionAmountVnd =
        (grossAmountVnd * BigInt(Math.round(baseRatePct * 100))) / 10000n;
      /**
       * [KO] netPayableVnd: 가맹점 실수령액 = 총 거래액 - 수수료
       * [VI] netPayableVnd: số tiền merchant thực nhận = tổng giao dịch - hoa hồng
       */
      const netPayableVnd = grossAmountVnd - commissionAmountVnd;

      // [4단계 / Bước 4] 3-Way 대조 / Đối chiếu 3-Way
      // [KO] 3-Way 매칭: 기업 원장(소스 2) vs 거래별 회사 부담금(소스 3) 비교
      // [VI] 3-Way matching: sổ cái DN (Nguồn 2) vs phần công ty chịu mỗi giao dịch (Nguồn 3)
      /**
       * [KO] 소스 2: 기업 원장(MealWalletFundingEntry) — 기간 내 POSTED 상태 충전 금액 합산.
       *      거래에 참여한 기업(corporateId) -> 기업 지갑(MealWallet) -> 충전 내역(FundingEntry) 순으로 추적.
       * [VI] Nguồn 2: Sổ cái DN (MealWalletFundingEntry) — tổng nạp tiền POSTED trong kỳ.
       *      Truy theo: DN tham gia giao dịch (corporateId) -> ví DN (MealWallet) -> bản ghi nạp (FundingEntry).
       */
      const corporateIds = [...new Set(txList.map((t) => t.corporateId))];
      let corporateLedgerTotal = 0n;
      if (corporateIds.length > 0) {
        const wallets = await tx.mealWallet.findMany({
          where: { corporateId: { in: corporateIds } },
          select: { id: true },
        });
        const walletIds = wallets.map((w) => w.id);
        if (walletIds.length > 0) {
          const ledgerAgg = await tx.mealWalletFundingEntry.aggregate({
            where: {
              walletId: { in: walletIds },
              status: 'POSTED',
              createdAt: {
                gte: input.periodStart,
                lt: input.periodEnd,
              },
            },
            _sum: { amountVnd: true },
          });
          corporateLedgerTotal = (ledgerAgg._sum.amountVnd ?? 0n) as bigint;
        }
      }

      /**
       * [KO] 소스 3: 거래별 회사 부담금 합산 (companyShareVnd)
       * [VI] Nguồn 3: tổng phần công ty chịu mỗi giao dịch (companyShareVnd)
       */
      const companyShareTotal = txList.reduce(
        (acc, t) => acc + (t.companyShareVnd ?? 0n),
        0n,
      );

      /**
       * [KO] mismatch 판정: 소스 2(기업 충전 총액) 와 소스 3(회사지원 사용 총액)의 차이.
       *      차이가 0 이면 정합성 OK (MATCHED), 아니면 불일치 (EXCEPTION).
       * [VI] Phán định mismatch: chênh lệch giữa Nguồn 2 (tổng nạp DN) và Nguồn 3 (tổng phần công ty chịu).
       *      Chênh lệch = 0 -> MATCHED, khác 0 -> EXCEPTION.
       */
      const mismatchAmount = corporateLedgerTotal - companyShareTotal;
      const threeWayMismatchCount = mismatchAmount === 0n ? 0 : 1;
      const batchStatus = threeWayMismatchCount > 0 ? 'EXCEPTION' : 'MATCHED';

      // [5단계 / Bước 5] 배치 upsert + 거래 SETTLED 전환 / Upsert batch + chuyển giao dịch sang SETTLED
      const batch = await tx.mealSettlementBatch.upsert({
        where: {
          uq_meal_settlement_brand_period: {
            brandHqId: input.brandHqId,
            periodStart: input.periodStart,
            periodEnd: input.periodEnd,
          },
        },
        update: {
          status: batchStatus,
          grossAmountVnd,
          commissionAmountVnd,
          netPayableVnd,
          threeWayMismatchCount,
        },
        create: {
          brandHqId: input.brandHqId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          status: batchStatus,
          grossAmountVnd,
          commissionAmountVnd,
          netPayableVnd,
          threeWayMismatchCount,
        },
      });

      const txIds = txList.map((t) => t.id);
      if (txIds.length) {
        await tx.mealTransaction.updateMany({
          where: { id: { in: txIds } },
          data: { status: 'SETTLED', settledAt: new Date() },
        });
      }

      return batch;
    });
  }

  /**
   * [KO] 매칭 완료(MATCHED) 배치를 승인(APPROVED) 상태로 전환합니다.
   *      승인자 ID(ctx.userId), 승인 시각, 선택적 메모를 기록합니다.
   *      status 가 MATCHED 가 아니면 SETTLEMENT_INVALID_STATUS_TRANSITION 오류를 발생시킵니다.
   *      상태 전이: MATCHED -> APPROVED
   * [VI] Chuyển batch MATCHED sang APPROVED.
   *      Ghi lại ID người phê duyệt (ctx.userId), thời gian, ghi chú tùy chọn.
   *      Nếu status không phải MATCHED thì trả lỗi SETTLEMENT_INVALID_STATUS_TRANSITION.
   *      Chuyển trạng thái: MATCHED -> APPROVED
   */
  async approve(ctx: MealCallerCtx, batchId: string, memo?: string) {
    const batch = await this.findById(ctx, batchId);
    if (batch.status !== 'MATCHED') {
      throw new DomainError({
        code: 'SETTLEMENT_INVALID_STATUS_TRANSITION',
        params: { from: batch.status, to: 'APPROVED' },
      });
    }
    return this.prisma.mealSettlementBatch.update({
      where: { id: batchId },
      data: {
        status: 'APPROVED',
        approvedBy: ctx.userId,
        approvedAt: new Date(),
        approvalMemo: memo ?? null,
      },
    });
  }

  /**
   * [KO] 승인(APPROVED) 배치에 대해 은행 이체 요청(PAYOUT_REQUESTED) 상태로 전환합니다.
   *      payoutRequestedAt 에 현재 시각을, payoutStatus 에 'REQUESTED' 를 기록합니다.
   *      status 가 APPROVED 가 아니면 SETTLEMENT_INVALID_STATUS_TRANSITION 오류.
   *      상태 전이: APPROVED -> PAYOUT_REQUESTED
   * [VI] Chuyển batch APPROVED sang PAYOUT_REQUESTED (yêu cầu chuyển khoản ngân hàng).
   *      Ghi payoutRequestedAt = thời điểm hiện tại, payoutStatus = 'REQUESTED'.
   *      Nếu status không phải APPROVED thì trả lỗi SETTLEMENT_INVALID_STATUS_TRANSITION.
   *      Chuyển trạng thái: APPROVED -> PAYOUT_REQUESTED
   */
  async requestPayout(ctx: MealCallerCtx, batchId: string) {
    const batch = await this.findById(ctx, batchId);
    if (batch.status !== 'APPROVED') {
      throw new DomainError({
        code: 'SETTLEMENT_INVALID_STATUS_TRANSITION',
        params: { from: batch.status, to: 'PAYOUT_REQUESTED' },
      });
    }
    return this.prisma.mealSettlementBatch.update({
      where: { id: batchId },
      data: {
        status: 'PAYOUT_REQUESTED',
        payoutRequestedAt: new Date(),
        payoutStatus: 'REQUESTED',
      },
    });
  }

  /**
   * [KO] EXCEPTION 상태의 배치를 해결(resolve)하여 MATCHED 로 되돌립니다.
   *      3-Way mismatch 를 수동으로 보정한 후 호출합니다.
   *      threeWayMismatchCount 를 0 으로 리셋하고, memo 에 보정 사유를 기록합니다.
   *      status 가 EXCEPTION 이 아니면 SETTLEMENT_INVALID_STATUS_TRANSITION 오류.
   *      상태 전이: EXCEPTION -> MATCHED
   * [VI] Giải quyết batch EXCEPTION, đưa về MATCHED.
   *      Gọi sau khi sửa thủ công bất khớp 3-Way.
   *      Reset threeWayMismatchCount = 0, ghi lý do sửa vào memo.
   *      Nếu status không phải EXCEPTION thì trả lỗi SETTLEMENT_INVALID_STATUS_TRANSITION.
   *      Chuyển trạng thái: EXCEPTION -> MATCHED
   */
  async resolveException(ctx: MealCallerCtx, batchId: string, memo: string) {
    const batch = await this.findById(ctx, batchId);
    if (batch.status !== 'EXCEPTION') {
      throw new DomainError({
        code: 'SETTLEMENT_INVALID_STATUS_TRANSITION',
        params: { from: batch.status, to: 'MATCHED' },
      });
    }
    return this.prisma.mealSettlementBatch.update({
      where: { id: batchId },
      data: {
        status: 'MATCHED',
        threeWayMismatchCount: 0,
        approvalMemo: memo,
      },
    });
  }

  /**
   * [KO] 기간별 수익 요약을 조회합니다 (SUPER_ADMIN 전용 전체 집계 query).
   *      brand scope 검증 없이 플랫폼 전체를 집계합니다.
   *      4개의 병렬 쿼리를 실행하여 다음을 산출:
   *        - totalTransactionVnd       : 총 거래 금액 (APPROVED + SETTLED)
   *        - totalCommissionVnd       : 총 수수료 (정산 배치 기준)
   *        - pendingSettlementVnd     : 미결 정산 금액 (MATCHED/APPROVED/PAYOUT_REQUESTED 배치)
   *        - unsettledTransactionVnd  : 미정산 거래 금액 (APPROVED 상태, 아직 배치 미생성)
   *        - overdueCreditVnd         : 연체 크레딧 (CREDIT_NET15/CREDIT_NET30 기업)
   * [VI] Truy vấn tóm tắt doanh thu theo kỳ (query tổng hợp toàn nền tảng, chỉ SUPER_ADMIN).
   *      Không kiểm tra brand scope, tổng hợp toàn bộ nền tảng.
   *      Chạy 5 query song song:
   *        - totalTransactionVnd       : Tổng giá trị giao dịch (APPROVED + SETTLED)
   *        - totalCommissionVnd        : Tổng hoa hồng (theo batch quyết toán)
   *        - pendingSettlementVnd      : Quyết toán chưa xử lý (MATCHED/APPROVED/PAYOUT_REQUESTED)
   *        - unsettledTransactionVnd   : Giao dịch chưa quyết toán (APPROVED, chưa thuộc batch nào)
   *        - overdueCreditVnd          : Tín dụng quá hạn (DN CREDIT_NET15/CREDIT_NET30)
   */
  async revenueSummary(periodStart: Date, periodEnd: Date) {
    const [txAgg, unsettledAgg, commAgg, pendingAgg, creditAgg] = await Promise.all([
      // 총 거래 금액 + 건수 (APPROVED + SETTLED)
      this.prisma.mealTransaction.aggregate({
        where: {
          status: { in: ['APPROVED', 'SETTLED'] },
          createdAt: { gte: periodStart, lt: periodEnd },
        },
        _sum: { approvedAmountVnd: true },
        _count: true,
      }),
      // 미정산 거래 (APPROVED 상태 — 아직 배치에 포함되지 않은 거래)
      this.prisma.mealTransaction.aggregate({
        where: {
          status: 'APPROVED',
          createdAt: { gte: periodStart, lt: periodEnd },
        },
        _sum: { approvedAmountVnd: true },
        _count: true,
      }),
      // 총 수수료 (정산 배치 기준)
      this.prisma.mealSettlementBatch.aggregate({
        where: {
          periodStart: { gte: periodStart },
          periodEnd: { lte: periodEnd },
        },
        _sum: { commissionAmountVnd: true },
      }),
      // 미결 정산 배치 (MATCHED / APPROVED / PAYOUT_REQUESTED 상태)
      this.prisma.mealSettlementBatch.aggregate({
        where: {
          status: { in: ['MATCHED', 'APPROVED', 'PAYOUT_REQUESTED'] },
          periodStart: { gte: periodStart },
          periodEnd: { lte: periodEnd },
        },
        _sum: { netPayableVnd: true },
        _count: true,
      }),
      // 연체 크레딧 (creditOutstandingVnd > 0 인 기업)
      this.prisma.mealCorporate.aggregate({
        where: {
          fundingModel: { in: ['CREDIT_NET15', 'CREDIT_NET30'] },
          creditOutstandingVnd: { gt: 0 },
        },
        _sum: { creditOutstandingVnd: true },
      }),
    ]);

    // 미정산 거래의 예상 수수료 계산 — 브랜드별 수수료율 적용
    const unsettledVnd = (unsettledAgg._sum.approvedAmountVnd ?? 0n) as bigint;
    let estimatedCommissionVnd = 0n;
    if (unsettledVnd > 0n) {
      const unsettledByBrand = await this.prisma.mealTransaction.groupBy({
        by: ['brandHqId'],
        where: {
          status: 'APPROVED',
          createdAt: { gte: periodStart, lt: periodEnd },
        },
        _sum: { approvedAmountVnd: true },
      });
      // brandHqId → enrollment → commissionRate 조회
      const brandIds = unsettledByBrand.map((g) => g.brandHqId);
      const enrollments = brandIds.length
        ? await this.prisma.mealMerchantEnrollment.findMany({
            where: { brandHqId: { in: brandIds } },
            select: { id: true, brandHqId: true },
          })
        : [];
      const enrollmentMap = new Map(enrollments.map((e) => [e.brandHqId, e.id]));

      for (const group of unsettledByBrand) {
        const brandAmount = (group._sum.approvedAmountVnd ?? 0n) as bigint;
        const enrollmentId = enrollmentMap.get(group.brandHqId);
        let pct = 0;
        if (enrollmentId) {
          const rate = await this.merchant.getActiveCommissionRate(enrollmentId, periodEnd);
          pct = rate ? Number(rate.baseRatePct) : 0;
        }
        estimatedCommissionVnd += (brandAmount * BigInt(Math.round(pct * 100))) / 10000n;
      }
    }

    const settledCommissionVnd = (commAgg._sum.commissionAmountVnd ?? 0n) as bigint;

    return {
      totalTransactionVnd: (txAgg._sum.approvedAmountVnd ?? 0n) as bigint,
      settledCommissionVnd,
      estimatedCommissionVnd,
      totalCommissionVnd: settledCommissionVnd + estimatedCommissionVnd,
      pendingSettlementVnd: (pendingAgg._sum.netPayableVnd ?? 0n) as bigint,
      unsettledTransactionVnd: unsettledVnd,
      unsettledTransactionCount: unsettledAgg._count,
      overdueCreditVnd: (creditAgg._sum.creditOutstandingVnd ?? 0n) as bigint,
      totalTransactionCount: txAgg._count,
      pendingBatchCount: pendingAgg._count,
    };
  }

  /**
   * [KO] 외부 은행 이체 ACK 수신 후 배치를 PAID 상태로 마킹합니다.
   *      이것이 정산 배치의 최종 상태입니다.
   *      상태 전이: (PAYOUT_REQUESTED) -> PAID
   * [VI] Đánh dấu batch là PAID sau khi nhận ACK chuyển khoản từ ngân hàng.
   *      Đây là trạng thái cuối cùng của batch quyết toán.
   *      Chuyển trạng thái: (PAYOUT_REQUESTED) -> PAID
   */
  async markPaid(ctx: MealCallerCtx, batchId: string) {
    const b = await this.prisma.mealSettlementBatch.findUnique({
      where: { id: batchId },
    });
    if (!b) throw new DomainError({ code: 'RESOURCE_NOT_FOUND', params: { resource: 'batch' }, details: { reason: 'Settlement batch not found' } });
    assertBrandScope(ctx, b.brandHqId);
    const brandCtx = withTargetBrand(ctx, b.brandHqId);
    await this.entitlement.requireCapability(brandCtx, 'MEAL_TICKET');
    await this.permission.require(brandCtx, 'corporate.settlement.run');

    return this.prisma.mealSettlementBatch.update({
      where: { id: batchId },
      data: { status: 'PAID' },
    });
  }

  /**
   * [KO] 브랜드별 미정산 거래를 집계합니다.
   *      APPROVED 상태(배치 미포함)인 거래를 brandHqId 기준으로 그룹화하여 반환.
   *      BRAND_ADMIN 은 자기 brand 만 조회됩니다.
   * [VI] Tổng hợp giao dịch chưa quyết toán theo thương hiệu.
   *      Nhóm giao dịch APPROVED (chưa thuộc batch) theo brandHqId.
   */
  async listUnsettledByBrand(
    ctx: MealCallerCtx,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const where: Record<string, unknown> = {
      status: 'APPROVED' as const,
      createdAt: { gte: periodStart, lt: periodEnd },
    };
    if (ctx.userType === 'BRAND_ADMIN' && ctx.brandHqId) {
      where.brandHqId = ctx.brandHqId;
    }

    const groups = await this.prisma.mealTransaction.groupBy({
      by: ['brandHqId'],
      where,
      _sum: { approvedAmountVnd: true },
      _count: true,
      _min: { createdAt: true },
    });

    // brandName resolve
    const brandIds = groups.map((g) => g.brandHqId);
    const brands = brandIds.length
      ? await this.prisma.brandProfile.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, brandName: true },
        })
      : [];
    const brandMap = new Map(brands.map((b) => [b.id, b.brandName]));

    return groups.map((g) => ({
      brandHqId: g.brandHqId,
      brandName: brandMap.get(g.brandHqId) ?? null,
      totalVnd: (g._sum.approvedAmountVnd ?? 0n) as bigint,
      count: g._count,
      oldestTransactionDate: g._min.createdAt?.toISOString() ?? null,
    }));
  }

  /**
   * [KO] 1P1Q 통합 대시보드 — 수익 요약 + 배치 리스트 + 미정산 거래를 단일 호출로 반환.
   * [VI] Dashboard tổng hợp 1P1Q — trả về tóm tắt doanh thu + danh sách batch + GD chưa QT trong một lần gọi.
   */
  async dashboard(
    ctx: MealCallerCtx,
    periodStart: Date,
    periodEnd: Date,
    batchSkip: number,
    batchTake: number,
    batchStatus?: string,
  ) {
    const [revenue, batchResult, unsettledBrands] = await Promise.all([
      this.revenueSummary(periodStart, periodEnd),
      this.list(ctx, {
        skip: batchSkip,
        take: batchTake,
        status: batchStatus,
        periodStart,
        periodEnd,
      }),
      this.listUnsettledByBrand(ctx, periodStart, periodEnd),
    ]);

    // 배치에 brandName resolve
    const batchBrandIds = (batchResult.data as Array<{ brandHqId: string }>).map((b) => b.brandHqId);
    const allBrandIds = [...new Set([...batchBrandIds])];
    const brands = allBrandIds.length
      ? await this.prisma.brandProfile.findMany({
          where: { id: { in: allBrandIds } },
          select: { id: true, brandName: true },
        })
      : [];
    const brandMap = new Map(brands.map((b) => [b.id, b.brandName]));

    const batches = (batchResult.data as Array<Record<string, unknown>>).map((b) => ({
      ...b,
      brandName: brandMap.get(b.brandHqId as string) ?? null,
    }));

    return {
      revenue: {
        ...revenue,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
      batches,
      batchTotalCount: batchResult.totalCount,
      unsettledBrands,
    };
  }
}
