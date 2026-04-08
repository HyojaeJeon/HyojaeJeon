import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { CursorPaginationArgs } from '@core/graphql/pagination/cursor-pagination.args';

@ArgsType()
export class SyncEventConnectionArgs extends CursorPaginationArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  edgePosId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eventType?: string;

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
