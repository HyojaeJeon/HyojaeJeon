import { Module } from '@nestjs/common';
import { DeployPackageModule } from './package/DeployPackage.module';
import { DeployReleaseModule } from './release/DeployRelease.module';

@Module({
  imports: [DeployPackageModule, DeployReleaseModule],
  exports: [DeployPackageModule, DeployReleaseModule],
})
export class DeployModule {}
