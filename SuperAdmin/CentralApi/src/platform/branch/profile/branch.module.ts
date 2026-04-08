import { Module } from '@nestjs/common';
import { BranchResolver } from './branch.resolver';
import { BranchService } from './branch.service';

@Module({
  providers: [BranchResolver, BranchService],
  exports: [BranchService],
})
export class BranchModule {}
