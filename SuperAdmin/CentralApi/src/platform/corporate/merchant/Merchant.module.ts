/**
 * [KO] 식권 가맹점(Meal Merchant) NestJS 모듈
 *      MealMerchantService 와 MealMerchantResolver 를 등록합니다.
 *      MealMerchantService 를 export 하여 다른 모듈(예: Settlement)에서 주입할 수 있게 합니다.
 *
 *      이 모듈이 다루는 영역:
 *        - 가맹점 등록(Enrollment) CRUD
 *        - 수수료율(CommissionRate) 설정
 *        - 정산 계좌(SettlementAccount) 관리
 *
 * [VI] Module NestJS cho Meal Merchant (merchant phiếu ăn)
 *      Đăng ký MealMerchantService và MealMerchantResolver.
 *      Export MealMerchantService để các module khác (ví dụ: Settlement) có thể inject.
 *
 *      Phạm vi module:
 *        - CRUD Enrollment (đăng ký merchant)
 *        - Cài đặt CommissionRate (hoa hồng)
 *        - Quản lý SettlementAccount (tài khoản quyết toán)
 */
import { Module } from '@nestjs/common';
import { MealMerchantService } from './Merchant.service';
import { MealMerchantResolver } from './Merchant.resolver';

@Module({
  providers: [MealMerchantService, MealMerchantResolver],
  /** [KO] Settlement 등 외부 모듈에서 수수료율 조회를 위해 export / [VI] Export để module ngoài (Settlement) truy vấn hoa hồng */
  exports: [MealMerchantService],
})
export class MerchantModule {}
