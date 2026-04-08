/**
 * 한국어: MealSettlement 하위 모듈.
 * Tiếng Việt: Module con MealSettlement.
 */
import { Module } from '@nestjs/common';
import { MealSettlementService } from './settlement.service';
import { MealSettlementResolver } from './settlement.resolver';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [MerchantModule],
  providers: [MealSettlementService, MealSettlementResolver],
  exports: [MealSettlementService],
})
export class SettlementModule {}
