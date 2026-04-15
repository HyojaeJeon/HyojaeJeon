/**
 * [KO] MealWallet 하위 모듈
 *      NestJS 모듈로서 MealWalletService와 MealWalletResolver를 등록합니다.
 *      이 모듈은 corporate 그룹 모듈에서 import되어 사용됩니다.
 *
 *      providers: 이 모듈 내부에서 사용하는 서비스/리졸버
 *      exports: 다른 모듈에서 주입(inject)할 수 있도록 공개하는 서비스
 *
 * [VI] Module con MealWallet
 *      Module NestJS đăng ký MealWalletService và MealWalletResolver.
 *      Module này được import bởi module nhóm corporate.
 *
 *      providers: service/resolver sử dụng bên trong module này
 *      exports: service được công khai để các module khác có thể inject
 */
import { Module } from '@nestjs/common';
import { MealWalletService } from './Wallet.service';
import { MealWalletResolver } from './Wallet.resolver';
import { MealWalletSubscriptionResolver } from './Wallet.subscription';

@Module({
  providers: [MealWalletService, MealWalletResolver, MealWalletSubscriptionResolver],
  exports: [MealWalletService],
})
export class WalletModule {}
