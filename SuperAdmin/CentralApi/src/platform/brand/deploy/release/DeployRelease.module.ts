import { Module } from '@nestjs/common';
import { DeployReleaseResolver } from './DeployRelease.resolver';
import { DeployReleaseService } from './DeployRelease.service';

@Module({
  providers: [DeployReleaseResolver, DeployReleaseService],
  exports: [DeployReleaseService],
})
export class DeployReleaseModule {}
