import { Module } from '@nestjs/common';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { PricePolicyModule } from './price-policy/price-policy.module';
import { PromotionModule } from './promotion/promotion.module';

@Module({
  imports: [MenuCategoryModule, MenuItemModule, PricePolicyModule, PromotionModule],
  exports: [MenuCategoryModule, MenuItemModule, PricePolicyModule, PromotionModule],
})
export class CatalogModule {}
