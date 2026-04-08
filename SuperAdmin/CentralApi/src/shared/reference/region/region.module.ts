/**
 * 한국어: Region 모듈 — reference 그룹의 지역 leaf.
 * Tiếng Việt: Module Region — leaf khu vực trong nhóm reference.
 */
import { Module } from '@nestjs/common';
import { RegionResolver } from './region.resolver';
import { RegionService } from './region.service';

@Module({
  providers: [RegionResolver, RegionService],
  exports: [RegionService],
})
export class RegionModule {}
