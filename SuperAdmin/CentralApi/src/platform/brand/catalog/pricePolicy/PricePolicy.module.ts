import { Module } from '@nestjs/common';
import { PricePolicyResolver } from './PricePolicy.resolver';
import { PricePolicyService } from './PricePolicy.service';

@Module({
  providers: [PricePolicyResolver, PricePolicyService],
  exports: [PricePolicyService],
})
export class PricePolicyModule {}
