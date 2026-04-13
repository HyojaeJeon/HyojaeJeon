/**
 * [KO] 식권 정산(Meal Settlement) NestJS 모듈
 *      MealSettlementService 와 MealSettlementResolver 를 등록합니다.
 *      MerchantModule 을 import 하여 정산 시 수수료율 조회(getActiveCommissionRate)를 사용합니다.
 *
 *      이 모듈이 다루는 영역:
 *        - 3-Way Matching 정산 배치 생성 및 관리
 *        - 배치 상태 전이: MATCHED -> APPROVED -> PAYOUT_REQUESTED -> PAID
 *        - 3-Way 불일치(EXCEPTION) 해결
 *        - 플랫폼 전체 수익 요약 조회
 *
 * [VI] Module NestJS cho Meal Settlement (quyết toán phiếu ăn)
 *      Đăng ký MealSettlementService và MealSettlementResolver.
 *      Import MerchantModule để sử dụng truy vấn hoa hồng (getActiveCommissionRate) khi quyết toán.
 *
 *      Phạm vi module:
 *        - Tạo và quản lý batch quyết toán 3-Way Matching
 *        - Chuyển trạng thái batch: MATCHED -> APPROVED -> PAYOUT_REQUESTED -> PAID
 *        - Giải quyết bất thường 3-Way (EXCEPTION)
 *        - Truy vấn tóm tắt doanh thu toàn nền tảng
 */
import { Module } from '@nestjs/common';
import { MealSettlementService } from './Settlement.service';
import { MealSettlementResolver } from './Settlement.resolver';
import { MerchantModule } from '../merchant/Merchant.module';

@Module({
  /** [KO] MerchantModule 에서 수수료율 조회 서비스를 가져옴 / [VI] Import service truy vấn hoa hồng từ MerchantModule */
  imports: [MerchantModule],
  providers: [MealSettlementService, MealSettlementResolver],
  exports: [MealSettlementService],
})
export class SettlementModule {}
