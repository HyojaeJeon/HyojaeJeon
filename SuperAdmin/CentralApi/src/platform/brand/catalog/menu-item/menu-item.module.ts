import { Module } from '@nestjs/common';
import { MenuItemResolver } from './menu-item.resolver';
import { MenuItemService } from './menu-item.service';

@Module({
  providers: [MenuItemResolver, MenuItemService],
  exports: [MenuItemService],
})
export class MenuItemModule {}
