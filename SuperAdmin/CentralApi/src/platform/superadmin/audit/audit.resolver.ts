/**
 * 한국어: Audit 리졸버 — 감사 로그 GraphQL 조회 어댑터.
 *   GraphQL DTO ↔ AuditService POJO criteria 변환과 cursor encode/decode 를 책임진다.
 *   AuditService(core) 는 표현 계층(GraphQL) 을 모른다.
 * Tiếng Việt: Adapter GraphQL cho AuditService — chuyển đổi DTO ↔ POJO + encode cursor.
 */
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { AuditService, AuditLogRow } from '@core/audit/audit.service';
import {
  decodeDateIdCursor,
  encodeDateIdCursor,
} from '@core/graphql/pagination/cursor.util';
import { RequirePermission } from '@core/rbac/decorators/require-permission.decorator';
import { AuditLogModel } from './models/audit-log.model';
import { AuditLogConnectionModel } from './models/audit-log-connection.model';
import { AuditLogFilterArgs } from './dto/audit-log-filter.args';
import { AuditLogConnectionArgs } from './dto/audit-log-connection.args';
import { createListResponse, createObjectResponse } from '@core/response/operation-response.factory';

const AuditLogConnectionModel__Resp = createObjectResponse(AuditLogConnectionModel, 'AuditLogConnectionModelResponse');
const AuditLogModel__ListResp = createListResponse(AuditLogModel, 'AuditLogModelListResponse');
const AuditLogModel__Resp = createObjectResponse(AuditLogModel, 'AuditLogModelResponse');

@Resolver(() => AuditLogModel)
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @RequirePermission('platform.audit.read')
  @Query(() => AuditLogModel__ListResp)
  async auditLogs(@Args() filter: AuditLogFilterArgs): Promise<AuditLogModel[]> {
    const rows = await this.auditService.findAll({
      actorType: filter.actorType,
      actorId: filter.actorId,
      actionType: filter.actionType,
      targetType: filter.targetType,
      targetId: filter.targetId,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      skip: filter.skip,
      take: filter.take,
    });
    return rows as unknown as AuditLogModel[];
  }

  @RequirePermission('platform.audit.read')
  @Query(() => AuditLogConnectionModel__Resp)
  async auditLogConnection(
    @Args() filter: AuditLogConnectionArgs,
  ): Promise<AuditLogConnectionModel> {
    let afterCreatedAt: Date | undefined;
    let afterId: string | undefined;
    if (filter.after) {
      const decoded = decodeDateIdCursor(filter.after);
      afterCreatedAt = new Date(decoded.createdAt);
      afterId = decoded.id;
    }

    const result = await this.auditService.findKeysetPage({
      actorType: filter.actorType,
      actorId: filter.actorId,
      actionType: filter.actionType,
      targetType: filter.targetType,
      targetId: filter.targetId,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      first: filter.first,
      afterCreatedAt,
      afterId,
    });

    const edges = result.nodes.map((node: AuditLogRow) => ({
      cursor: encodeDateIdCursor({
        createdAt: node.createdAt.toISOString(),
        id: node.id,
      }),
      node: node as unknown as AuditLogModel,
    }));

    return {
      edges,
      nodes: result.nodes as unknown as AuditLogModel[],
      totalCount: result.totalCount,
      pageInfo: {
        hasNextPage: result.hasNextPage,
        hasPreviousPage: Boolean(filter.after),
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges.at(-1)?.cursor ?? null,
      },
    };
  }

  @RequirePermission('platform.audit.read')
  @Query(() => AuditLogModel__Resp, { nullable: true })
  async auditLog(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AuditLogModel | null> {
    const row = await this.auditService.findById(id);
    return row as unknown as AuditLogModel | null;
  }
}
