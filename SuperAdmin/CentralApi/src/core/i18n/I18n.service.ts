/**
 * 한국어: I18nService — 도메인/카테고리/locale/code 단위로 메시지를 해석한다.
 *   카탈로그 위치: src/core/i18n/locales/<domain>/<kind>/<locale>.json
 *     - domain: common / platform / brand / corporate / edgepos ...
 *     - kind:   success / error
 *     - locale: ko / en / vi
 *   해석 우선순위 (fallback chain):
 *     1) <domain>/<kind>/<locale>[code]
 *     2) common/<kind>/<locale>[code]
 *     3) <domain>/<kind>/en[code]
 *     4) common/<kind>/en[code]
 *     5) code 자체 (식별 가능하도록 raw 반환)
 *
 *   placeholder 보간: '{{key}}' → params[key]
 *
 *   본 서비스는 부팅 시 dist (또는 src) 의 locales 디렉토리를 동기 로드하고,
 *   메모리 캐시에서 O(1) 조회한다. 카탈로그 변경은 재배포 단위로만 반영된다.
 *
 * Tiếng Việt: Dịch vụ I18n trung tâm — phân giải mã code → message theo locale.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from './locale.util';

export type MessageKind = 'success' | 'error';

type Catalog = Record<string, string>;
type CatalogMap = Map<string, Catalog>; // key: `${domain}/${kind}/${locale}`

@Injectable()
export class I18nService implements OnModuleInit {
  private readonly logger = new Logger(I18nService.name);
  private readonly catalogs: CatalogMap = new Map();

  onModuleInit() {
    this.loadAll();
  }

  /**
   * 한국어: locale 카탈로그를 모두 메모리에 로드한다.
   *   런타임은 dist/core/i18n/locales 에서 읽고, 개발/테스트는 src/core/i18n/locales 에서 읽는다.
   *
   * P1-8: boot-time 엄격 검증.
   *   - locales 루트가 없거나
   *   - 카탈로그가 하나도 로드되지 않거나
   *   - 필수 카탈로그 (common/error/en, common/success/en) 가 누락되면 boot 를 실패시킨다.
   *   - 개별 파일 parse 실패도 즉시 예외.
   *   운영에서 배포 직후 "메시지 없음" 을 만나는 것을 원천 차단한다.
   */
  private loadAll() {
    const candidates = [
      path.resolve(__dirname, 'locales'),
      path.resolve(__dirname, '../../../src/core/i18n/locales'),
      path.resolve(process.cwd(), 'src/core/i18n/locales'),
      path.resolve(process.cwd(), 'dist/core/i18n/locales'),
    ];
    const root = candidates.find((p) => fs.existsSync(p));
    if (!root) {
      throw new Error(
        `I18n locales root not found. Tried: ${candidates.join(', ')}. ` +
          `Ensure src/core/i18n/locales/<domain>/<kind>/<locale>.json exists.`,
      );
    }
    let count = 0;
    for (const domain of fs.readdirSync(root, { withFileTypes: true })) {
      if (!domain.isDirectory()) continue;
      const domainPath = path.join(root, domain.name);
      for (const kind of fs.readdirSync(domainPath, { withFileTypes: true })) {
        if (!kind.isDirectory()) continue;
        const kindPath = path.join(domainPath, kind.name);
        for (const file of fs.readdirSync(kindPath)) {
          if (!file.endsWith('.json')) continue;
          const locale = file.replace(/\.json$/, '');
          const key = `${domain.name}/${kind.name}/${locale}`;
          try {
            const raw = fs.readFileSync(path.join(kindPath, file), 'utf8');
            this.catalogs.set(key, JSON.parse(raw));
            count++;
          } catch (err) {
            throw new Error(
              `Failed to load i18n catalog ${key}: ${(err as Error).message}. ` +
                `Invalid JSON or unreadable file at ${path.join(kindPath, file)}.`,
            );
          }
        }
      }
    }

    if (count === 0) {
      throw new Error(
        `I18n loaded 0 catalogs from ${root}. At least one catalog is required.`,
      );
    }

    // 최소 필수 카탈로그: common/error/en, common/success/en 은 fallback chain 의 마지막 백스톱.
    const requiredKeys = ['common/error/en', 'common/success/en'];
    const missing = requiredKeys.filter((k) => !this.catalogs.has(k));
    if (missing.length > 0) {
      throw new Error(
        `I18n required catalogs missing: [${missing.join(', ')}] in ${root}. ` +
          `These are the fallback-chain backstop and must exist.`,
      );
    }

    this.logger.log(`I18n loaded ${count} catalogs from ${root}`);
  }

  private lookup(
    domain: string,
    kind: MessageKind,
    locale: SupportedLocale,
    code: string,
  ): string | undefined {
    return this.catalogs.get(`${domain}/${kind}/${locale}`)?.[code];
  }

  /**
   * 한국어: 지정 (domain, kind, code, locale, params) 에 대한 메시지를 반환한다.
   *   카탈로그에 없으면 fallback chain (common → en → code) 을 따른다.
   *
   * Tiếng Việt: Phân giải message với fallback theo domain/locale.
   */
  message(input: {
    domain: string;
    kind: MessageKind;
    code: string;
    locale?: SupportedLocale;
    params?: Record<string, unknown>;
  }): string {
    const locale = input.locale ?? DEFAULT_LOCALE;
    const template =
      this.lookup(input.domain, input.kind, locale, input.code) ??
      this.lookup('common', input.kind, locale, input.code) ??
      this.lookup(input.domain, input.kind, DEFAULT_LOCALE, input.code) ??
      this.lookup('common', input.kind, DEFAULT_LOCALE, input.code) ??
      input.code;
    return interpolate(template, input.params);
  }
}

/**
 * 한국어: '{{name}}' 형태의 placeholder 를 params 로 치환한다.
 *   param 이 없으면 placeholder 를 그대로 둔다.
 */
function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (full, key) => {
    const v = params[key];
    return v === undefined || v === null ? full : String(v);
  });
}
