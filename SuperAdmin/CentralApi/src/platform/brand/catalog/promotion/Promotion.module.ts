import { Module } from '@nestjs/common';
import { PromotionResolver } from './Promotion.resolver';
import { PromotionService } from './Promotion.service';

@Module({
  providers: [PromotionResolver, PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
