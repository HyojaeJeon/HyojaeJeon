/**
 * EmailTemplateService — Handlebars 템플릿 렌더링 서비스
 *
 * templates/ 디렉토리에서 {templateName}_{locale}.hbs 파일을 로드하고,
 * Handlebars로 컴파일하여 HTML 문자열을 반환합니다.
 * 컴파일된 템플릿은 메모리에 캐시하여 반복 렌더링 성능을 최적화합니다.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_EMAIL_LOCALE } from './email.types';
import type { EmailLocale } from './email.types';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templates = new Map<string, HandlebarsTemplateDelegate>();
  private readonly templatesDir = path.join(__dirname, 'templates');

  /**
   * Render a template with the given data and locale.
   *
   * @param templateName - Template base name (e.g. 'invoice-issued')
   * @param data - Template variables
   * @param locale - Target locale ('ko' | 'en' | 'vi')
   * @returns Rendered HTML string
   */
  async render(
    templateName: string,
    data: Record<string, unknown>,
    locale?: string,
  ): Promise<string> {
    const resolvedLocale = this.resolveLocale(locale);
    const cacheKey = `${templateName}_${resolvedLocale}`;

    let compiled = this.templates.get(cacheKey);
    if (!compiled) {
      compiled = await this.loadAndCompile(templateName, resolvedLocale);
      this.templates.set(cacheKey, compiled);
    }

    return compiled(data);
  }

  /**
   * Preload all templates for a given locale into cache.
   * Useful during app bootstrap to fail fast on missing templates.
   */
  async preloadTemplates(locale: EmailLocale): Promise<void> {
    const templateNames = [
      'invoice-issued',
      'invoice-review',
      'settlement-paid',
      'contract-sent',
      'contract-signed',
    ];

    for (const name of templateNames) {
      const cacheKey = `${name}_${locale}`;
      if (!this.templates.has(cacheKey)) {
        try {
          const compiled = await this.loadAndCompile(name, locale);
          this.templates.set(cacheKey, compiled);
        } catch (error) {
          this.logger.warn(
            `Failed to preload template ${cacheKey}: ${(error as Error).message}`,
          );
        }
      }
    }
  }

  /**
   * Clear the template cache. Useful for hot-reload in development.
   */
  clearCache(): void {
    this.templates.clear();
  }

  private async loadAndCompile(
    templateName: string,
    locale: string,
  ): Promise<HandlebarsTemplateDelegate> {
    const filePath = path.join(this.templatesDir, `${templateName}_${locale}.hbs`);

    try {
      const source = await fs.promises.readFile(filePath, 'utf-8');
      return Handlebars.compile(source);
    } catch (error) {
      // Fallback: try default locale if requested locale template is missing
      if (locale !== DEFAULT_EMAIL_LOCALE) {
        this.logger.warn(
          `Template ${templateName}_${locale}.hbs not found, falling back to ${DEFAULT_EMAIL_LOCALE}`,
        );
        const fallbackPath = path.join(
          this.templatesDir,
          `${templateName}_${DEFAULT_EMAIL_LOCALE}.hbs`,
        );
        const source = await fs.promises.readFile(fallbackPath, 'utf-8');
        return Handlebars.compile(source);
      }

      throw new Error(
        `Email template not found: ${templateName}_${locale}.hbs — ${(error as Error).message}`,
      );
    }
  }

  private resolveLocale(locale?: string): EmailLocale {
    const supported: EmailLocale[] = ['ko', 'en', 'vi'];
    if (locale && supported.includes(locale as EmailLocale)) {
      return locale as EmailLocale;
    }
    return DEFAULT_EMAIL_LOCALE;
  }
}
