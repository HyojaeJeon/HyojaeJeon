/**
 * 한국어: Currency 서비스 — 통화 마스터 데이터의 CRUD.
 *   목록 조회는 Redis 캐시(TTL 300s) 우선이며, 생성/수정 시 자기 캐시만 무효화한다.
 *
 * Tiếng Việt: Service Currency — CRUD dữ liệu master tiền tệ với cache Redis 300s.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { CreateCurrencyInput } from './dto/CreateCurrency.input';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(skip: number, take: number) {
    const descriptor = CachePolicies.referenceList('currencies');
    const cached = await this.cache.getJson<
      Awaited<ReturnType<PrismaService['currency']['findMany']>>[number][]
    >(descriptor.key);
    if (cached !== null) return cached.slice(skip, skip + take);

    const rows = await this.prisma.currency.findMany({
      orderBy: { createdAt: 'desc' },
    });
    await this.cache.setJson(descriptor.key, rows, descriptor.ttlSeconds);
    return rows.slice(skip, skip + take);
  }

  async findById(id: string) {
    return this.prisma.currency.findUnique({ where: { id } });
  }

  async create(input: CreateCurrencyInput) {
    const row = await this.prisma.currency.create({
      data: {
        currencyCode: input.currencyCode,
        currencyName: input.currencyName,
        symbol: input.symbol,
        decimalDigits: input.decimalDigits,
        roundingMode: input.roundingMode,
      },
    });
    await this.cache.del(CachePolicies.referenceList('currencies').key);
    return row;
  }

  async update(id: string, input: Partial<CreateCurrencyInput>) {
    const row = await this.prisma.currency.update({
      where: { id },
      data: {
        ...(input.currencyCode !== undefined && { currencyCode: input.currencyCode }),
        ...(input.currencyName !== undefined && { currencyName: input.currencyName }),
        ...(input.symbol !== undefined && { symbol: input.symbol }),
        ...(input.decimalDigits !== undefined && { decimalDigits: input.decimalDigits }),
        ...(input.roundingMode !== undefined && { roundingMode: input.roundingMode }),
      },
    });
    await this.cache.del(CachePolicies.referenceList('currencies').key);
    return row;
  }
}
