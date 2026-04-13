/**
 * 한국어: 플랫폼 메타데이터 — version, uptime, 서비스 상태를 반환하는 query output 모델.
 * Tiếng Việt: Model metadata nền tảng — phiên bản, uptime, trạng thái dịch vụ.
 */
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlatformServiceStatusModel {
  @Field() database!: string;
  @Field() redis!: string;
}

@ObjectType()
export class PlatformInfoModel {
  @Field() version!: string;
  @Field() nodeVersion!: string;
  @Field(() => Int) uptimeSeconds!: number;
  @Field() environment!: string;
  @Field() timestamp!: string;
  @Field(() => PlatformServiceStatusModel) services!: PlatformServiceStatusModel;
}
