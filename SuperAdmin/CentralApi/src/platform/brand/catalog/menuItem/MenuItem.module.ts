import { Module } from '@nestjs/common';
import { MenuItemResolver } from './MenuItem.resolver';
import { MenuItemService } from './MenuItem.service';

@Module({
  providers: [MenuItemResolver, MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule {}
