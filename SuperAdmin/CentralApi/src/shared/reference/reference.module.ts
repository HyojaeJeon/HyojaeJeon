/**
 * 한국어: Reference 모듈 — 플랫폼 공통 참조 데이터(언어/지역/통화) 그룹 aggregator.
 *   provider/resolver/service 를 직접 갖지 않고, 3 개의 sub-leaf 모듈을 묶기만 한다.
 *
 * Tiếng Việt: Module Reference — gộp 3 leaf con (language / region / currency).
 */
import { Module } from '@nestjs/common';
import { CurrencyModule } from './currency/currency.module';
import { LanguageModule } from './language/language.module';
import { RegionModule } from './region/region.module';

@Module({
  imports: [CurrencyModule, LanguageModule, RegionModule],
  exports: [CurrencyModule, LanguageModule, RegionModule],
})
export class ReferenceModule {}
