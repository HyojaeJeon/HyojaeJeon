import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMealDepartmentInput {
  @Field(() => ID) @IsUUID() corporateId!: string;
  @Field() @IsString() departmentCode!: string;
  @Field() @IsString() departmentName!: string;
  @Field(() => ID, { nullable: true }) @IsOptional() @IsUUID() parentDepartmentId?: string;
}
