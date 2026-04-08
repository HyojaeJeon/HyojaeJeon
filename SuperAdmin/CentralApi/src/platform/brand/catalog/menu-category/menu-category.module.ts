import { Module } from '@nestjs/common';
import { MenuCategoryResolver } from './menu-category.resolver';
import { MenuCategoryService } from './menu-category.service';

@Module({
  providers: [MenuCategoryResolver, MenuCategoryService],
  exports: [MenuCategoryService],
})
export class MenuCategoryModule {}
