import { Module } from '@nestjs/common';
import { PricePolicyResolver } from './price-policy.resolver';
import { PricePolicyService } from './price-policy.service';

@Module({
  providers: [PricePolicyResolver, PricePolicyService],
  exports: [PricePolicyService],
})
export class PricePolicyModule {}
