import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfoModel } from '@core/graphql/pagination/PageInfo.model';
import { AuditLogEdgeModel } from './AuditLogEdge.model';
import { AuditLogModel } from './AuditLog.model';

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
