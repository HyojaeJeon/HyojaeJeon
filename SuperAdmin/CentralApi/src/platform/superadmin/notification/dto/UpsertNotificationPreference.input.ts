import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpsertNotificationPreferenceInput {
  @Field() eventType!: string;
  @Field(() => [String]) channels!: string[];
  @Field({ nullable: true }) isEnabled?: boolean;
}
