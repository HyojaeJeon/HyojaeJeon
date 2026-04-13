/**
 * [KO] MealWallet GraphQL 리졸버
 *      클라이언트(Portal)에서 들어오는 GraphQL Query/Mutation을 받아 서비스로 위임합니다.
 *      모든 경로에서 @CurrentUser() 데코레이터로 JWT payload를 추출하고,
 *      mealCtxFromUser()로 MealCallerCtx를 생성하여 서비스에 전달합니다.
 *      이를 통해 서비스가 corporate scope를 강제할 수 있습니다.
 *
 *      각 엔드포인트에는 @RequirePermission() 데코레이터로 RBAC 권한이 적용되어 있습니다.
 *      권한이 없는 사용자의 요청은 서비스 호출 전에 거부됩니다.
 *
 * [VI] GraphQL Resolver MealWallet
 *      Nhận GraphQL Query/Mutation từ client (Portal) và ủy thác cho service.
 *      Mọi đường đều dùng decorator @CurrentUser() để trích xuất JWT payload,
 *      và tạo MealCallerCtx bằng mealCtxFromUser() để truyền cho service.
 *      Nhờ đó service có thể bắt buộc kiểm tra corporate scope.
 *
 *      Mỗi endpoint được áp dụng quyền RBAC qua decorator @RequirePermission().
 *      Yêu cầu từ người dùng không có quyền sẽ bị từ chối trước khi gọi service.
 */
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import {
  CurrentUser,
  JwtPayload,
} from '@core/auth/decorators/CurrentUser.decorator';
import { RequirePermission } from '@core/rbac/decorators/RequirePermission.decorator';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';
import { MealWalletService } from './Wallet.service';
import { MealWalletModel } from './models/MealWallet.model';
import { MealWalletFundingEntryModel } from './models/MealWalletFundingEntry.model';
import { MealFundingAccountModel } from './models/MealFundingAccount.model';
import { CreateMealWalletInput } from './dto/CreateMealWallet.input';
import { FundMealWalletInput } from './dto/FundMealWallet.input';
import { TopUpMealWalletInput } from './dto/TopUpMealWallet.input';
import { mealCtxFromUser } from '../_internal/callerCtx';
import { createListResponse, createObjectResponse } from '@core/response/OperationResponse.factory';

/**
 * [KO] GraphQL 응답 래퍼 타입 정의
 *      createListResponse: 목록 조회 응답 (data + totalCount + success/error)
 *      createObjectResponse: 단건 조회/변경 응답 (data + success/error)
 * [VI] Định nghĩa kiểu wrapper phản hồi GraphQL
 *      createListResponse: phản hồi danh sách (data + totalCount + success/error)
 *      createObjectResponse: phản hồi đơn lẻ/thay đổi (data + success/error)
 */
const MealWalletModel__ListResp = createListResponse(MealWalletModel, 'MealWalletModelListResponse');
const MealWalletModel__Resp = createObjectResponse(MealWalletModel, 'MealWalletModelResponse');
const MealWalletFundingEntryModel__ListResp = createListResponse(MealWalletFundingEntryModel, 'MealWalletFundingEntryModelListResponse');
const MealFundingAccountModel__Resp = createObjectResponse(MealFundingAccountModel, 'MealFundingAccountModelResponse');

@Resolver(() => MealWalletModel)
export class MealWalletResolver {
  constructor(private readonly service: MealWalletService) {}

  /**
   * [KO] 지갑 단건 조회 Query — wallets:read 권한 필요
   * [VI] Query truy vấn ví đơn lẻ — cần quyền wallets:read
   */
  @RequirePermission('wallets:read')
  @Query(() => MealWalletModel__Resp, { name: 'mealWallet', nullable: true })
  findById(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findById(mealCtxFromUser(user), id);
  }

  /**
   * [KO] 법인별 지갑 목록 조회 Query — wallets:read 권한 필요, 페이지네이션 지원
   * [VI] Query danh sách ví theo pháp nhân — cần quyền wallets:read, hỗ trợ phân trang
   */
  @RequirePermission('wallets:read')
  @Query(() => MealWalletModel__ListResp, { name: 'mealWalletsByCorporate' })
  listByCorporate(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listByCorporate(
      mealCtxFromUser(user),
      corporateId,
      pagination.skip,
      pagination.take,
    );
  }

  /**
   * [KO] 지갑 생성 Mutation — wallets:update 권한 필요
   *      input으로 employeeId와 dailyLimitVnd를 받습니다.
   * [VI] Mutation tạo ví — cần quyền wallets:update
   *      Nhận employeeId và dailyLimitVnd qua input.
   */
  @RequirePermission('wallets:update')
  @Mutation(() => MealWalletModel__Resp)
  mealWalletCreate(
    @Args('input') input: CreateMealWalletInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 회사 지원금 적립 Mutation — wallets:fund 권한 필요
   *      Funding Account에서 직원 지갑의 companyAllowanceVnd 버킷으로 지원금을 이동합니다.
   * [VI] Mutation cấp trợ cấp công ty — cần quyền wallets:fund
   *      Chuyển trợ cấp từ Funding Account vào bucket companyAllowanceVnd của ví nhân viên.
   */
  @RequirePermission('wallets:fund')
  @Mutation(() => MealWalletModel__Resp)
  mealWalletFund(
    @Args('input') input: FundMealWalletInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.fund(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 개인 충전 Mutation — wallets:topup 권한 필요
   *      직원이 PG 결제 후 personalTopUpVnd 버킷에 충전합니다.
   * [VI] Mutation nạp cá nhân — cần quyền wallets:topup
   *      Nhân viên nạp vào bucket personalTopUpVnd sau khi thanh toán PG.
   */
  @RequirePermission('wallets:topup')
  @Mutation(() => MealWalletModel__Resp)
  mealWalletTopUp(
    @Args('input') input: TopUpMealWalletInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.topUp(mealCtxFromUser(user), input);
  }

  /**
   * [KO] 법인 입금 확인 Mutation — corp_wallets:fund 권한 필요
   *      은행 이체 확인 후 FundingAccount 잔액을 증액합니다.
   * [VI] Mutation xác nhận nạp tiền pháp nhân — cần quyền corp_wallets:fund
   *      Tăng số dư FundingAccount sau khi xác nhận chuyển khoản ngân hàng.
   */
  @RequirePermission('corp_wallets:fund')
  @Mutation(() => MealFundingAccountModel__Resp)
  mealDepositConfirm(
    @Args('corporateId', { type: () => ID }) corporateId: string,
    @Args('amountVnd', { type: () => GraphQLBigInt }) amountVnd: bigint,
    @Args('referenceNo') referenceNo: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.confirmDeposit(
      mealCtxFromUser(user),
      corporateId,
      amountVnd,
      referenceNo,
    );
  }

  /**
   * [KO] 지갑별 FundingEntry 목록 조회 Query — wallets:read 권한 필요, 페이지네이션 지원
   *      특정 지갑의 입금/충전 이력을 원장 형태로 조회합니다.
   * [VI] Query danh sách FundingEntry theo ví — cần quyền wallets:read, hỗ trợ phân trang
   *      Truy vấn lịch sử nạp/trợ cấp của ví cụ thể dưới dạng sổ cái.
   */
  @RequirePermission('wallets:read')
  @Query(() => MealWalletFundingEntryModel__ListResp, { name: 'mealWalletFundingEntriesByWallet' })
  listFundingEntriesByWallet(
    @Args('walletId', { type: () => ID }) walletId: string,
    @Args() pagination: PaginationArgs,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.listFundingEntriesByWallet(
      mealCtxFromUser(user),
      walletId,
      pagination.skip,
      pagination.take,
    );
  }
}
