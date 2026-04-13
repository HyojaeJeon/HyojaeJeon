import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class UpsertNotificationChannelInput {
  @Field() channelType!: string;
  @Field(() => GraphQLJSON, { nullable: true }) config?: unknown;
  @Field({ nullable: true }) isActive?: boolean;
}
