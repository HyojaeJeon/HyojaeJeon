import { Module } from '@nestjs/common';
import { DeployPackageResolver } from './DeployPackage.resolver';
import { DeployPackageService } from './DeployPackage.service';

@Module({
  providers: [DeployPackageResolver, DeployPackageService],
  exports: [DeployPackageService],
})
export class DeployPackageModule {}
