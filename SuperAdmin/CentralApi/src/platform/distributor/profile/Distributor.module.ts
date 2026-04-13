import { Module } from '@nestjs/common';
import { DistributorResolver } from './Distributor.resolver';
import { DistributorService } from './Distributor.service';

@Module({
  providers: [DistributorResolver, DistributorService],
  exports: [DistributorService],
})
export class DistributorModule {}
