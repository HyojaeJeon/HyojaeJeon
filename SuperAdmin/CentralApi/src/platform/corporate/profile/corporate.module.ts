/**
 * 한국어: MealCorporate 하위 모듈 — 식권 고객 기업 / 부서 / 임직원.
 * Tiếng Việt: Module con MealCorporate.
 */
import { Module } from '@nestjs/common';
import { MealCorporateService } from './corporate.service';
import { MealCorporateResolver } from './corporate.resolver';

@Module({
  providers: [MealCorporateService, MealCorporateResolver],
  exports: [MealCorporateService],
})
export class CorporateModule {}
