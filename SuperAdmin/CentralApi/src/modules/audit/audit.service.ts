/**
 * 한국어: Audit 서비스 — 감사 로그의 생성(log) 및 조회(findAll, findById)를 담당한다.
 *         다른 모듈에서 AuditService.log()를 호출하여 데이터 변경 이력을 기록한다.
 *         beforeDataJson/afterDataJson은 Prisma.InputJsonValue로 캐스팅하며,
 *         null/undefined인 경우 Prisma.DbNull을 사용한다.
 * Tiếng Việt: Service Audit — phụ trách tạo (log) và truy vấn (findAll, findById) log kiểm toán.
 *             Các module khác gọi AuditService.log() để ghi lại lịch sử thay đổi dữ liệu.
 *             beforeDataJson/afterDataJson được ép kiểu sang Prisma.InputJsonValue,
 *             sử dụng Prisma.DbNull khi giá trị là null/undefined.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogFilterArgs } from './dto/audit-log-filter.args';
import { Prisma } from '@prisma/client';
import { AuditLogConnectionArgs } from './dto/audit-log-connection.args';
import { AuditLogConnectionModel } from './models/audit-log-connection.model';
import {
  decodeDateIdCursor,
  encodeDateIdCursor,
} from '../../common/graphql/cursor.util';

/**
 * 한국어: 감사 로그 생성 시 사용하는 데이터 인터페이스.
 *         actorType과 actionType, targetType은 필수이며, 나머지는 선택.
 * Tiếng Việt: Interface dữ liệu dùng khi tạo log kiểm toán.
 *             actorType, actionType, targetType là bắt buộc, còn lại là tùy chọn.
 */
interface CreateAuditLogData {
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

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filter: {
    actorType?: string;
    actorId?: string;
    actionType?: string;
    targetType?: string;
    targetId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Prisma.AuditLogWhereInput {
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
   * 한국어: 감사 로그 1건을 생성한다. 선택적 필드는 null 또는 Prisma.DbNull로 기본값 처리.
   *         JSON 필드는 Prisma.InputJsonValue로 명시적 캐스팅이 필요하다.
   * Tiếng Việt: Tạo 1 bản ghi log kiểm toán. Các trường tùy chọn được xử lý mặc định là null hoặc Prisma.DbNull.
   *             Các trường JSON cần ép kiểu rõ ràng sang Prisma.InputJsonValue.
   */
  async log(data: CreateAuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        actorType: data.actorType,
        actorId: data.actorId ?? null,
        actionType: data.actionType,
        targetType: data.targetType,
        targetId: data.targetId ?? null,
        requestId: data.requestId ?? null,
        // 한국어: JSON 필드는 undefined일 때 Prisma.DbNull 사용 (null과 구분)
        // Tiếng Việt: Trường JSON dùng Prisma.DbNull khi undefined (phân biệt với null)
        beforeDataJson: data.beforeDataJson as Prisma.InputJsonValue ?? Prisma.DbNull,
        afterDataJson: data.afterDataJson as Prisma.InputJsonValue ?? Prisma.DbNull,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }

  /**
   * 한국어: 필터 조건에 따라 감사 로그 목록을 조회한다.
   *         동적으로 where 조건을 조립하며, 날짜 범위 필터는 createdAt의 gte/lte로 처리한다.
   *         최신순(createdAt desc) 정렬 후 skip/take 페이지네이션 적용.
   * Tiếng Việt: Truy vấn danh sách log kiểm toán theo điều kiện lọc.
   *             Lắp ráp điều kiện where động, bộ lọc phạm vi ngày xử lý bằng gte/lte của createdAt.
   *             Sắp xếp mới nhất (createdAt desc) rồi áp dụng phân trang skip/take.
   */
  async findAll(filter: AuditLogFilterArgs) {
    const where = this.buildWhere(filter);

    return this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: filter.skip,
      take: filter.take,
    });
  }

  async findConnection(filter: AuditLogConnectionArgs): Promise<AuditLogConnectionModel> {
    const baseWhere = this.buildWhere(filter);
    let where = baseWhere;

    if (filter.after) {
      const decodedCursor = decodeDateIdCursor(filter.after);
      const cursorDate = new Date(decodedCursor.createdAt);

      where = {
        AND: [
          baseWhere,
          {
            OR: [
              { createdAt: { lt: cursorDate } },
              {
                AND: [{ createdAt: cursorDate }, { id: { lt: decodedCursor.id } }],
              },
            ],
          },
        ],
      };
    }

    const records = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: filter.first + 1,
    });

    const hasNextPage = records.length > filter.first;
    const nodes = hasNextPage ? records.slice(0, filter.first) : records;
    const edges = nodes.map((node) => ({
      cursor: encodeDateIdCursor({
        createdAt: node.createdAt.toISOString(),
        id: node.id,
      }),
      node,
    }));

    const totalCount = await this.prisma.auditLog.count({ where: baseWhere });

    return {
      edges,
      nodes,
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: Boolean(filter.after),
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges.at(-1)?.cursor ?? null,
      },
    };
  }

  /**
   * 한국어: 감사 로그 단건 조회 (ID 기준).
   * Tiếng Việt: Truy vấn đơn lẻ log kiểm toán (theo ID).
   */
  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
    });
  }
}
