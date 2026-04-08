import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class GrantBrandHqCapabilityInput {
  @Field(() => ID)
  @IsUUID()
  brandHqId!: string;

  @Field()
  @IsString()
  @IsIn(['POS', 'MEAL_TICKET'])
  capability!: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expiresAt?: Date | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  contractRef?: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  startAsTrial?: boolean;
}
