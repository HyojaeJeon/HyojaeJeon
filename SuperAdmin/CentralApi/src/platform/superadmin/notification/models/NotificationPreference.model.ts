import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationPreferenceModel {
  @Field(() => ID) id!: string;
  @Field() userId!: string;
  @Field() userType!: string;
  @Field() eventType!: string;
  @Field(() => [String]) channels!: string[];
  @Field() isEnabled!: boolean;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
