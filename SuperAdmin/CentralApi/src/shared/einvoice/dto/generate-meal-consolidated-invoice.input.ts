import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class GenerateMealConsolidatedInvoiceInput {
  @Field(() => ID) @IsUUID() corporateId!: string;
  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
}
