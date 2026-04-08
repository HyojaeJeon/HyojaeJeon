import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfoModel } from '@core/graphql/pagination/page-info.model';
import { SyncEventEdgeModel } from './sync-event-edge.model';
import { SyncEventModel } from './sync-event.model';

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
