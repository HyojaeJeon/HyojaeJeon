/**
 * 한국어: Edge POS 터미널 GraphQL 모델.
 *   지점(Branch)에 설치된 개별 POS 단말기를 표현하는 ObjectType이다.
 *   터미널 코드, 역할(Main/Sub), 앱 버전, DB 버전, 마지막 동기화/하트비트 시각 등
 *   단말기 운영에 필요한 핵심 정보를 포함한다.
 *   CentralApi에서 각 Edge POS 기기의 상태를 중앙 관리한다.
 *
 * Tiếng Việt: Model GraphQL Terminal Edge POS.
 *   ObjectType biểu diễn thiết bị POS riêng lẻ được cài đặt tại chi nhánh (Branch).
 *   Bao gồm các thông tin cốt lõi cho vận hành thiết bị như mã terminal,
 *   vai trò (Main/Sub), phiên bản app, phiên bản DB,
 *   thời gian đồng bộ/heartbeat cuối cùng.
 *   CentralApi quản lý trạng thái tập trung của từng thiết bị Edge POS.
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class EdgePosTerminalModel {
  /** 한국어: 터미널 고유 식별자 (UUID) / Tiếng Việt: Định danh duy nhất terminal (UUID) */
  @Field(() => ID)
  id!: string;

  /** 한국어: 소속 지점 ID / Tiếng Việt: ID chi nhánh sở thuộc */
  @Field()
  branchId!: string;

  /** 한국어: 터미널 코드 (매장 내 고유 식별) / Tiếng Việt: Mã terminal (định danh duy nhất trong cửa hàng) */
  @Field()
  terminalCode!: string;

  /** 한국어: 터미널 이름 / Tiếng Việt: Tên terminal */
  @Field()
  terminalName!: string;

  /**
   * 한국어: 터미널 역할. 'Main' = 주 POS, 'Sub' = 보조 POS.
   * Tiếng Việt: Vai trò terminal. 'Main' = POS chính, 'Sub' = POS phụ.
   */
  @Field()
  terminalRole!: string;

  /** 한국어: 설치된 앱 버전 / Tiếng Việt: Phiên bản app đã cài đặt */
  @Field()
  appVersion!: string;

  /** 한국어: 로컬 DB 스키마 버전 / Tiếng Việt: Phiên bản schema DB cục bộ */
  @Field()
  dbVersion!: string;

  /** 한국어: 터미널 상태 (예: 'Active', 'Offline', 'Decommissioned') / Tiếng Việt: Trạng thái terminal (vd: 'Active', 'Offline', 'Decommissioned') */
  @Field()
  status!: string;

  /** 한국어: 마지막 동기화 시각 (선택) / Tiếng Việt: Thời gian đồng bộ cuối cùng (tùy chọn) */
  @Field(() => Date, { nullable: true })
  lastSyncAt?: Date | null;

  /** 한국어: 마지막 하트비트 수신 시각 (선택) / Tiếng Việt: Thời gian nhận heartbeat cuối cùng (tùy chọn) */
  @Field(() => Date, { nullable: true })
  lastHeartbeatAt?: Date | null;

  /** 한국어: 레코드 생성 시각 / Tiếng Việt: Thời gian tạo bản ghi */
  @Field()
  createdAt!: Date;

  /** 한국어: 레코드 마지막 수정 시각 / Tiếng Việt: Thời gian cập nhật bản ghi cuối cùng */
  @Field()
  updatedAt!: Date;
}
