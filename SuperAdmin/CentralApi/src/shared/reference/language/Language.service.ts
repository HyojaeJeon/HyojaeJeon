/**
 * 한국어: Language 서비스 — 언어 마스터 데이터의 CRUD.
 *   목록 조회는 Redis 캐시(TTL 300s) 우선이며, 생성/수정 시 자기 캐시만 무효화한다.
 *
 * Tiếng Việt: Service Language — CRUD dữ liệu master ngôn ngữ với cache Redis 300s.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { CreateLanguageInput } from './dto/CreateLanguage.input';

@Injectable()
export class LanguageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(skip: number, take: number) {
    const descriptor = CachePolicies.referenceList('languages');
    const cached = await this.cache.getJson<
      Awaited<ReturnType<PrismaService['language']['findMany']>>[number][]
    >(descriptor.key);
    if (cached !== null) return cached.slice(skip, skip + take);

    const rows = await this.prisma.language.findMany({
      orderBy: { createdAt: 'desc' },
    });
    await this.cache.setJson(descriptor.key, rows, descriptor.ttlSeconds);
    return rows.slice(skip, skip + take);
  }

  async findById(id: string) {
    return this.prisma.language.findUnique({ where: { id } });
  }

  async create(input: CreateLanguageInput) {
    const row = await this.prisma.language.create({
      data: {
        languageCode: input.languageCode,
        nativeName: input.nativeName,
        displayName: input.displayName,
        direction: input.direction ?? 'LTR',
        isDefault: input.isDefault ?? false,
        isActive: input.isActive ?? true,
      },
    });
    await this.cache.del(CachePolicies.referenceList('languages').key);
    return row;
  }

  async update(id: string, input: Partial<CreateLanguageInput>) {
    const row = await this.prisma.language.update({
      where: { id },
      data: {
        ...(input.languageCode !== undefined && { languageCode: input.languageCode }),
        ...(input.nativeName !== undefined && { nativeName: input.nativeName }),
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.direction !== undefined && { direction: input.direction }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
    await this.cache.del(CachePolicies.referenceList('languages').key);
    return row;
  }
}
