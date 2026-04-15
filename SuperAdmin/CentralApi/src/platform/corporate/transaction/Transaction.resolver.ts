/**
 * [KO] MealTransaction GraphQL 리졸버
 *
 * 식권 거래(MealTransaction) 도메인의 GraphQL 진입점이다.
 * 모든 핸들러는 JWT에서 추출한 사용자 정보(JwtPayload)를 MealCallerCtx로 변환하여
 * 서비스 레이어에 전달한다. 이를 통해 멀티테넌시 scope가 자동 적용된다.
 *
 * ── 제공하는 GraphQL operation ──
 * Query:
 *   - mealTransaction(id): 단건 거래 조회
 *   - mealTransactionsByCorporate(corporateId, skip, take): 기업별 거래 목록
 *   - mealTransactionsByBrand(brandHqId, skip, take): 브랜드별 거래 목록
 * Mutation:
 *   - mealTransactionAuthorize(input): 결제 승인 (POS/앱에서 호출)
 *   - mealTransactionReverse(id): 결제 취소/환불
 *
 * ── 권한 체계 ──
 * - 모든 operation에 @RequirePermission('transactions:read') 데코레이터가 적용되어 있다.
 *   이는 Guard 레벨의 1차 검증이며, 실제 세부 권한(authorize, reverse)은
 *   서비스 레이어에서 추가로 검증한다.
 *
 * [VI] GraphQL Resolver cho MealTransaction
 *
 * Là điểm vào GraphQL của domain giao dịch phiếu ăn (MealTransaction).
 * Mọi handler chuyển JwtPayload thành MealCallerCtx rồi truyền xuống service,
 * đảm bảo scope multi-tenancy được áp dụng tự động.
 *
 * ── Các GraphQL operation ──
 * Query:
 *   - mealTransaction(id): truy vấn một giao dịch
 *   - mealTransactionsByCorporate(corporateId, skip, take): danh sách theo corporate
 *   - mealTransactionsByBrand(brandHqId, skip, take): danh sách theo brand
 * Mutation:
 *   - mealTransactionAuthorize(input): phê duyệt thanh toán (POS/ứng dụng gọi)
 *   - mealTransactionReverse(id): hủy/hoàn thanh toán
 *
 * ── Hệ thống quyền ──
 * - Mọi operation có @RequirePermission('transactions:read') ở cấp Guard.
 *   Quyền chi tiết (authorize, reverse) được kiểm tra thêm trong service.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { MealTransactionService } from './Transaction.service';
import { MealTransactionModel } from './models/MealTransaction.model';
import { AuthorizeMealTransactionInput } from './dto/AuthorizeMealTransaction.input';
import { mealCtxFromUser } from '../_internal/callerCtx';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

/**
 * [KO] 거래 목록 응답 래퍼 — { data: MealTransactionModel[], totalCount: number }
 * [VI] Wrapper phản hồi danh sách giao dịch — { data: MealTransactionModel[], totalCount: number }
 */
const MealTransactionModel__ListResp = createListResponse(MealTransactionModel, 'MealTransactionModelListResponse');

/**
 * [KO] 단건 거래 응답 래퍼 — { data: MealTransactionModel }
 * [VI] Wrapper phản hồi một giao dịch — { data: MealTransactionModel }
 */
const MealTransactionModel__Resp = createObjectResponse(MealTransactionModel, 'MealTransactionModelResponse');

@Resolver(() => MealTransactionModel)
export class MealTransactionResolver {
  constructor(private readonly service: MealTransactionService) {}

  /**
   * [KO] 단건 거래 조회 Query.
   *      CORPORATE_ADMIN은 자기 corporate 거래만, BRAND_ADMIN은 자기 brand 거래만,
   *      SUPER_ADMIN은 모든 거래를 조회할 수 있다 (scope 검증은 서비스 레이어에서 수행).
   * [VI] Query truy vấn một giao dịch.
   *      CORPORATE_ADMIN chỉ xem giao dịch corporate mình, BRAND_ADMIN chỉ xem brand mình,
   *      SUPER_ADMIN xem được tất cả (xác minh scope thực hiện trong service).
   */
  @RequirePermission('transactions:read')
  @Query(() => MealTransactionModel__Resp, { name: 'mealTransaction' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 기업(Corporate) 기준 거래 목록 조회 Query.
   *      PaginationArgs(skip, take)로 페이지네이션한다.
   *      assertCorporateScope가 서비스에서 적용된다.
   * [VI] Query danh sách giao dịch theo Corporate.
   *      Phân trang bằng PaginationArgs (skip, take).
   *      assertCorporateScope được áp dụng trong service.
   */
  @RequirePermission('transactions:read')
  @Query(() => MealTransactionModel__ListResp, { name: 'mealTransactionsByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args() pagination: PaginationArgs,
    @Args('dateFrom', { type: () => String, nullable: true }) dateFrom: string | null,
    @Args('dateTo', { type: () => String, nullable: true }) dateTo: string | null,
    @Args('merchantId', { type: () => String, nullable: true }) merchantId: string | null,
    @Args('employeeId', { type: () => String, nullable: true }) employeeId: string | null,
    @Args('statuses', { type: () => [String], nullable: true }) statuses: string[] | null,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(
      mealCtxFromUser(user),
      corporateId,
      pagination.skip,
      pagination.take,
      { dateFrom, dateTo, merchantId, employeeId, statuses },
    );
  }

  /**
   * [KO] 브랜드(BrandHQ) 기준 거래 목록 조회 Query.
   *      PaginationArgs(skip, take)로 페이지네이션한다.
   *      assertBrandScope가 서비스에서 적용된다.
   * [VI] Query danh sách giao dịch theo BrandHQ.
   *      Phân trang bằng PaginationArgs (skip, take).
   *      assertBrandScope được áp dụng trong service.
   */
  @RequirePermission('transactions:read')
  @Query(() => MealTransactionModel__ListResp, { name: 'mealTransactionsByBrand' })
  listByBrand(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('periodStart', { type: () => String, nullable: true }) periodStart?: string,
    @Args('periodEnd', { type: () => String, nullable: true }) periodEnd?: string,
  ) {
    return this.service.listByBrand(
      mealCtxFromUser(user),
      brandHqId,
      pagination.skip,
      pagination.take,
      {
        status,
        periodStart: periodStart ? new Date(periodStart) : undefined,
        periodEnd: periodEnd ? new Date(periodEnd) : undefined,
      },
    );
  }

  /**
   * [KO] 결제 승인 Mutation.
   *      POS 단말 또는 모바일 앱이 직원 식권 결제를 요청할 때 호출한다.
   *      내부적으로 authorize() 서비스 메서드를 호출하여 7단계 승인 프로세스를 수행한다.
   *      결과는 APPROVED(승인됨) 또는 DECLINED(거절됨) 상태의 MealTransaction이다.
   * [VI] Mutation phê duyệt thanh toán.
   *      POS hoặc ứng dụng gọi khi nhân viên yêu cầu thanh toán phiếu ăn.
   *      Gọi authorize() trong service để thực hiện quy trình 7 bước.
   *      Kết quả là MealTransaction ở trạng thái APPROVED hoặc DECLINED.
   */
  @RequirePermission('transactions:read')
  @Mutation(() => MealTransactionModel__Resp)
  mealTransactionAuthorize(
    @Args('input') input: AuthorizeMealTransactionInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.authorize(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 결제 취소/환불 Mutation.
   *      이미 승인(APPROVED)된 거래를 취소하고 차감된 잔액을 복원한다.
   *      DECLINED/SETTLED/REVERSED 상태의 거래는 취소할 수 없다.
   * [VI] Mutation hủy/hoàn thanh toán.
   *      Hủy giao dịch đã duyệt (APPROVED) và khôi phục số dư đã trừ.
   *      Không thể hủy giao dịch ở trạng thái DECLINED/SETTLED/REVERSED.
   */
  @RequirePermission('transactions:read')
  @Mutation(() => MealTransactionModel__Resp)
  mealTransactionReverse(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.reverse(mealCtxFromUser(user), id);
  }
}
