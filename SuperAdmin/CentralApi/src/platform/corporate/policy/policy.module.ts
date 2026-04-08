/**
 * 한국어: MealPolicy 하위 모듈.
 * Tiếng Việt: Module con MealPolicy.
 */
import { Module } from '@nestjs/common';
import { MealPolicyService } from './policy.service';
import { MealPolicyResolver } from './policy.resolver';

@Module({
  providers: [MealPolicyService, MealPolicyResolver],
  exports: [MealPolicyService],
})
export class PolicyModule {}
