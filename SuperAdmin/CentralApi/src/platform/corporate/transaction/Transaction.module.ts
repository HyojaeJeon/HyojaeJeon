/**
 * [KO] MealTransaction NestJS 모듈
 *
 * 식권 거래(MealTransaction) 도메인의 의존성 주입(DI) 컨테이너이다.
 * 이 모듈은 다음을 등록한다:
 *   - MealTransactionService: 결제 승인/취소/조회 비즈니스 로직
 *   - MealTransactionResolver: GraphQL 진입점 (Query + Mutation)
 *
 * PolicyModule을 import하여 정책 평가(시간대, 한도, 가맹점 카테고리 검증)에 사용한다.
 * MealTransactionService를 export하여 다른 모듈(예: settlement, einvoice)에서
 * 거래 데이터를 참조할 수 있도록 한다.
 *
 * ── 의존 관계 ──
 * PolicyModule → MealPolicyService (정책 평가)
 * PrismaService, EntitlementService, PermissionService는 글로벌 모듈에서 자동 주입된다.
 *
 * [VI] Module NestJS cho MealTransaction
 *
 * Container dependency injection (DI) của domain giao dịch phiếu ăn.
 * Module này đăng ký:
 *   - MealTransactionService: logic nghiệp vụ phê duyệt/hủy/truy vấn
 *   - MealTransactionResolver: điểm vào GraphQL (Query + Mutation)
 *
 * Import PolicyModule để đánh giá chính sách (khung giờ, hạn mức, danh mục cửa hàng).
 * Export MealTransactionService để các module khác (ví dụ: settlement, einvoice)
 * có thể tham chiếu dữ liệu giao dịch.
 *
 * ── Quan hệ phụ thuộc ──
 * PolicyModule → MealPolicyService (đánh giá chính sách)
 * PrismaService, EntitlementService, PermissionService được inject tự động từ module toàn cục.
 */
import { Module } from '@nestjs/common';
import { MealTransactionService } from './Transaction.service';
import { MealTransactionResolver } from './Transaction.resolver';
import { PolicyModule } from '../policy/Policy.module';

@Module({
  /** [KO] PolicyModule: 식권 정책 평가 서비스를 제공 / [VI] PolicyModule: cung cấp service đánh giá chính sách phiếu ăn */
  imports: [PolicyModule],
  /** [KO] Service(비즈니스 로직) + Resolver(GraphQL 핸들러) 등록 / [VI] Đăng ký Service (logic nghiệp vụ) + Resolver (handler GraphQL) */
  providers: [MealTransactionService, MealTransactionResolver],
  /** [KO] 외부 모듈에서 거래 서비스를 사용할 수 있도록 export / [VI] Export để module bên ngoài sử dụng service giao dịch */
  exports: [MealTransactionService],
})
export class TransactionModule {}
