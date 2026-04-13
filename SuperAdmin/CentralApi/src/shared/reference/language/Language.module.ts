/**
 * 한국어: Language 모듈 — reference 그룹의 언어 leaf.
 * Tiếng Việt: Module Language — leaf ngôn ngữ trong nhóm reference.
 */
import { Module } from '@nestjs/common';
import { LanguageResolver } from './Language.resolver';
import { LanguageService } from './Language.service';

@Module({
  providers: [LanguageResolver, LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {}
