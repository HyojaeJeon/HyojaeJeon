/**
 * 한국어: SyncStatus GraphQL 모델 — Edge POS 단말의 동기화 상태를 표현하는 GraphQL ObjectType.
 *         edgePosId, lastSyncAt, lastHeartbeatAt, status 필드로 구성되며,
 *         SyncResolver를 통해 GraphQL Query로 조회된다.
 * Tiếng Việt: Model GraphQL SyncStatus — ObjectType GraphQL biểu diễn trạng thái đồng bộ của terminal Edge POS.
 *             Gồm các trường edgePosId, lastSyncAt, lastHeartbeatAt, status,
 *             được truy vấn qua GraphQL Query thông qua SyncResolver.
 */
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SyncStatusModel {
  /** 한국어: Edge POS 단말 ID / Tiếng Việt: ID terminal Edge POS */
  @Field() edgePosId!: string;

  /** 한국어: 마지막 동기화 시각 (null이면 동기화 이력 없음) / Tiếng Việt: Thời gian đồng bộ lần cuối (null = chưa có lịch sử đồng bộ) */
  @Field(() => Date, { nullable: true }) lastSyncAt?: Date | null;

  /** 한국어: 마지막 하트비트 시각 (null이면 하트비트 이력 없음) / Tiếng Việt: Thời gian heartbeat lần cuối (null = chưa có lịch sử heartbeat) */
  @Field(() => Date, { nullable: true }) lastHeartbeatAt?: Date | null;

  /** 한국어: 단말 상태 (예: 'Online', 'Offline', 'Unknown') / Tiếng Việt: Trạng thái terminal (ví dụ: 'Online', 'Offline', 'Unknown') */
  @Field() status!: string;
}
