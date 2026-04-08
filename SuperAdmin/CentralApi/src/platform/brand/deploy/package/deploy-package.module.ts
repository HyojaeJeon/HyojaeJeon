import { Module } from '@nestjs/common';
import { DeployPackageResolver } from './deploy-package.resolver';
import { DeployPackageService } from './deploy-package.service';

@Module({
  providers: [DeployPackageResolver, DeployPackageService],
  exports: [DeployPackageService],
})
export class DeployPackageModule {}
