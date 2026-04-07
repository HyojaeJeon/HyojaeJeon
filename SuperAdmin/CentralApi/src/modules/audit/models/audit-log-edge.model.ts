import { Field, ObjectType } from '@nestjs/graphql';
import { AuditLogModel } from './audit-log.model';

@ObjectType()
export class AuditLogEdgeModel {
  @Field()
  cursor!: string;

  @Field(() => AuditLogModel)
  node!: AuditLogModel;
}
