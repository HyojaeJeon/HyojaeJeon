import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfoModel } from '@core/graphql/pagination/PageInfo.model';
import { SyncEventEdgeModel } from './SyncEventEdge.model';
import { SyncEventModel } from './SyncEvent.model';

@ObjectType()
export class SyncEventConnectionModel {
  @Field(() => [SyncEventEdgeModel])
  edges!: SyncEventEdgeModel[];

  @Field(() => [SyncEventModel])
  nodes!: SyncEventModel[];

  @Field(() => PageInfoModel)
  pageInfo!: PageInfoModel;

  @Field(() => Int)
  totalCount!: number;
}
