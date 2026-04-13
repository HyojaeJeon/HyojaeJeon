import { Module } from '@nestjs/common';
import { BranchResolver } from './Branch.resolver';
import { BranchService } from './Branch.service';
import { LicenseModule } from '@platform/superadmin/license/License.module';

@Module({
  imports: [LicenseModule],
  providers: [BranchResolver, BranchService],
  exports: [BranchService],
})
export class BranchModule {}
