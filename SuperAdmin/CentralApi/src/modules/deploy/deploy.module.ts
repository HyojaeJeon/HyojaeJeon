/**
 * 한국어: Deploy 모듈 — 배포 패키지(DeployPackage) 및 배포 릴리스(DeployRelease) 관리 기능을
 *         NestJS 모듈로 묶는다. 패키지는 빌드 아티팩트를, 릴리스는 특정 스코프로의 배포 이력을 관리한다.
 *         DeployPackageService/DeployReleaseService를 exports하여 다른 모듈(Sync 등)에서 사용 가능하다.
 * Tiếng Việt: Module Deploy — gộp các chức năng quản lý gói triển khai (DeployPackage) và bản phát hành
 *             (DeployRelease) thành module NestJS. Package quản lý artifact build, Release quản lý
 *             lịch sử triển khai đến scope cụ thể.
 *             Exports DeployPackageService/DeployReleaseService để các module khác (Sync...) sử dụng.
 */
import { Module } from '@nestjs/common';
import { DeployPackageResolver } from './resolvers/deploy-package.resolver';
import { DeployReleaseResolver } from './resolvers/deploy-release.resolver';
import { DeployPackageService } from './services/deploy-package.service';
import { DeployReleaseService } from './services/deploy-release.service';

@Module({
  providers: [
    DeployPackageResolver,
    DeployReleaseResolver,
    DeployPackageService,
    DeployReleaseService,
  ],
  exports: [DeployPackageService, DeployReleaseService],
})
export class DeployModule {}
