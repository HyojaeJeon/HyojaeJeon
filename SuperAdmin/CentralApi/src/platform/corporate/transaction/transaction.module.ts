/**
 * 한국어: MealTransaction 하위 모듈.
 *   MealPolicyModule 을 import 하여 정책 평가에 사용한다.
 * Tiếng Việt: Module con MealTransaction.
 */
import { Module } from '@nestjs/common';
import { MealTransactionService } from './transaction.service';
import { MealTransactionResolver } from './transaction.resolver';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [PolicyModule],
  providers: [MealTransactionService, MealTransactionResolver],
  exports: [MealTransactionService],
})
export class TransactionModule {}
