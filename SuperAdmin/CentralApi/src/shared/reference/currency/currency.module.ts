/**
 * 한국어: Currency 모듈 — reference 그룹의 통화 leaf.
 * Tiếng Việt: Module Currency — leaf tiền tệ trong nhóm reference.
 */
import { Module } from '@nestjs/common';
import { CurrencyResolver } from './currency.resolver';
import { CurrencyService } from './currency.service';

@Module({
  providers: [CurrencyResolver, CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
