/**
 * [KO] MealOrder GraphQL 리졸버
 *
 * VMeal 식권 플랫폼의 앱 기반 식사 주문 도메인의 GraphQL 진입점이다.
 * 모든 핸들러는 JWT에서 추출한 사용자 정보(JwtPayload)를 MealCallerCtx로 변환하여
 * 서비스 레이어에 전달한다. 이를 통해 멀티테넌시 scope가 자동 적용된다.
 *
 * ── 제공하는 GraphQL operation ──
 * Query:
 *   - mealOrder(id): 단건 주문 조회 (항목 포함)
 *   - mealOrdersByWallet(walletId, skip, take): 지갑별 주문 목록
 *   - mealOrdersByBranch(branchId, skip, take): 지점별 주문 목록
 * Mutation:
 *   - mealOrderCreate(input): 앱 기반 식사 주문 생성 (10단계 프로세스)
 *   - mealOrderCancel(id, reason): 주문 취소 + 잔액 환불
 *   - mealOrderAccept(id): 가맹점 수락
 *   - mealOrderReject(id, reason): 가맹점 거절 + 잔액 환불
 *   - mealOrderUpdateStatus(id, status): 상태 전이
 *   - mealOrderCheckin(id): QR 테이블 체크인
 *
 * ── 권한 체계 ──
 * - Query: @RequirePermission('corp_orders:read')
 * - Mutation: @RequirePermission('corp_orders:update')
 *   세부 권한(create, authorize 등)은 서비스 레이어에서 추가 검증한다.
 *
 * [VI] GraphQL Resolver cho MealOrder
 *
 * Là điểm vào GraphQL của domain đặt hàng bữa ăn qua ứng dụng VMeal.
 * Mọi handler chuyển JwtPayload thành MealCallerCtx rồi truyền xuống service,
 * đảm bảo scope multi-tenancy được áp dụng tự động.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { MealOrderService } from './Order.service';
import { MealOrderModel } from './models/MealOrder.model';
import { CreateMealOrderInput } from './dto/CreateMealOrder.input';
import { MealOrderFilterArgs } from './dto/MealOrderFilter.args';
import { mealCtxFromUser } from '../_internal/callerCtx';
import {
  BooleanResponse,
  createListResponse,
  createObjectResponse,
} from '@core/response/OperationResponse.factory';

/**
 * [KO] 주문 목록 응답 래퍼 — { data: MealOrderModel[], totalCount: number }
 * [VI] Wrapper phản hồi danh sách đơn hàng — { data: MealOrderModel[], totalCount: number }
 */
const MealOrderListResponse = createListResponse(MealOrderModel, 'MealOrderListResponse');

/**
 * [KO] 단건 주문 응답 래퍼 — { data: MealOrderModel }
 * [VI] Wrapper phản hồi một đơn hàng — { data: MealOrderModel }
 */
const MealOrderResponse = createObjectResponse(MealOrderModel, 'MealOrderResponse');

@Resolver(() => MealOrderModel)
export class MealOrderResolver {
  constructor(private readonly service: MealOrderService) {}

  // ══════════════════════════════════════════════════════
  // Queries
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 단건 주문 조회 — 주문 항목(items) 포함.
   * [VI] Truy vấn một đơn hàng — bao gồm mục đơn hàng (items).
   */
  @RequirePermission('corp_orders:read')
  @Query(() => MealOrderResponse, { name: 'mealOrder' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 지갑별 주문 목록 조회 — 직원 앱에서 자기 주문 내역 확인용.
   * [VI] Danh sách đơn hàng theo ví — để nhân viên xem lịch sử đơn hàng.
   */
  @RequirePermission('corp_orders:read')
  @Query(() => MealOrderListResponse, { name: 'mealOrdersByWallet' })
  listByWallet(
    @Args('walletId', { type: () => ID }) walletId: string,
    @Args() filter: MealOrderFilterArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByWallet(
      mealCtxFromUser(user),
      walletId,
      filter.skip,
      filter.take,
      filter.status,
    );
  }

  /**
   * [KO] 지점별 주문 목록 조회 — POS/가맹점 측 주문 관리용.
   * [VI] Danh sách đơn hàng theo chi nhánh — để POS/cửa hàng quản lý đơn hàng.
   */
  @RequirePermission('corp_orders:read')
  @Query(() => MealOrderListResponse, { name: 'mealOrdersByBranch' })
  listByBranch(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args() filter: MealOrderFilterArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByBranch(
      mealCtxFromUser(user),
      branchId,
      filter.skip,
      filter.take,
      filter.status,
    );
  }

  // ══════════════════════════════════════════════════════
  // Mutations
  // ══════════════════════════════════════════════════════

  /**
   * [KO] 앱 기반 식사 주문 생성 — 10단계 핵심 Mutation.
   *      GPS 사기 방지, 정책 평가, split payment, 주문+트랜잭션 동시 생성.
   * [VI] Tạo đơn hàng bữa ăn qua ứng dụng — Mutation cốt lõi 10 bước.
   *      Chống gian lận GPS, đánh giá chính sách, split payment, tạo đơn+giao dịch đồng thời.
   */
  @RequirePermission('corp_orders:update')
  @Mutation(() => MealOrderResponse)
  mealOrderCreate(
    @Args('input') input: CreateMealOrderInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 주문 취소 — 취소 정책 평가 후 잔액 환불.
   * [VI] Hủy đơn hàng — đánh giá chính sách hủy rồi hoàn tiền.
   */
  @RequirePermission('corp_orders:update')
  @Mutation(() => MealOrderResponse)
  mealOrderCancel(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { type: () => String, nullable: true }) reason: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.cancel(mealCtxFromUser(user), id, reason);
  }

  /**
   * [KO] 가맹점 주문 수락 (PAID_PENDING_ACCEPT → ACCEPTED).
   * [VI] Cửa hàng chấp nhận đơn hàng (PAID_PENDING_ACCEPT → ACCEPTED).
   */
  @RequirePermission('corp_orders:update')
  @Mutation(() => MealOrderResponse)
  mealOrderAccept(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.accept(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 가맹점 주문 거절 → 잔액 환불.
   * [VI] Cửa hàng từ chối đơn hàng → hoàn tiền.
   */
  @RequirePermission('corp_orders:update')
  @Mutation(() => MealOrderResponse)
  mealOrderReject(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { type: () => String, nullable: true }) reason: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.reject(mealCtxFromUser(user), id, reason);
  }

  /**
   * [KO] 주문 상태 전이 — ACCEPTED→PREPARING→READY→COMPLETED.
   * [VI] Chuyển trạng thái đơn hàng — ACCEPTED→PREPARING→READY→COMPLETED.
   */
  @RequirePermission('corp_orders:update')
  @Mutation(() => MealOrderResponse)
  mealOrderUpdateStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => String }) status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateStatus(mealCtxFromUser(user), id, status);
  }

  /**
   * [KO] QR 테이블 체크인 — checkedInAt 시각 기록.
   * [VI] Check-in bàn QR — ghi thời điểm checkedInAt.
   */
  @RequirePermission('corp_orders:update')
  @Mutation(() => MealOrderResponse)
  mealOrderCheckin(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.checkin(mealCtxFromUser(user), id);
  }
}
