import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMealEmployeeInput {
  @Field(() => ID) @IsUUID() corporateId!: string;
  @Field(() => ID, { nullable: true }) @IsOptional() @IsUUID() departmentId?: string;
  @Field() @IsString() employeeCode!: string;
  @Field() @IsString() fullName!: string;
  @Field(() => String, { nullable: true }) @IsOptional() email?: string;
  @Field(() => String, { nullable: true }) @IsOptional() phone?: string;
  @Field(() => String, { nullable: true }) @IsOptional() badgeRfid?: string;
}
