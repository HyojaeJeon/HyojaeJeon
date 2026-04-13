import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class SyncEventModel {
  @Field(() => ID)
  id!: string;

  @Field()
  edgePosId!: string;

  @Field()
  eventType!: string;

  @Field(() => String, { nullable: true })
  requestId?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  payloadJson?: unknown | null;

  @Field()
  createdAt!: Date;
}
