/**
 * 한국어: AuditService — 감사 로그 record + query 의 단일 진실 원본.
 *   순수 인프라 서비스로, GraphQL DTO / cursor 인코딩 같은 표현 계층 의존이 없다.
 *   plain POJO criteria 와 plain POJO page 결과만 다룬다. resolver 가 DTO 변환을 책임진다.
 *
 * Tiếng Việt: AuditService — service hạ tầng thuần, không phụ thuộc DTO GraphQL.
 */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/Prisma.service';

/**
 * 한국어: 감사 로그 생성 시 사용하는 데이터 인터페이스.
 */
export interface CreateAuditLogData {
  actorType: string;
  actorId?: string;
  actionType: string;
  targetType: string;
  targetId?: string;
  requestId?: string;
  beforeDataJson?: unknown;
  afterDataJson?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 한국어: 감사 로그 검색 criteria — GraphQL DTO 와 무관한 plain POJO.
 */
export interface AuditLogCriteria {
  actorType?: string;
  actorId?: string;
  actionType?: string;
  targetType?: string;
  targetId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * 한국어: offset 페이지네이션 입력.
 */
export interface AuditLogOffsetPage extends AuditLogCriteria {
  skip: number;
  take: number;
}

/**
 * 한국어: keyset(createdAt, id) 페이지네이션 입력.
 *   cursor 는 service 가 반환할 때만 만든다 — 인코딩/디코딩은 resolver 책임.
 */
export interface AuditLogKeysetPage extends AuditLogCriteria {
  first: number;
  afterCreatedAt?: Date;
  afterId?: string;
}

export interface AuditLogRow {
  id: string;
  actorType: string;
  actorId: string | null;
  actionType: string;
  targetType: string;
  targetId: string | null;
  requestId: string | null;
  beforeDataJson: Prisma.JsonValue | null;
  afterDataJson: Prisma.JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

/**
 * 한국어: keyset 결과 — node + 다음 페이지 여부 + 총 개수.
 *   cursor 인코딩 없이 raw row 만 돌려준다.
 */
export interface AuditLogKeysetResult {
  nodes: AuditLogRow[];
  hasNextPage: boolean;
  totalCount: number;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filter: AuditLogCriteria): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (filter.actorType) where.actorType = filter.actorType;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.actionType) where.actionType = filter.actionType;
    if (filter.targetType) where.targetType = filter.targetType;
    if (filter.targetId) where.targetId = filter.targetId;

    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = filter.dateFrom;
      if (filter.dateTo) where.createdAt.lte = filter.dateTo;
    }

    return where;
  }

  /**
   * 한국어: 감사 로그 1건을 생성한다.
   */
  async log(data: CreateAuditLogData) {
    return this.prisma.auditLog.create({
      data: this.toCreateRow(data),
    });
  }

  /**
   * 한국어: 감사 로그를 배치로 작성한다. (P1-7)
   *   대량 마이그레이션/배치 작업에서 row-by-row create 로 인한 성능 저하를 피하기 위해
   *   prisma.auditLog.createMany 를 사용한다. createdAt/id 는 Prisma default 로 채워지며
   *   returning 은 count 만 반환한다 (fine-grained id 가 필요한 경우 log() 를 사용).
   *
   * Tiếng Việt: Ghi audit log hàng loạt — tối ưu cho batch/migration.
   */
  async logMany(entries: CreateAuditLogData[]): Promise<{ count: number }> {
    if (entries.length === 0) return { count: 0 };
    const rows = entries.map((entry) => this.toCreateRow(entry));
    const result = await this.prisma.auditLog.createMany({
      data: rows,
      skipDuplicates: true,
    });
    return { count: result.count };
  }

  private toCreateRow(data: CreateAuditLogData): Prisma.AuditLogCreateManyInput {
    return {
      actorType: data.actorType,
      actorId: data.actorId ?? null,
      actionType: data.actionType,
      targetType: data.targetType,
      targetId: data.targetId ?? null,
      requestId: data.requestId ?? null,
      beforeDataJson: (data.beforeDataJson as Prisma.InputJsonValue) ?? Prisma.DbNull,
      afterDataJson: (data.afterDataJson as Prisma.InputJsonValue) ?? Prisma.DbNull,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    };
  }

  /**
   * 한국어: offset 페이지네이션 조회.
   */
  async findAll(page: AuditLogOffsetPage): Promise<AuditLogRow[]> {
    return this.prisma.auditLog.findMany({
      where: this.buildWhere(page),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: page.skip,
      take: page.take,
    });
  }

  /**
   * 한국어: keyset 페이지네이션 조회. cursor 인코딩/디코딩은 호출자가 수행한다.
   *   반환된 nodes 의 마지막 요소(createdAt, id) 가 다음 페이지 cursor 가 된다.
   */
  async findKeysetPage(page: AuditLogKeysetPage): Promise<AuditLogKeysetResult> {
    const baseWhere = this.buildWhere(page);
    let where: Prisma.AuditLogWhereInput = baseWhere;

    if (page.afterCreatedAt && page.afterId) {
      where = {
        AND: [
          baseWhere,
          {
            OR: [
              { createdAt: { lt: page.afterCreatedAt } },
              {
                AND: [{ createdAt: page.afterCreatedAt }, { id: { lt: page.afterId } }],
              },
            ],
          },
        ],
      };
    }

    const records = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: page.first + 1,
    });

    const hasNextPage = records.length > page.first;
    const nodes = (hasNextPage ? records.slice(0, page.first) : records) as AuditLogRow[];
    const totalCount = await this.prisma.auditLog.count({ where: baseWhere });

    return { nodes, hasNextPage, totalCount };
  }

  /**
   * 한국어: 감사 로그 단건 조회 (ID 기준).
   */
  async findById(id: string): Promise<AuditLogRow | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
    });
  }
}
