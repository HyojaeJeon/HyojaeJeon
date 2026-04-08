import { Module } from '@nestjs/common';
import { DeployPackageModule } from './package/deploy-package.module';
import { DeployReleaseModule } from './release/deploy-release.module';

@Module({
  imports: [DeployPackageModule, DeployReleaseModule],
  exports: [DeployPackageModule, DeployReleaseModule],
})
export class DeployModule {}
