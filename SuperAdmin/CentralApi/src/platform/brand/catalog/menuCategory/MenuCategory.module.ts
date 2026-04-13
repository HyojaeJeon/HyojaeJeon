import { Module } from '@nestjs/common';
import { MenuCategoryResolver } from './MenuCategory.resolver';
import { MenuCategoryService } from './MenuCategory.service';

@Module({
  providers: [MenuCategoryResolver, MenuCategoryService],
  exports: [MenuCategoryService],
})
export class MenuCategoryModule {}
