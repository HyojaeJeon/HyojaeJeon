/**
 * [KO] 일일 메뉴 및 사전 주문 GraphQL 리졸버
 *
 * 클라이언트(Portal/App)가 GraphQL을 통해 일일 메뉴 조회/생성,
 * 사전 주문 생성/취소/확인/완료를 수행할 수 있는 진입점(entry point)이다.
 * 모든 핸들러는 JWT에서 추출한 사용자 정보(JwtPayload)를 MealCallerCtx로
 * 변환하여 서비스 계층에 전달한다.
 *
 * RBAC 권한:
 * - 일일 메뉴 조회: corp_daily_menus:read
 * - 일일 메뉴 생성: corp_daily_menus:create
 * - 사전 주문 조회: corp_preorders:read
 * - 사전 주문 생성: corp_preorders:create
 * - 사전 주문 상태 변경: corp_preorders:update
 *
 * [VI] GraphQL resolver thuc don hang ngay va dat hang truoc
 *
 * Diem vao (entry point) de client (Portal/App) truy van/tao thuc don hang ngay,
 * tao/huy/xac nhan/hoan tat don dat truoc qua GraphQL.
 * Tat ca handler chuyen doi JwtPayload tu JWT thanh MealCallerCtx truyen cho tang service.
 *
 * Quyen RBAC:
 * - Truy van thuc don: corp_daily_menus:read
 * - Tao thuc don: corp_daily_menus:create
 * - Truy van dat truoc: corp_preorders:read
 * - Tao dat truoc: corp_preorders:create
 * - Thay doi trang thai: corp_preorders:update
 */
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { MealDailyMenuService } from './DailyMenu.service';
import { MealDailyMenuModel } from './models/MealDailyMenu.model';
import { MealPreOrderModel } from './models/MealPreOrder.model';
import { CreateMealDailyMenuInput } from './dto/CreateMealDailyMenu.input';
import { CreateMealPreOrderInput } from './dto/CreateMealPreOrder.input';
import { MealDailyMenuFilterArgs } from './dto/MealDailyMenuFilter.args';
import { mealCtxFromUser } from '../_internal/callerCtx';
import {
  createListResponse,
  createObjectResponse,
} from '@core/response/OperationResponse.factory';

/* ────────────── Response 타입 정의 ────────────── */

const MealDailyMenuModel__ListResp = createListResponse(
  MealDailyMenuModel,
  'MealDailyMenuModelListResponse',
);
const MealDailyMenuModel__Resp = createObjectResponse(
  MealDailyMenuModel,
  'MealDailyMenuModelResponse',
);
const MealPreOrderModel__ListResp = createListResponse(
  MealPreOrderModel,
  'MealPreOrderModelListResponse',
);
const MealPreOrderModel__Resp = createObjectResponse(
  MealPreOrderModel,
  'MealPreOrderModelResponse',
);

@Resolver()
export class MealDailyMenuResolver {
  constructor(private readonly service: MealDailyMenuService) {}

  /* ────────────── Daily Menu Queries ────────────── */

  /**
   * [KO] 지점별 일일 메뉴 목록 조회
   *      GraphQL: query mealDailyMenus($branchId: ID!, $date: DateTime, $mealType: String)
   *
   * [VI] Truy van danh sach thuc don hang ngay theo chi nhanh
   */
  @RequirePermission('corp_daily_menus:read')
  @Query(() => MealDailyMenuModel__ListResp, { name: 'mealDailyMenus' })
  listDailyMenus(@Args() args: MealDailyMenuFilterArgs) {
    return this.service.listDailyMenus(args.branchId, args.date, args.mealType);
  }

  /**
   * [KO] 일일 메뉴 단건 조회
   *      GraphQL: query mealDailyMenu($id: ID!)
   *
   * [VI] Truy van mot thuc don hang ngay
   */
  @RequirePermission('corp_daily_menus:read')
  @Query(() => MealDailyMenuModel__Resp, { name: 'mealDailyMenu' })
  findDailyMenuById(@Args('id', { type: () => ID }) id: string) {
    return this.service.findDailyMenuById(id);
  }

  /**
   * [KO] 직원이 구독한 가맹점의 일일 메뉴 조회
   *      GraphQL: query mealDailyMenusForSubscribed($employeeId: ID!, $date: DateTime)
   *
   * [VI] Truy van thuc don hang ngay cua cac cua hang nhan vien da dang ky
   */
  @RequirePermission('corp_daily_menus:read')
  @Query(() => MealDailyMenuModel__ListResp, { name: 'mealDailyMenusForSubscribed' })
  listDailyMenusForSubscribed(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('date', { nullable: true }) date?: Date,
  ) {
    return this.service.listDailyMenusForSubscribed(employeeId, date);
  }

  /**
   * [KO] 지갑별 사전 주문 목록 조회 (페이지네이션)
   *      GraphQL: query mealPreOrdersByWallet($walletId: ID!, $skip: Int, $take: Int)
   *
   * [VI] Truy van danh sach don dat truoc theo vi (phan trang)
   */
  @RequirePermission('corp_preorders:read')
  @Query(() => MealPreOrderModel__ListResp, { name: 'mealPreOrdersByWallet' })
  async listPreOrdersByWallet(
    @Args('walletId', { type: () => ID }) walletId: string,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 20 }) take: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const { data, totalCount } = await this.service.listPreOrdersByWallet(
      mealCtxFromUser(user),
      walletId,
      skip,
      take,
    );
    return { data, totalCount };
  }

  /* ────────────── Daily Menu Mutations ────────────── */

  /**
   * [KO] 일일 메뉴 생성 (항목 포함)
   *      GraphQL: mutation mealDailyMenuCreate($input: CreateMealDailyMenuInput!)
   *
   * [VI] Tao thuc don hang ngay (bao gom cac muc)
   */
  @RequirePermission('corp_daily_menus:create')
  @Mutation(() => MealDailyMenuModel__Resp)
  mealDailyMenuCreate(@Args('input') input: CreateMealDailyMenuInput) {
    return this.service.createDailyMenu(input);
  }

  /* ────────────── Pre-Order Mutations ────────────── */

  /**
   * [KO] 사전 주문 생성
   *      GraphQL: mutation mealPreOrderCreate($input: CreateMealPreOrderInput!)
   *
   * [VI] Tao don dat truoc
   */
  @RequirePermission('corp_preorders:create')
  @Mutation(() => MealPreOrderModel__Resp)
  mealPreOrderCreate(
    @Args('input') input: CreateMealPreOrderInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createPreOrder(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 사전 주문 취소 (PENDING → CANCELLED + 환불)
   *      GraphQL: mutation mealPreOrderCancel($id: ID!)
   *
   * [VI] Huy don dat truoc (PENDING → CANCELLED + hoan tien)
   */
  @RequirePermission('corp_preorders:update')
  @Mutation(() => MealPreOrderModel__Resp)
  mealPreOrderCancel(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.cancelPreOrder(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 사전 주문 확인 (PENDING → CONFIRMED)
   *      GraphQL: mutation mealPreOrderConfirm($id: ID!)
   *
   * [VI] Xac nhan don dat truoc (PENDING → CONFIRMED)
   */
  @RequirePermission('corp_preorders:update')
  @Mutation(() => MealPreOrderModel__Resp)
  mealPreOrderConfirm(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.confirmPreOrder(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 사전 주문 완료 (CONFIRMED → COMPLETED)
   *      GraphQL: mutation mealPreOrderComplete($id: ID!)
   *
   * [VI] Hoan tat don dat truoc (CONFIRMED → COMPLETED)
   */
  @RequirePermission('corp_preorders:update')
  @Mutation(() => MealPreOrderModel__Resp)
  mealPreOrderComplete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.completePreOrder(mealCtxFromUser(user), id);
  }
}
