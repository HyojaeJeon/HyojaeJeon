/**
 * 한국어: MealMerchant 하위 모듈.
 * Tiếng Việt: Module con MealMerchant.
 */
import { Module } from '@nestjs/common';
import { MealMerchantService } from './merchant.service';
import { MealMerchantResolver } from './merchant.resolver';

@Module({
  providers: [MealMerchantService, MealMerchantResolver],
  exports: [MealMerchantService],
})
export class MerchantModule {}
