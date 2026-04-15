/**
 * [KO] MealMerchantSubscription NestJS 모듈
 *      임직원의 가맹점 일일 메뉴 구독 관리 기능을 등록합니다.
 *      MealMerchantSubscriptionService와 MealMerchantSubscriptionResolver를 제공합니다.
 *
 * [VI] Module NestJS MealMerchantSubscription
 *      Đăng ký chức năng quản lý đăng ký thực đơn hàng ngày cho nhân viên.
 *      Cung cấp MealMerchantSubscriptionService và MealMerchantSubscriptionResolver.
 */
import { Module } from '@nestjs/common';
import { MealMerchantSubscriptionService } from './MerchantSubscription.service';
import { MealMerchantSubscriptionResolver } from './MerchantSubscription.resolver';

@Module({
  providers: [MealMerchantSubscriptionService, MealMerchantSubscriptionResolver],
  exports: [MealMerchantSubscriptionService],
})
export class MerchantSubscriptionModule {}
