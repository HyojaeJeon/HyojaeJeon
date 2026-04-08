/**
 * 상향 동기화 요청 DTO
 * 한국어: Edge POS에서 중앙 서버로 보내는 상향 sync 페이로드의 유효성 검사 DTO.
 *         설계 기준서의 공통 봉투 규격(v, requestId, timestamp, idempotencyKey)을 준수한다.
 * Tiếng Việt: DTO kiểm tra tính hợp lệ cho payload sync hướng lên từ Edge POS đến máy chủ trung tâm.
 *             Tuân thủ quy cách phong bì chung của tài liệu thiết kế (v, requestId, timestamp, idempotencyKey).
 */
import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class UpstreamSyncInput {
  /** 한국어: 프로토콜 버전 / Tiếng Việt: Phiên bản giao thức */
  @IsNumber()
  v!: number;

  /** 한국어: 요청 고유 ID (멱등성 검사 기준) / Tiếng Việt: ID yêu cầu duy nhất (tiêu chí kiểm tra idempotency) */
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  /** 한국어: 요청 타임스탬프 / Tiếng Việt: Timestamp yêu cầu */
  @IsString()
  @IsNotEmpty()
  timestamp!: string;

  /** 한국어: 멱등성 키 — requestId와 함께 중복 처리 방지 / Tiếng Việt: Khóa idempotency — ngăn xử lý trùng cùng requestId */
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  /** 한국어: 송신 Edge POS 단말 ID / Tiếng Việt: ID terminal Edge POS gửi */
  @IsString()
  @IsNotEmpty()
  edgePosId!: string;

  /** 한국어: 이벤트 유형 (예: ORDER_CREATED, PAYMENT_COMPLETED) / Tiếng Việt: Loại sự kiện (ví dụ: ORDER_CREATED, PAYMENT_COMPLETED) */
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  /** 한국어: 이벤트 데이터 (JSON) / Tiếng Việt: Dữ liệu sự kiện (JSON) */
  @IsObject()
  dataJson!: unknown;
}
