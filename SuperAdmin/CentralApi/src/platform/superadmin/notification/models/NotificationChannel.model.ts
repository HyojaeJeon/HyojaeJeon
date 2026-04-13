import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class NotificationChannelModel {
  @Field(() => ID) id!: string;
  @Field() userId!: string;
  @Field() userType!: string;
  @Field() channelType!: string;
  @Field(() => GraphQLJSON) config!: unknown;
  @Field() isActive!: boolean;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
