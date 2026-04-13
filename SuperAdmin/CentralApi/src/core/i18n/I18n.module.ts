/**
 * 한국어: I18nModule (core, global) — I18nService 를 모든 모듈에 노출.
 *   filter / interceptor / service / resolver 가 inject 해서 메시지 해석에 사용한다.
 *
 * Tiếng Việt: Module I18n hạ tầng @Global.
 */
import { Global, Module } from '@nestjs/common';
import { I18nService } from './I18n.service';

@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
