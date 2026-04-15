/**
 * [KO] MealOrder GraphQL Subscription 리졸버
 *      주문 상태 변경 및 신규 주문 수신을 실시간으로 클라이언트에 push합니다.
 *      Redis-backed PubSub bus(GraphqlSubscriptionBusService)를 사용하여
 *      다중 인스턴스 환경에서도 fan-out이 보장됩니다.
 *
 *      구독 토픽:
 *        - MEAL_ORDER_STATUS_CHANGED: 주문 상태가 변경될 때 (orderId 필터)
 *        - MEAL_ORDER_RECEIVED: 새 주문이 가맹점에 도착할 때 (branchId 필터)
 *
 *      publish 시점:
 *        - Order.service.ts에서 주문 상태 전이 후 publish 호출
 *
 * [VI] GraphQL Subscription Resolver cho MealOrder
 *      Push real-time tới client khi trạng thái đơn hàng thay đổi hoặc có đơn hàng mới.
 *      Sử dụng Redis-backed PubSub bus (GraphqlSubscriptionBusService)
 *      đảm bảo fan-out trên môi trường nhiều instance.
 *
 *      Topic đăng ký:
 *        - MEAL_ORDER_STATUS_CHANGED: Khi trạng thái đơn hàng thay đổi (lọc theo orderId)
 *        - MEAL_ORDER_RECEIVED: Khi đơn hàng mới đến cửa hàng (lọc theo branchId)
 *
 *      Thời điểm publish:
 *        - Gọi publish trong Order.service.ts sau khi chuyển trạng thái đơn hàng
 */
import { Args, ID, Resolver, Subscription } from '@nestjs/graphql';
import { GraphqlSubscriptionBusService } from '@core/graphql/subscriptions/GraphqlSubscriptionBus.service';
import { MealOrderModel } from './models/MealOrder.model';

/** [KO] PubSub 토픽 상수 / [VI] Hằng số topic PubSub */
export const MEAL_ORDER_STATUS_CHANGED = 'MEAL_ORDER_STATUS_CHANGED';
export const MEAL_ORDER_RECEIVED = 'MEAL_ORDER_RECEIVED';

@Resolver()
export class MealOrderSubscriptionResolver {
  constructor(private readonly pubsub: GraphqlSubscriptionBusService) {}

  /**
   * [KO] 특정 주문의 상태 변경을 실시간으로 수신합니다.
   *      orderId로 필터링하여 해당 주문의 변경만 전달합니다.
   *      사용 시나리오: 직원이 자신의 주문 상태를 실시간으로 추적
   *
   * [VI] Nhận real-time thay đổi trạng thái của đơn hàng cụ thể.
   *      Lọc theo orderId, chỉ gửi thay đổi của đơn hàng đó.
   *      Tình huống sử dụng: nhân viên theo dõi trạng thái đơn hàng real-time
   */
  @Subscription(() => MealOrderModel, {
    name: 'mealOrderStatusChanged',
    filter: (
      payload: { mealOrderStatusChanged: MealOrderModel },
      variables: { orderId: string },
    ) => payload.mealOrderStatusChanged.id === variables.orderId,
  })
  mealOrderStatusChanged(
    @Args('orderId', { type: () => ID }) _orderId: string,
  ) {
    return this.pubsub.asyncIterator<MealOrderModel>(MEAL_ORDER_STATUS_CHANGED);
  }

  /**
   * [KO] 특정 지점(Branch)에 새 주문이 도착하면 실시간으로 수신합니다.
   *      branchId로 필터링하여 해당 지점의 주문만 전달합니다.
   *      사용 시나리오: 가맹점 대시보드에서 신규 주문 알림 수신
   *
   * [VI] Nhận real-time khi có đơn hàng mới đến chi nhánh (Branch) cụ thể.
   *      Lọc theo branchId, chỉ gửi đơn hàng của chi nhánh đó.
   *      Tình huống sử dụng: dashboard cửa hàng nhận thông báo đơn hàng mới
   */
  @Subscription(() => MealOrderModel, {
    name: 'mealOrderReceived',
    filter: (
      payload: { mealOrderReceived: MealOrderModel },
      variables: { branchId: string },
    ) => payload.mealOrderReceived.branchId === variables.branchId,
  })
  mealOrderReceived(
    @Args('branchId', { type: () => ID }) _branchId: string,
  ) {
    return this.pubsub.asyncIterator<MealOrderModel>(MEAL_ORDER_RECEIVED);
  }
}
