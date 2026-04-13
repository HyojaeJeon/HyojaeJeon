import { Module } from '@nestjs/common';
import { BrandResolver } from './Brand.resolver';
import { BrandService } from './Brand.service';

@Module({
  providers: [BrandResolver, BrandService],
  exports: [BrandService],
})
export class BrandModule {}
