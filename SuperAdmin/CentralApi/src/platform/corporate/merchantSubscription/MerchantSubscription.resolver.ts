/**
 * [KO] MealMerchantSubscription GraphQL 리졸버
 *      임직원의 가맹점 일일 메뉴 구독 관리를 위한 GraphQL Query/Mutation 엔드포인트.
 *      모든 핸들러는 JWT에서 추출한 MealCallerCtx를 서비스 계층에 전파합니다.
 *
 *      제공하는 엔드포인트:
 *        Query:
 *          - mealMerchantSubscriptions: 직원의 활성 구독 목록 조회
 *        Mutation:
 *          - mealMerchantSubscribe: 구독 생성/업데이트 (upsert)
 *          - mealMerchantUnsubscribe: 구독 비활성화
 *
 * [VI] GraphQL Resolver MealMerchantSubscription
 *      Endpoint GraphQL Query/Mutation cho quản lý đăng ký thực đơn hàng ngày.
 *      Mọi handler đều truyền MealCallerCtx (trích xuất từ JWT) xuống tầng service.
 *
 *      Endpoint cung cấp:
 *        Query:
 *          - mealMerchantSubscriptions: Danh sách đăng ký đang hoạt động
 *        Mutation:
 *          - mealMerchantSubscribe: Tạo/cập nhật đăng ký (upsert)
 *          - mealMerchantUnsubscribe: Vô hiệu hóa đăng ký
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';
import { MealMerchantSubscriptionService } from './MerchantSubscription.service';
import { MealMerchantSubscriptionModel } from './models/MealMerchantSubscription.model';
import { mealCtxFromUser } from '../_internal/callerCtx';

/**
 * [KO] GraphQL 응답 래퍼 타입 생성
 * [VI] Tạo wrapper kiểu phản hồi GraphQL
 */
const MealMerchantSubscriptionModel__ListResp = createListResponse(
  MealMerchantSubscriptionModel,
  'MealMerchantSubscriptionModelListResponse',
);
const MealMerchantSubscriptionModel__Resp = createObjectResponse(
  MealMerchantSubscriptionModel,
  'MealMerchantSubscriptionModelResponse',
);

@Resolver(() => MealMerchantSubscriptionModel)
export class MealMerchantSubscriptionResolver {
  constructor(private readonly service: MealMerchantSubscriptionService) {}

  /**
   * [KO] 직원의 활성 가맹점 구독 목록을 조회합니다. 권한: merchants:read
   * [VI] Truy vấn danh sách đăng ký đang hoạt động của nhân viên. Quyền: merchants:read
   */
  @RequirePermission('merchants:read')
  @Query(() => MealMerchantSubscriptionModel__ListResp, {
    name: 'mealMerchantSubscriptions',
  })
  listByEmployee(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByEmployee(mealCtxFromUser(user), employeeId);
  }

  /**
   * [KO] 가맹점 일일 메뉴 구독을 생성/업데이트합니다 (upsert). 권한: merchants:update
   * [VI] Tạo/cập nhật đăng ký thực đơn hàng ngày (upsert). Quyền: merchants:update
   */
  @RequirePermission('merchants:update')
  @Mutation(() => MealMerchantSubscriptionModel__Resp)
  mealMerchantSubscribe(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('notifyBreakfast', { type: () => Boolean, nullable: true }) notifyBreakfast: boolean | null,
    @Args('notifyLunch', { type: () => Boolean, nullable: true }) notifyLunch: boolean | null,
    @Args('notifyDinner', { type: () => Boolean, nullable: true }) notifyDinner: boolean | null,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.subscribe(mealCtxFromUser(user), {
      employeeId,
      branchId,
      notifyBreakfast: notifyBreakfast ?? undefined,
      notifyLunch: notifyLunch ?? undefined,
      notifyDinner: notifyDinner ?? undefined,
    });
  }

  /**
   * [KO] 가맹점 구독을 비활성화합니다 (isActive=false). 권한: merchants:update
   * [VI] Vô hiệu hóa đăng ký (isActive=false). Quyền: merchants:update
   */
  @RequirePermission('merchants:update')
  @Mutation(() => MealMerchantSubscriptionModel__Resp)
  mealMerchantUnsubscribe(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.unsubscribe(mealCtxFromUser(user), employeeId, branchId);
  }
}
