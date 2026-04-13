/**
 * [KO] 식권 정산(Meal Settlement) GraphQL 리졸버
 *      정산 배치 조회, 수익 요약, 배치 실행, 승인, 지급 요청, 예외 해결, 지급 완료를 위한
 *      GraphQL Query/Mutation 엔드포인트를 정의합니다.
 *      모든 핸들러는 JWT 에서 추출한 MealCallerCtx 를 서비스 계층에 전파합니다.
 *
 *      제공하는 엔드포인트:
 *        Query:
 *          - mealSettlementBatchesByBrand : BrandHQ 별 정산 배치 목록 조회
 *          - mealSettlementBatch          : ID 로 정산 배치 단건 조회
 *          - revenueSummary               : 기간별 수익 요약 (SUPER_ADMIN 전용)
 *        Mutation:
 *          - mealSettlementRunBatch           : 3-Way Matching 정산 배치 실행
 *          - mealSettlementApprove            : 배치 승인 (MATCHED -> APPROVED)
 *          - mealSettlementRequestPayout      : 지급 요청 (APPROVED -> PAYOUT_REQUESTED)
 *          - mealSettlementResolveException   : 예외 해결 (EXCEPTION -> MATCHED)
 *          - mealSettlementMarkPaid           : 지급 완료 마킹 (-> PAID)
 *
 * [VI] GraphQL Resolver cho Meal Settlement (quyết toán phiếu ăn)
 *      Định nghĩa endpoint GraphQL Query/Mutation cho truy vấn batch, tóm tắt doanh thu,
 *      chạy batch, phê duyệt, yêu cầu thanh toán, giải quyết bất thường, đánh dấu đã trả.
 *      Tất cả handler đều truyền MealCallerCtx (từ JWT) xuống tầng service.
 *
 *      Endpoint cung cấp:
 *        Query:
 *          - mealSettlementBatchesByBrand : Danh sách batch theo BrandHQ
 *          - mealSettlementBatch          : Truy vấn batch đơn theo ID
 *          - revenueSummary               : Tóm tắt doanh thu theo kỳ (chỉ SUPER_ADMIN)
 *        Mutation:
 *          - mealSettlementRunBatch           : Chạy batch 3-Way Matching
 *          - mealSettlementApprove            : Phê duyệt batch (MATCHED -> APPROVED)
 *          - mealSettlementRequestPayout      : Yêu cầu thanh toán (APPROVED -> PAYOUT_REQUESTED)
 *          - mealSettlementResolveException   : Giải quyết bất thường (EXCEPTION -> MATCHED)
 *          - mealSettlementMarkPaid           : Đánh dấu đã trả (-> PAID)
 */
import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { PrismaService } from '@core/prisma/Prisma.service';
import { MealSettlementService } from './Settlement.service';
import { MealSettlementBatchModel } from './models/MealSettlementBatch.model';
import { RevenueSummaryModel, UnsettledBrandSummaryModel, SettlementDashboardModel } from './models/RevenueSummary.model';
import { RunMealSettlementBatchInput } from './dto/RunMealSettlementBatch.input';
import { mealCtxFromUser } from '../_internal/callerCtx';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

/**
 * [KO] GraphQL 응답 래퍼 타입 생성 — OperationResponse 표준에 따라 success/error 를 감싸는 타입.
 * [VI] Tạo wrapper kiểu phản hồi GraphQL — bọc success/error theo chuẩn OperationResponse.
 */
const MealSettlementBatchModel__ListResp = createListResponse(MealSettlementBatchModel, 'MealSettlementBatchModelListResponse');
const MealSettlementBatchModel__Resp = createObjectResponse(MealSettlementBatchModel, 'MealSettlementBatchModelResponse');
const RevenueSummaryModel__Resp = createObjectResponse(RevenueSummaryModel, 'RevenueSummaryModelResponse');
const UnsettledBrandSummaryModel__ListResp = createListResponse(UnsettledBrandSummaryModel, 'UnsettledBrandSummaryListResponse');
const SettlementDashboardModel__Resp = createObjectResponse(SettlementDashboardModel, 'SettlementDashboardResponse');

@Resolver(() => MealSettlementBatchModel)
export class MealSettlementResolver {
  constructor(
    private readonly service: MealSettlementService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * [KO] brandHqId → BrandProfile.brandName 를 resolve 합니다.
   *      DB 에 brandName 컬럼이 없으므로, 런타임에 BrandProfile 을 조회하여 채웁니다.
   * [VI] Resolve brandHqId → BrandProfile.brandName.
   *      Không có cột brandName trong DB, nên truy vấn BrandProfile tại runtime.
   */
  @ResolveField(() => String, { nullable: true })
  async brandName(@Parent() batch: MealSettlementBatchModel): Promise<string | null> {
    const brand = await this.prisma.brandProfile.findUnique({
      where: { id: batch.brandHqId },
      select: { brandName: true },
    });
    return brand?.brandName ?? null;
  }

  /**
   * [KO] 1P1Q 정산 대시보드 — 수익 요약 + 배치 리스트 + 미정산 거래를 단일 쿼리로 반환.
   *      Portal 정산 페이지에서 이 쿼리 하나만 호출합니다.
   */
  @RequirePermission('settlements:read')
  @Query(() => SettlementDashboardModel__Resp, { name: 'mealSettlementDashboard' })
  async dashboard(
    @CurrentUser() user: JwtPayload,
    @Args('periodStart', { type: () => String }) periodStart: string,
    @Args('periodEnd', { type: () => String }) periodEnd: string,
    @Args('batchSkip', { type: () => Int, nullable: true, defaultValue: 0 }) batchSkip: number,
    @Args('batchTake', { type: () => Int, nullable: true, defaultValue: 50 }) batchTake: number,
    @Args('batchStatus', { type: () => String, nullable: true }) batchStatus?: string,
  ) {
    return this.service.dashboard(
      mealCtxFromUser(user),
      new Date(periodStart),
      new Date(periodEnd),
      batchSkip,
      batchTake,
      batchStatus,
    );
  }

  /**
   * [KO] 전체 정산 배치 목록을 조회합니다 (페이지네이션 + 상태 필터).
   *      SUPER_ADMIN 은 전체 조회, BRAND_ADMIN 은 자기 brand 만 조회됩니다 (서비스 레이어에서 scope 강제).
   *      권한: settlements:read
   * [VI] Truy vấn danh sách tất cả batch quyết toán (phân trang + lọc trạng thái).
   *      SUPER_ADMIN xem tất cả, BRAND_ADMIN chỉ xem brand của mình (scope bắt buộc ở service).
   *      Quyền: settlements:read
   */
  @RequirePermission('settlements:read')
  @Query(() => MealSettlementBatchModel__ListResp, { name: 'mealSettlementBatches' })
  list(
    @CurrentUser() user: JwtPayload,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 50 }) take: number,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('periodStart', { type: () => String, nullable: true }) periodStart?: string,
    @Args('periodEnd', { type: () => String, nullable: true }) periodEnd?: string,
  ) {
    return this.service.list(mealCtxFromUser(user), {
      skip,
      take,
      status,
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined,
    });
  }

  /**
   * [KO] 브랜드별 미정산 거래 집계를 조회합니다 (APPROVED 상태, 배치 미생성). 권한: settlements:read
   * [VI] Truy vấn tổng hợp giao dịch chưa quyết toán theo thương hiệu (APPROVED, chưa batch). Quyền: settlements:read
   */
  @RequirePermission('settlements:read')
  @Query(() => UnsettledBrandSummaryModel__ListResp, { name: 'mealUnsettledByBrand' })
  async listUnsettledByBrand(
    @CurrentUser() user: JwtPayload,
    @Args('periodStart', { type: () => String }) periodStart: string,
    @Args('periodEnd', { type: () => String }) periodEnd: string,
  ) {
    const data = await this.service.listUnsettledByBrand(
      mealCtxFromUser(user),
      new Date(periodStart),
      new Date(periodEnd),
    );
    return { data, totalCount: data.length };
  }

  /**
   * [KO] BrandHQ 별 정산 배치 목록을 조회합니다. 권한: settlements:read
   * [VI] Truy vấn danh sách batch quyết toán theo BrandHQ. Quyền: settlements:read
   */
  @RequirePermission('settlements:read')
  @Query(() => MealSettlementBatchModel__ListResp, { name: 'mealSettlementBatchesByBrand' })
  listByBrand(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByBrand(mealCtxFromUser(user), brandHqId);
  }

  /**
   * [KO] ID 로 정산 배치 단건을 조회합니다. 권한: settlements:read
   * [VI] Truy vấn batch quyết toán đơn theo ID. Quyền: settlements:read
   */
  @RequirePermission('settlements:read')
  @Query(() => MealSettlementBatchModel__Resp, { name: 'mealSettlementBatch' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 기간별 수익 요약을 조회합니다 (SUPER_ADMIN 전용). 권한: settlements:read
   *      periodStart/periodEnd 를 ISO 문자열로 받아 Date 로 변환 후 서비스에 전달합니다.
   * [VI] Truy vấn tóm tắt doanh thu theo kỳ (chỉ SUPER_ADMIN). Quyền: settlements:read
   *      Nhận periodStart/periodEnd dạng chuỗi ISO, chuyển sang Date rồi truyền cho service.
   */
  @RequirePermission('settlements:read')
  @Query(() => RevenueSummaryModel__Resp, { name: 'revenueSummary' })
  async revenueSummary(
    @Args('periodStart', { type: () => String }) periodStart: string,
    @Args('periodEnd', { type: () => String }) periodEnd: string,
  ) {
    const result = await this.service.revenueSummary(
      new Date(periodStart),
      new Date(periodEnd),
    );
    return {
      ...result,
      periodStart,
      periodEnd,
    };
  }

  /**
   * [KO] 3-Way Matching 정산 배치를 실행합니다. 권한: settlements:run
   * [VI] Chạy batch quyết toán 3-Way Matching. Quyền: settlements:run
   */
  @RequirePermission('settlements:run')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementRunBatch(
    @Args('input') input: RunMealSettlementBatchInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.runBatch(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 정산 배치를 승인합니다 (MATCHED -> APPROVED). 권한: settlements:approve
   * [VI] Phê duyệt batch quyết toán (MATCHED -> APPROVED). Quyền: settlements:approve
   */
  @RequirePermission('settlements:approve')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementApprove(
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args('memo', { type: () => String, nullable: true }) memo: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.approve(mealCtxFromUser(user), batchId, memo);
  }

  /**
   * [KO] 은행 이체 지급을 요청합니다 (APPROVED -> PAYOUT_REQUESTED). 권한: settlements:run
   * [VI] Yêu cầu chuyển khoản ngân hàng (APPROVED -> PAYOUT_REQUESTED). Quyền: settlements:run
   */
  @RequirePermission('settlements:run')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementRequestPayout(
    @Args('batchId', { type: () => ID }) batchId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.requestPayout(mealCtxFromUser(user), batchId);
  }

  /**
   * [KO] 3-Way 불일치 예외를 해결합니다 (EXCEPTION -> MATCHED). 권한: settlements:run
   * [VI] Giải quyết bất thường 3-Way (EXCEPTION -> MATCHED). Quyền: settlements:run
   */
  @RequirePermission('settlements:run')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementResolveException(
    @Args('batchId', { type: () => ID }) batchId: string,
    @Args('memo', { type: () => String }) memo: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.resolveException(mealCtxFromUser(user), batchId, memo);
  }

  /**
   * [KO] 은행 이체 완료 후 배치를 PAID 로 마킹합니다 (최종 상태). 권한: settlements:run
   * [VI] Đánh dấu batch là PAID sau khi chuyển khoản hoàn tất (trạng thái cuối). Quyền: settlements:run
   */
  @RequirePermission('settlements:run')
  @Mutation(() => MealSettlementBatchModel__Resp)
  mealSettlementMarkPaid(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.markPaid(mealCtxFromUser(user), id);
  }
}
