import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@ArgsType()
export class CursorPaginationArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  after?: string;

  @Field(() => Int, { defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  first: number = 50;
}
