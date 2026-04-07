import { Field, ObjectType } from '@nestjs/graphql';
import { SyncEventModel } from './sync-event.model';

@ObjectType()
export class SyncEventEdgeModel {
  @Field()
  cursor!: string;

  @Field(() => SyncEventModel)
  node!: SyncEventModel;
}
