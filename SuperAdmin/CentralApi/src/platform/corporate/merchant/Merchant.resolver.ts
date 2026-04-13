/**
 * [KO] 식권 가맹점(Meal Merchant) GraphQL 리졸버
 *      식권 가맹점 등록, 활성화/비활성화, 수수료율 설정, 정산 계좌 설정을 위한
 *      GraphQL Query/Mutation 엔드포인트를 정의합니다.
 *      모든 핸들러는 JWT 에서 추출한 MealCallerCtx 를 서비스 계층에 전파하여
 *      brand scope + capability + RBAC 검증을 수행합니다.
 *
 *      제공하는 엔드포인트:
 *        Query:
 *          - mealMerchantEnrollment   : 특정 BrandHQ 의 가맹점 등록 정보 조회
 *          - mealMerchantEnrollments  : 전체 가맹점 등록 목록 (페이지네이션)
 *        Mutation:
 *          - mealMerchantEnroll               : 가맹점 등록
 *          - mealMerchantActivate             : 가맹점 활성화
 *          - mealMerchantDeactivate           : 가맹점 비활성화
 *          - mealMerchantSetCommission        : 수수료율 설정
 *          - mealMerchantSetSettlementAccount : 정산 계좌 설정
 *
 * [VI] GraphQL Resolver cho Meal Merchant (merchant phiếu ăn)
 *      Định nghĩa các endpoint GraphQL Query/Mutation cho đăng ký merchant,
 *      kích hoạt/vô hiệu hóa, cài đặt hoa hồng, cài đặt tài khoản quyết toán.
 *      Tất cả handler đều truyền MealCallerCtx (trích xuất từ JWT) xuống tầng service
 *      để kiểm tra brand scope + capability + RBAC.
 *
 *      Endpoint cung cấp:
 *        Query:
 *          - mealMerchantEnrollment   : Truy vấn enrollment của BrandHQ cụ thể
 *          - mealMerchantEnrollments  : Danh sách enrollment toàn bộ (phân trang)
 *        Mutation:
 *          - mealMerchantEnroll               : Đăng ký merchant
 *          - mealMerchantActivate             : Kích hoạt merchant
 *          - mealMerchantDeactivate           : Vô hiệu hóa merchant
 *          - mealMerchantSetCommission        : Cài đặt hoa hồng
 *          - mealMerchantSetSettlementAccount : Cài đặt tài khoản quyết toán
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { MealMerchantService } from './Merchant.service';
import { MealMerchantCommissionRateModel } from './models/MealMerchantCommissionRate.model';
import { MealMerchantEnrollmentModel } from './models/MealMerchantEnrollment.model';
import { MealMerchantSettlementAccountModel } from './models/MealMerchantSettlementAccount.model';
import { EnrollMealMerchantInput } from './dto/EnrollMealMerchant.input';
import { SetMealMerchantCommissionInput } from './dto/SetMealMerchantCommission.input';
import { SetMealMerchantSettlementAccountInput } from './dto/SetMealMerchantSettlementAccount.input';
import { mealCtxFromUser } from '../_internal/callerCtx';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

/**
 * [KO] GraphQL 응답 래퍼 타입 생성 — OperationResponse 표준에 따라 success/error 를 감싸는 타입.
 * [VI] Tạo wrapper kiểu phản hồi GraphQL — bọc success/error theo chuẩn OperationResponse.
 */
const MealMerchantCommissionRateModel__Resp = createObjectResponse(MealMerchantCommissionRateModel, 'MealMerchantCommissionRateModelResponse');
const MealMerchantEnrollmentModel__ListResp = createListResponse(MealMerchantEnrollmentModel, 'MealMerchantEnrollmentModelListResponse');
const MealMerchantEnrollmentModel__Resp = createObjectResponse(MealMerchantEnrollmentModel, 'MealMerchantEnrollmentModelResponse');
const MealMerchantSettlementAccountModel__Resp = createObjectResponse(MealMerchantSettlementAccountModel, 'MealMerchantSettlementAccountModelResponse');

@Resolver(() => MealMerchantEnrollmentModel)
export class MealMerchantResolver {
  constructor(private readonly service: MealMerchantService) {}

  /**
   * [KO] 특정 BrandHQ 의 가맹점 등록 정보를 조회합니다. 권한: merchants:read
   * [VI] Truy vấn enrollment của BrandHQ cụ thể. Quyền: merchants:read
   */
  @RequirePermission('merchants:read')
  @Query(() => MealMerchantEnrollmentModel__Resp, {
    name: 'mealMerchantEnrollment',
    nullable: true,
  })
  findByBrand(
    @Args('brandHqId', { type: () => ID }) brandHqId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findEnrollmentByBrand(mealCtxFromUser(user), brandHqId);
  }

  /**
   * [KO] 전체 가맹점 등록 목록을 페이지네이션으로 조회합니다. 권한: merchants:read
   * [VI] Truy vấn danh sách enrollment phân trang. Quyền: merchants:read
   */
  @RequirePermission('merchants:read')
  @Query(() => MealMerchantEnrollmentModel__ListResp, { name: 'mealMerchantEnrollments' })
  list(@Args() pagination: PaginationArgs, @CurrentUser() user: JwtPayload) {
    return this.service.listEnrollments(
      mealCtxFromUser(user),
      pagination.skip,
      pagination.take,
    );
  }

  /**
   * [KO] BrandHQ 를 식권 가맹점으로 등록합니다. 권한: merchants:create
   * [VI] Đăng ký BrandHQ làm merchant phiếu ăn. Quyền: merchants:create
   */
  @RequirePermission('merchants:create')
  @Mutation(() => MealMerchantEnrollmentModel__Resp)
  mealMerchantEnroll(
    @Args('input') input: EnrollMealMerchantInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.enroll(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 가맹점을 활성화합니다 (isActive -> true). 권한: merchants:update
   * [VI] Kích hoạt merchant (isActive -> true). Quyền: merchants:update
   */
  @RequirePermission('merchants:update')
  @Mutation(() => MealMerchantEnrollmentModel__Resp)
  mealMerchantActivate(
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.activate(mealCtxFromUser(user), enrollmentId);
  }

  /**
   * [KO] 가맹점을 비활성화합니다 (isActive -> false). 권한: merchants:update
   * [VI] Vô hiệu hóa merchant (isActive -> false). Quyền: merchants:update
   */
  @RequirePermission('merchants:update')
  @Mutation(() => MealMerchantEnrollmentModel__Resp)
  mealMerchantDeactivate(
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.deactivate(mealCtxFromUser(user), enrollmentId);
  }

  /**
   * [KO] 가맹점 수수료율을 설정합니다 (새 레코드 생성). 권한: merchants:update
   * [VI] Cài đặt hoa hồng merchant (tạo bản ghi mới). Quyền: merchants:update
   */
  @RequirePermission('merchants:update')
  @Mutation(() => MealMerchantCommissionRateModel__Resp)
  mealMerchantSetCommission(
    @Args('input') input: SetMealMerchantCommissionInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.setCommissionRate(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 가맹점 정산 계좌를 설정합니다 (기존 primary 해제 + 새 primary 생성). 권한: merchants:update
   * [VI] Cài đặt tài khoản quyết toán merchant (hủy primary cũ + tạo primary mới). Quyền: merchants:update
   */
  @RequirePermission('merchants:update')
  @Mutation(() => MealMerchantSettlementAccountModel__Resp)
  mealMerchantSetSettlementAccount(
    @Args('input') input: SetMealMerchantSettlementAccountInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.setSettlementAccount(mealCtxFromUser(user), input);
  }
}
