import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { CursorPaginationArgs } from '@core/graphql/pagination/CursorPagination.args';

@ArgsType()
export class AuditLogConnectionArgs extends CursorPaginationArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actorType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  targetId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;
}
