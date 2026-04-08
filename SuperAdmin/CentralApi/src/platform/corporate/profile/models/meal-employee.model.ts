import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealEmployeeModel {
  @Field(() => ID) id!: string;
  @Field() corporateId!: string;
  @Field(() => String, { nullable: true }) departmentId?: string | null;
  @Field() employeeCode!: string;
  @Field() fullName!: string;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) badgeRfid?: string | null;
  @Field() status!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
