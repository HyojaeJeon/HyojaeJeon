/**
 * 한국어: Language 모듈 — reference 그룹의 언어 leaf.
 * Tiếng Việt: Module Language — leaf ngôn ngữ trong nhóm reference.
 */
import { Module } from '@nestjs/common';
import { LanguageResolver } from './language.resolver';
import { LanguageService } from './language.service';

@Module({
  providers: [LanguageResolver, LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {}
