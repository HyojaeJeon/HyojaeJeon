import { Module } from '@nestjs/common';
import { DistributorResolver } from './distributor.resolver';
import { DistributorService } from './distributor.service';

@Module({
  providers: [DistributorResolver, DistributorService],
  exports: [DistributorService],
})
export class DistributorModule {}
