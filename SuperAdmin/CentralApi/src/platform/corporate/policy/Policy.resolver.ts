/**
 * [KO] 식권 정책(MealPolicy) GraphQL 리졸버
 *
 * 클라이언트(Portal)가 GraphQL을 통해 식권 정책을 조회/생성/수정/상태변경/삭제할 수 있는
 * 진입점(entry point)입니다. 모든 핸들러는 JWT에서 추출한 사용자 정보(JwtPayload)를
 * MealCallerCtx로 변환하여 서비스 계층에 전달합니다.
 *
 * RBAC 권한:
 * - 조회: corp_policies:read
 * - 생성/수정/상태변경/삭제: corp_policies:update
 *
 * 응답 래핑:
 * - 목록 조회: MealPolicyModel__ListResp (createListResponse로 생성)
 * - 단건 조회/변경: MealPolicyModel__Resp (createObjectResponse로 생성)
 * - 삭제: BooleanResponse
 *
 * [VI] GraphQL resolver chinh sach phieu an (MealPolicy)
 *
 * Diem vao (entry point) de client (Portal) truy van/tao/cap nhat/thay doi trang thai/xoa
 * chinh sach phieu an qua GraphQL. Tat ca handler chuyen doi thong tin nguoi dung (JwtPayload)
 * tu JWT thanh MealCallerCtx va truyen cho tang service.
 *
 * Quyen RBAC:
 * - Truy van: corp_policies:read
 * - Tao/cap nhat/thay doi trang thai/xoa: corp_policies:update
 *
 * Boc phan hoi:
 * - Danh sach: MealPolicyModel__ListResp (tao boi createListResponse)
 * - Don le/thay doi: MealPolicyModel__Resp (tao boi createObjectResponse)
 * - Xoa: BooleanResponse
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { MealPolicyService } from './Policy.service';
import { MealPolicyModel } from './models/MealPolicy.model';
import { CreateMealPolicyInput } from './dto/CreateMealPolicy.input';
import { UpdateMealPolicyInput } from './dto/UpdateMealPolicy.input';
import { mealCtxFromUser } from '../_internal/callerCtx';
import { BooleanResponse, createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

/**
 * [KO] 정책 목록 응답 타입 - MealPolicyModel[] 을 표준 응답 형식으로 래핑
 * [VI] Kieu phan hoi danh sach - boc MealPolicyModel[] thanh dinh dang phan hoi chuan
 */
const MealPolicyModel__ListResp = createListResponse(MealPolicyModel, 'MealPolicyModelListResponse');

/**
 * [KO] 정책 단건 응답 타입 - MealPolicyModel 을 표준 응답 형식으로 래핑
 * [VI] Kieu phan hoi don le - boc MealPolicyModel thanh dinh dang phan hoi chuan
 */
const MealPolicyModel__Resp = createObjectResponse(MealPolicyModel, 'MealPolicyModelResponse');

/**
 * [KO] MealPolicy GraphQL 리졸버 클래스
 *      @Resolver 데코레이터로 MealPolicyModel에 대한 리졸버임을 선언
 *
 * [VI] Lop GraphQL resolver MealPolicy
 *      Decorator @Resolver khai bao day la resolver cho MealPolicyModel
 */
@Resolver(() => MealPolicyModel)
export class MealPolicyResolver {
  constructor(private readonly service: MealPolicyService) {}

  /**
   * [KO] 기업별 정책 목록 조회 쿼리
   *      GraphQL: query mealPoliciesByCorporate($corporateId: ID!)
   *      권한: corp_policies:read
   *
   * [VI] Query danh sach chinh sach theo doanh nghiep
   *      GraphQL: query mealPoliciesByCorporate($corporateId: ID!)
   *      Quyen: corp_policies:read
   */
  @RequirePermission('corp_policies:read')
  @Query(() => MealPolicyModel__ListResp, { name: 'mealPoliciesByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(mealCtxFromUser(user), corporateId);
  }

  /**
   * [KO] 정책 단건 조회 쿼리
   *      GraphQL: query mealPolicy($id: ID!)
   *      권한: corp_policies:read
   *
   * [VI] Query mot chinh sach theo ID
   *      GraphQL: query mealPolicy($id: ID!)
   *      Quyen: corp_policies:read
   */
  @RequirePermission('corp_policies:read')
  @Query(() => MealPolicyModel__Resp, { name: 'mealPolicy' })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 정책 생성 뮤테이션
   *      GraphQL: mutation mealPolicyCreate($input: CreateMealPolicyInput!)
   *      권한: corp_policies:update
   *      새 정책은 항상 DRAFT 상태로 생성됩니다.
   *
   * [VI] Mutation tao chinh sach
   *      GraphQL: mutation mealPolicyCreate($input: CreateMealPolicyInput!)
   *      Quyen: corp_policies:update
   *      Chinh sach moi luon duoc tao voi trang thai DRAFT.
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => MealPolicyModel__Resp)
  mealPolicyCreate(
    @Args('input') input: CreateMealPolicyInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 정책 수정 뮤테이션 (PATCH 방식 - 전달된 필드만 변경)
   *      GraphQL: mutation mealPolicyUpdate($id: ID!, $input: UpdateMealPolicyInput!)
   *      권한: corp_policies:update
   *
   * [VI] Mutation cap nhat chinh sach (kieu PATCH - chi thay doi truong duoc gui)
   *      GraphQL: mutation mealPolicyUpdate($id: ID!, $input: UpdateMealPolicyInput!)
   *      Quyen: corp_policies:update
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => MealPolicyModel__Resp)
  mealPolicyUpdate(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMealPolicyInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(mealCtxFromUser(user), id, input);
  }

  /**
   * [KO] 정책 발행 뮤테이션 (DRAFT/PAUSED → ACTIVE)
   *      GraphQL: mutation mealPolicyPublish($id: ID!)
   *      권한: corp_policies:update
   *
   * [VI] Mutation phat hanh chinh sach (DRAFT/PAUSED → ACTIVE)
   *      GraphQL: mutation mealPolicyPublish($id: ID!)
   *      Quyen: corp_policies:update
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => MealPolicyModel__Resp)
  mealPolicyPublish(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.publish(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 정책 일시 중지 뮤테이션 (ACTIVE → PAUSED)
   *      GraphQL: mutation mealPolicyPause($id: ID!)
   *      권한: corp_policies:update
   *
   * [VI] Mutation tam dung chinh sach (ACTIVE → PAUSED)
   *      GraphQL: mutation mealPolicyPause($id: ID!)
   *      Quyen: corp_policies:update
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => MealPolicyModel__Resp)
  mealPolicyPause(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.pause(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 정책 비활성화 뮤테이션 (→ EXPIRED, 복구 불가)
   *      GraphQL: mutation mealPolicyDeactivate($id: ID!)
   *      권한: corp_policies:update
   *
   * [VI] Mutation vo hieu hoa chinh sach (→ EXPIRED, khong the phuc hoi)
   *      GraphQL: mutation mealPolicyDeactivate($id: ID!)
   *      Quyen: corp_policies:update
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => MealPolicyModel__Resp)
  mealPolicyDeactivate(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.deactivate(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 정책 소프트 삭제 뮤테이션 (deletedAt 설정, 목록에서 제외)
   *      GraphQL: mutation mealPolicyDelete($id: ID!)
   *      권한: corp_policies:update
   *      반환: BooleanResponse (성공 시 true)
   *
   * [VI] Mutation xoa mem chinh sach (dat deletedAt, loai khoi danh sach)
   *      GraphQL: mutation mealPolicyDelete($id: ID!)
   *      Quyen: corp_policies:update
   *      Tra ve: BooleanResponse (true khi thanh cong)
   */
  @RequirePermission('corp_policies:update')
  @Mutation(() => BooleanResponse)
  mealPolicyDelete(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.softDelete(mealCtxFromUser(user), id);
  }
}
