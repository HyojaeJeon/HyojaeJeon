/**
 * 한국어: MealWallet 하위 모듈.
 * Tiếng Việt: Module con MealWallet.
 */
import { Module } from '@nestjs/common';
import { MealWalletService } from './wallet.service';
import { MealWalletResolver } from './wallet.resolver';

@Module({
  providers: [MealWalletService, MealWalletResolver],
  exports: [MealWalletService],
})
export class WalletModule {}
