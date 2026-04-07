/**
 * 한국어: Reference 서비스 — 언어(Language), 지역(Region), 통화(Currency) 3개 참조 엔티티의
 *         CRUD를 통합 관리한다. Prisma를 통해 PostgreSQL에 접근하고,
 *         RedisService를 통해 목록 조회 결과를 캐싱한다 (TTL 300초).
 *         생성/수정 시 관련 캐시를 무효화(invalidate)하여 일관성을 보장한다.
 *         각 엔티티의 update 메서드는 partial update 패턴을 사용하여
 *         undefined가 아닌 필드만 선택적으로 갱신한다.
 * Tiếng Việt: Service Reference — quản lý tích hợp CRUD cho 3 entity tham chiếu:
 *             Ngôn ngữ (Language), Khu vực (Region), Tiền tệ (Currency).
 *             Truy cập PostgreSQL thông qua Prisma, cache kết quả truy vấn danh sách
 *             qua RedisService (TTL 300 giây).
 *             Vô hiệu hóa (invalidate) cache liên quan khi tạo/sửa để đảm bảo tính nhất quán.
 *             Mỗi method update sử dụng mẫu partial update,
 *             chỉ cập nhật chọn lọc các trường không phải undefined.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateLanguageInput } from './dto/create-language.input';
import { CreateRegionInput } from './dto/create-region.input';
import { CreateCurrencyInput } from './dto/create-currency.input';

@Injectable()
export class ReferenceService {
  /** 한국어: 캐시 TTL (초 단위) — 참조 데이터 목록 캐시의 유효 기간 / Tiếng Việt: TTL cache (đơn vị giây) — thời hạn cache danh sách dữ liệu tham chiếu */
  private readonly cacheTtlSeconds = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 한국어: 네임스페이스별 목록 캐시 키를 생성한다 (예: 'reference:languages:list').
   * Tiếng Việt: Tạo khóa cache danh sách theo namespace (ví dụ: 'reference:languages:list').
   */
  private listCacheKey(namespace: 'languages' | 'regions' | 'currencies') {
    return `reference:${namespace}:list`;
  }

  /**
   * 한국어: Redis에서 목록 캐시를 읽어온다. 캐시 미스 시 null 반환.
   * Tiếng Việt: Đọc cache danh sách từ Redis. Trả về null khi cache miss.
   */
  private async readListCache<T>(namespace: 'languages' | 'regions' | 'currencies') {
    return this.redis.getJson<T[]>(this.listCacheKey(namespace));
  }

  /**
   * 한국어: Redis에 목록 캐시를 기록한다 (TTL 적용).
   * Tiếng Việt: Ghi cache danh sách vào Redis (áp dụng TTL).
   */
  private async writeListCache<T>(namespace: 'languages' | 'regions' | 'currencies', value: T[]) {
    await this.redis.setJson(this.listCacheKey(namespace), value, this.cacheTtlSeconds);
  }

  /**
   * 한국어: 모든 참조 데이터 목록 캐시를 무효화한다.
   *         생성/수정 작업 후 호출하여 다음 조회 시 DB에서 최신 데이터를 가져오도록 한다.
   * Tiếng Việt: Vô hiệu hóa tất cả cache danh sách dữ liệu tham chiếu.
   *             Gọi sau thao tác tạo/sửa để lần truy vấn tiếp theo lấy dữ liệu mới nhất từ DB.
   */
  private async invalidateListCache() {
    await Promise.all([
      this.redis.del(this.listCacheKey('languages')),
      this.redis.del(this.listCacheKey('regions')),
      this.redis.del(this.listCacheKey('currencies')),
    ]);
  }

  // ────────────────────────────────────────────────────────────────
  // 한국어: Language (언어) CRUD
  // Tiếng Việt: CRUD Ngôn ngữ (Language)
  // ────────────────────────────────────────────────────────────────

  /**
   * 한국어: 전체 언어 조회 — Redis 캐시 우선. 캐시 히트 시 메모리에서 skip/take 슬라이싱.
   *         캐시 미스 시 DB 전체 목록을 조회하여 캐시에 저장 후 슬라이싱.
   * Tiếng Việt: Truy vấn tất cả ngôn ngữ — ưu tiên cache Redis. Khi cache hit, cắt skip/take trong bộ nhớ.
   *             Khi cache miss, truy vấn toàn bộ danh sách DB rồi lưu cache và cắt.
   */
  async findAllLanguages(skip: number, take: number) {
    const cached = await this.readListCache<Awaited<ReturnType<PrismaService['language']['findMany']>>[number]>(
      'languages',
    );
    if (cached) return cached.slice(skip, skip + take);

    const rows = await this.prisma.language.findMany({
      orderBy: { createdAt: 'desc' },
    });
    await this.writeListCache('languages', rows);
    return rows.slice(skip, skip + take);
  }

  /**
   * 한국어: 언어 단건 조회 (ID 기준). 캐시 없이 DB 직접 조회.
   * Tiếng Việt: Truy vấn đơn lẻ ngôn ngữ (theo ID). Truy vấn DB trực tiếp không qua cache.
   */
  async findLanguage(id: string) {
    return this.prisma.language.findUnique({ where: { id } });
  }

  /**
   * 한국어: 새 언어 생성. direction 기본값 'LTR', isDefault 기본값 false, isActive 기본값 true.
   *         생성 후 목록 캐시를 무효화한다.
   * Tiếng Việt: Tạo ngôn ngữ mới. direction mặc định 'LTR', isDefault mặc định false, isActive mặc định true.
   *             Vô hiệu hóa cache danh sách sau khi tạo.
   */
  async createLanguage(input: CreateLanguageInput) {
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
    // 한국어: 생성 후 캐시 무효화 — 다음 목록 조회 시 DB에서 최신 데이터 반영
    // Tiếng Việt: Vô hiệu hóa cache sau khi tạo — phản ánh dữ liệu mới nhất từ DB khi truy vấn danh sách tiếp theo
    await this.invalidateListCache();
    return row;
  }

  /**
   * 한국어: 언어 부분 수정 — undefined가 아닌 필드만 갱신하는 partial update 패턴.
   *         수정 후 목록 캐시를 무효화한다.
   * Tiếng Việt: Cập nhật một phần ngôn ngữ — mẫu partial update chỉ cập nhật trường không phải undefined.
   *             Vô hiệu hóa cache danh sách sau khi cập nhật.
   */
  async updateLanguage(id: string, input: Partial<CreateLanguageInput>) {
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
    await this.invalidateListCache();
    return row;
  }

  // ────────────────────────────────────────────────────────────────
  // 한국어: Region (지역) CRUD
  // Tiếng Việt: CRUD Khu vực (Region)
  // ────────────────────────────────────────────────────────────────

  /**
   * 한국어: 전체 지역 조회 — Redis 캐시 우선. 캐시 히트 시 메모리에서 skip/take 슬라이싱.
   * Tiếng Việt: Truy vấn tất cả khu vực — ưu tiên cache Redis. Khi cache hit, cắt skip/take trong bộ nhớ.
   */
  async findAllRegions(skip: number, take: number) {
    const cached = await this.readListCache<Awaited<ReturnType<PrismaService['region']['findMany']>>[number]>(
      'regions',
    );
    if (cached) return cached.slice(skip, skip + take);

    const rows = await this.prisma.region.findMany({
      orderBy: { createdAt: 'desc' },
    });
    await this.writeListCache('regions', rows);
    return rows.slice(skip, skip + take);
  }

  /**
   * 한국어: 지역 단건 조회 (ID 기준).
   * Tiếng Việt: Truy vấn đơn lẻ khu vực (theo ID).
   */
  async findRegion(id: string) {
    return this.prisma.region.findUnique({ where: { id } });
  }

  /**
   * 한국어: 새 지역 생성. 모든 필드 필수. 생성 후 목록 캐시를 무효화한다.
   * Tiếng Việt: Tạo khu vực mới. Tất cả trường bắt buộc. Vô hiệu hóa cache danh sách sau khi tạo.
   */
  async createRegion(input: CreateRegionInput) {
    const row = await this.prisma.region.create({
      data: {
        regionCode: input.regionCode,
        countryCode: input.countryCode,
        regionName: input.regionName,
        currencyCode: input.currencyCode,
        timeZoneCode: input.timeZoneCode,
      },
    });
    await this.invalidateListCache();
    return row;
  }

  /**
   * 한국어: 지역 부분 수정 — undefined가 아닌 필드만 갱신. 수정 후 캐시 무효화.
   * Tiếng Việt: Cập nhật một phần khu vực — chỉ cập nhật trường không phải undefined. Vô hiệu hóa cache sau cập nhật.
   */
  async updateRegion(id: string, input: Partial<CreateRegionInput>) {
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
    await this.invalidateListCache();
    return row;
  }

  // ────────────────────────────────────────────────────────────────
  // 한국어: Currency (통화) CRUD
  // Tiếng Việt: CRUD Tiền tệ (Currency)
  // ────────────────────────────────────────────────────────────────

  /**
   * 한국어: 전체 통화 조회 — Redis 캐시 우선. 캐시 히트 시 메모리에서 skip/take 슬라이싱.
   * Tiếng Việt: Truy vấn tất cả tiền tệ — ưu tiên cache Redis. Khi cache hit, cắt skip/take trong bộ nhớ.
   */
  async findAllCurrencies(skip: number, take: number) {
    const cached = await this.readListCache<Awaited<ReturnType<PrismaService['currency']['findMany']>>[number]>(
      'currencies',
    );
    if (cached) return cached.slice(skip, skip + take);

    const rows = await this.prisma.currency.findMany({
      orderBy: { createdAt: 'desc' },
    });
    await this.writeListCache('currencies', rows);
    return rows.slice(skip, skip + take);
  }

  /**
   * 한국어: 통화 단건 조회 (ID 기준).
   * Tiếng Việt: Truy vấn đơn lẻ tiền tệ (theo ID).
   */
  async findCurrency(id: string) {
    return this.prisma.currency.findUnique({ where: { id } });
  }

  /**
   * 한국어: 새 통화 생성. 모든 필드 필수. 생성 후 목록 캐시를 무효화한다.
   * Tiếng Việt: Tạo tiền tệ mới. Tất cả trường bắt buộc. Vô hiệu hóa cache danh sách sau khi tạo.
   */
  async createCurrency(input: CreateCurrencyInput) {
    const row = await this.prisma.currency.create({
      data: {
        currencyCode: input.currencyCode,
        currencyName: input.currencyName,
        symbol: input.symbol,
        decimalDigits: input.decimalDigits,
        roundingMode: input.roundingMode,
      },
    });
    await this.invalidateListCache();
    return row;
  }

  /**
   * 한국어: 통화 부분 수정 — undefined가 아닌 필드만 갱신. 수정 후 캐시 무효화.
   * Tiếng Việt: Cập nhật một phần tiền tệ — chỉ cập nhật trường không phải undefined. Vô hiệu hóa cache sau cập nhật.
   */
  async updateCurrency(id: string, input: Partial<CreateCurrencyInput>) {
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
    await this.invalidateListCache();
    return row;
  }
}
