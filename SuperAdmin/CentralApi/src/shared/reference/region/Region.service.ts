/**
 * 한국어: Region 서비스 — 지역 마스터 데이터의 CRUD.
 *   목록 조회는 Redis 캐시(TTL 300s) 우선이며, 생성/수정 시 자기 캐시만 무효화한다.
 *
 * Tiếng Việt: Service Region — CRUD dữ liệu master khu vực với cache Redis 300s.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { CacheService } from '@core/cache/Cache.service';
import { CachePolicies } from '@core/cache/cachePolicies';
import { CreateRegionInput } from './dto/CreateRegion.input';

@Injectable()
export class RegionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(skip: number, take: number) {
    const descriptor = CachePolicies.referenceList('regions');
    const cached = await this.cache.getJson<
      Awaited<ReturnType<PrismaService['region']['findMany']>>[number][]
    >(descriptor.key);
    if (cached !== null) return cached.slice(skip, skip + take);

    const rows = await this.prisma.region.findMany({
      orderBy: { createdAt: 'desc' },
    });
    await this.cache.setJson(descriptor.key, rows, descriptor.ttlSeconds);
    return rows.slice(skip, skip + take);
  }

  async findById(id: string) {
    return this.prisma.region.findUnique({ where: { id } });
  }

  async create(input: CreateRegionInput) {
    const row = await this.prisma.region.create({
      data: {
        regionCode: input.regionCode,
        countryCode: input.countryCode,
        regionName: input.regionName,
        currencyCode: input.currencyCode,
        timeZoneCode: input.timeZoneCode,
      },
    });
    await this.cache.del(CachePolicies.referenceList('regions').key);
    return row;
  }

  async update(id: string, input: Partial<CreateRegionInput>) {
    const row = await this.prisma.region.update({
      where: { id },
      data: {
        ...(input.regionCode !== undefined && { regionCode: input.regionCode }),
        ...(input.countryCode !== undefined && { countryCode: input.countryCode }),
        ...(input.regionName !== undefined && { regionName: input.regionName }),
        ...(input.currencyCode !== undefined && { currencyCode: input.currencyCode }),
        ...(input.timeZoneCode !== undefined && { timeZoneCode: input.timeZoneCode }),
      },
    });
    await this.cache.del(CachePolicies.referenceList('regions').key);
    return row;
  }
}
