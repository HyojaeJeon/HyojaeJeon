import { Module } from '@nestjs/common';
import { MenuCategoryModule } from './menuCategory/MenuCategory.module';
import { MenuItemModule } from './menuItem/MenuItem.module';
import { PricePolicyModule } from './pricePolicy/PricePolicy.module';
import { PromotionModule } from './promotion/Promotion.module';

@Module({
  imports: [MenuCategoryModule, MenuItemModule, PricePolicyModule, PromotionModule],
  exports: [MenuCategoryModule, MenuItemModule, PricePolicyModule, PromotionModule],
})
export class CatalogModule {}
