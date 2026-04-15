/**
 * [KO] MealOrder NestJS 모듈
 *
 * VMeal 앱 기반 식사 주문(MealOrder) 도메인의 의존성 주입(DI) 컨테이너이다.
 * 이 모듈은 다음을 등록한다:
 *   - MealOrderService: 주문 생성/취소/상태 전이/조회 비즈니스 로직
 *   - MealOrderResolver: GraphQL 진입점 (Query + Mutation)
 *
 * PolicyModule을 import하여 정책 평가(시간대, 한도, 가맹점 카테고리 검증)에 사용한다.
 * MealOrderService를 export하여 다른 모듈(예: notification, dashboard)에서
 * 주문 데이터를 참조할 수 있도록 한다.
 *
 * ── 의존 관계 ──
 * PolicyModule → MealPolicyService (정책 평가)
 * PrismaService, EntitlementService, PermissionService는 글로벌 모듈에서 자동 주입된다.
 *
 * [VI] Module NestJS cho MealOrder
 *
 * Container dependency injection (DI) của domain đặt hàng bữa ăn qua ứng dụng VMeal.
 * Module này đăng ký:
 *   - MealOrderService: logic nghiệp vụ tạo/hủy/chuyển trạng thái/truy vấn đơn hàng
 *   - MealOrderResolver: điểm vào GraphQL (Query + Mutation)
 *
 * Import PolicyModule để đánh giá chính sách (khung giờ, hạn mức, danh mục cửa hàng).
 * Export MealOrderService để các module khác (ví dụ: notification, dashboard)
 * có thể tham chiếu dữ liệu đơn hàng.
 *
 * ── Quan hệ phụ thuộc ──
 * PolicyModule → MealPolicyService (đánh giá chính sách)
 * PrismaService, EntitlementService, PermissionService được inject tự động từ module toàn cục.
 */
import { Module } from '@nestjs/common';
import { MealOrderService } from './Order.service';
import { MealOrderResolver } from './Order.resolver';
import { MealOrderSubscriptionResolver } from './Order.subscription';
import { PolicyModule } from '../policy/Policy.module';

@Module({
  /** [KO] PolicyModule: 식권 정책 평가 서비스를 제공 / [VI] PolicyModule: cung cấp service đánh giá chính sách phiếu ăn */
  imports: [PolicyModule],
  /** [KO] Service(비즈니스 로직) + Resolver(GraphQL 핸들러) + Subscription(실시간 이벤트) 등록 / [VI] Đăng ký Service + Resolver + Subscription */
  providers: [MealOrderService, MealOrderResolver, MealOrderSubscriptionResolver],
  /** [KO] 외부 모듈에서 주문 서비스를 사용할 수 있도록 export / [VI] Export để module bên ngoài sử dụng service đơn hàng */
  exports: [MealOrderService],
})
export class OrderModule {}
