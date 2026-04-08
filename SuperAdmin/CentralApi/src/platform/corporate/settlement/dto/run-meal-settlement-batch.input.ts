import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class RunMealSettlementBatchInput {
  @Field(() => ID) @IsUUID() brandHqId!: string;
  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
}
