import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfoModel } from '../../../common/graphql/page-info.model';
import { AuditLogEdgeModel } from './audit-log-edge.model';
import { AuditLogModel } from './audit-log.model';

@ObjectType()
export class AuditLogConnectionModel {
  @Field(() => [AuditLogEdgeModel])
  edges!: AuditLogEdgeModel[];

  @Field(() => [AuditLogModel])
  nodes!: AuditLogModel[];

  @Field(() => PageInfoModel)
  pageInfo!: PageInfoModel;

  @Field(() => Int)
  totalCount!: number;
}
