/**
 * [KO] MealWallet GraphQL Subscription 리졸버
 *      지갑 잔액 변경, RFID 결제 결과, 정책 변경을 실시간으로 클라이언트에 push합니다.
 *      Redis-backed PubSub bus(GraphqlSubscriptionBusService)를 사용하여
 *      다중 인스턴스 환경에서도 fan-out이 보장됩니다.
 *
 *      구독 토픽:
 *        - MEAL_WALLET_UPDATED: 지갑 잔액 변경 시 (fund/topup/debit 후)
 *        - MEAL_TRANSACTION_RESULT: RFID 결제 완료 시
 *        - MEAL_POLICY_CHANGED: 정책 생성/수정/삭제 시
 *
 * [VI] GraphQL Subscription Resolver cho MealWallet
 *      Push real-time tới client khi số dư ví thay đổi, thanh toán RFID hoàn thành,
 *      hoặc chính sách thay đổi.
 *      Sử dụng Redis-backed PubSub bus (GraphqlSubscriptionBusService)
 *      đảm bảo fan-out trên môi trường nhiều instance.
 *
 *      Topic đăng ký:
 *        - MEAL_WALLET_UPDATED: Khi số dư ví thay đổi (sau fund/topup/debit)
 *        - MEAL_TRANSACTION_RESULT: Khi thanh toán RFID hoàn thành
 *        - MEAL_POLICY_CHANGED: Khi chính sách được tạo/sửa/xóa
 */
import { Args, ID, Resolver, Subscription } from '@nestjs/graphql';
import { GraphqlSubscriptionBusService } from '@core/graphql/subscriptions/GraphqlSubscriptionBus.service';
import { MealWalletModel } from './models/MealWallet.model';
import { MealTransactionModel } from '../transaction/models/MealTransaction.model';
import { MealPolicyModel } from '../policy/models/MealPolicy.model';

/** [KO] PubSub 토픽 상수 / [VI] Hằng số topic PubSub */
export const MEAL_WALLET_UPDATED = 'MEAL_WALLET_UPDATED';
export const MEAL_TRANSACTION_RESULT = 'MEAL_TRANSACTION_RESULT';
export const MEAL_POLICY_CHANGED = 'MEAL_POLICY_CHANGED';

@Resolver()
export class MealWalletSubscriptionResolver {
  constructor(private readonly pubsub: GraphqlSubscriptionBusService) {}

  /**
   * [KO] 특정 지갑의 잔액 변경을 실시간으로 수신합니다.
   *      walletId로 필터링하여 해당 지갑의 변경만 전달합니다.
   *      fund, topUp, debit(결제) 후 publish됩니다.
   *      사용 시나리오: 직원 앱에서 잔액 실시간 갱신
   *
   * [VI] Nhận real-time thay đổi số dư của ví cụ thể.
   *      Lọc theo walletId, chỉ gửi thay đổi của ví đó.
   *      Được publish sau fund, topUp, debit (thanh toán).
   *      Tình huống sử dụng: cập nhật số dư real-time trên ứng dụng nhân viên
   */
  @Subscription(() => MealWalletModel, {
    name: 'mealWalletUpdated',
    filter: (
      payload: { mealWalletUpdated: MealWalletModel },
      variables: { walletId: string },
    ) => payload.mealWalletUpdated.id === variables.walletId,
  })
  mealWalletUpdated(
    @Args('walletId', { type: () => ID }) _walletId: string,
  ) {
    return this.pubsub.asyncIterator<MealWalletModel>(MEAL_WALLET_UPDATED);
  }

  /**
   * [KO] RFID 결제 완료 결과를 실시간으로 수신합니다.
   *      walletId로 필터링하여 해당 지갑의 결제 결과만 전달합니다.
   *      Closed Loop RFID 결제 프로세스 완료 후 publish됩니다.
   *      사용 시나리오: 직원 앱에서 결제 결과 실시간 표시
   *
   * [VI] Nhận real-time kết quả thanh toán RFID hoàn thành.
   *      Lọc theo walletId, chỉ gửi kết quả của ví đó.
   *      Được publish sau khi hoàn thành thanh toán Closed Loop RFID.
   *      Tình huống sử dụng: hiển thị kết quả thanh toán real-time trên ứng dụng nhân viên
   */
  @Subscription(() => MealTransactionModel, {
    name: 'mealTransactionResult',
    filter: (
      payload: { mealTransactionResult: MealTransactionModel },
      variables: { walletId: string },
    ) => payload.mealTransactionResult.walletId === variables.walletId,
  })
  mealTransactionResult(
    @Args('walletId', { type: () => ID }) _walletId: string,
  ) {
    return this.pubsub.asyncIterator<MealTransactionModel>(MEAL_TRANSACTION_RESULT);
  }

  /**
   * [KO] 특정 기업의 정책 변경을 실시간으로 수신합니다.
   *      corporateId로 필터링하여 해당 기업의 정책 변경만 전달합니다.
   *      정책 생성(create), 수정(update), 삭제(delete) 후 publish됩니다.
   *      사용 시나리오: 관리자 포털에서 정책 변경 실시간 반영, 직원 앱에서 적용 정책 갱신
   *
   * [VI] Nhận real-time thay đổi chính sách của doanh nghiệp cụ thể.
   *      Lọc theo corporateId, chỉ gửi thay đổi chính sách của doanh nghiệp đó.
   *      Được publish sau khi tạo (create), sửa (update), xóa (delete) chính sách.
   *      Tình huống sử dụng: cập nhật chính sách real-time trên portal quản trị và ứng dụng nhân viên
   */
  @Subscription(() => MealPolicyModel, {
    name: 'mealPolicyChanged',
    filter: (
      payload: { mealPolicyChanged: MealPolicyModel },
      variables: { corporateId: string },
    ) => payload.mealPolicyChanged.corporateId === variables.corporateId,
  })
  mealPolicyChanged(
    @Args('corporateId', { type: () => ID }) _corporateId: string,
  ) {
    return this.pubsub.asyncIterator<MealPolicyModel>(MEAL_POLICY_CHANGED);
  }
}
