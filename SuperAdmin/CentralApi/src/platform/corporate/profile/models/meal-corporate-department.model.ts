import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealCorporateDepartmentModel {
  @Field(() => ID) id!: string;
  @Field() corporateId!: string;
  @Field() departmentCode!: string;
  @Field() departmentName!: string;
  @Field(() => String, { nullable: true }) parentDepartmentId?: string | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
