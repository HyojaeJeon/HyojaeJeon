/**
 * 한국어: AuditLog 필터 Args — 감사 로그 목록 조회 시 사용하는 필터/페이지네이션 DTO.
 *         actorType, actorId, actionType, targetType, targetId로 필터링하고,
 *         dateFrom/dateTo로 날짜 범위를 지정할 수 있다.
 *         class-validator 데코레이터로 입력값의 유효성을 검증한다.
 * Tiếng Việt: Args bộ lọc AuditLog — DTO bộ lọc/phân trang dùng khi truy vấn danh sách log kiểm toán.
 *             Lọc theo actorType, actorId, actionType, targetType, targetId,
 *             và có thể chỉ định phạm vi ngày bằng dateFrom/dateTo.
 *             Xác thực giá trị đầu vào bằng decorator class-validator.
 */
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsDate, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class AuditLogFilterArgs {
  /** 한국어: 행위자 유형 필터 (예: 'USER', 'SYSTEM') / Tiếng Việt: Bộ lọc loại tác nhân (ví dụ: 'USER', 'SYSTEM') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actorType?: string;

  /** 한국어: 행위자 ID 필터 (UUID 형식) / Tiếng Việt: Bộ lọc ID tác nhân (định dạng UUID) */
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  /** 한국어: 행위 유형 필터 (예: 'CREATE', 'DELETE') / Tiếng Việt: Bộ lọc loại hành động (ví dụ: 'CREATE', 'DELETE') */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionType?: string;

  /** 한국어: 대상 엔티티 유형 필터 / Tiếng Việt: Bộ lọc loại entity đích */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetType?: string;

  /** 한국어: 대상 엔티티 ID 필터 (UUID 형식) / Tiếng Việt: Bộ lọc ID entity đích (định dạng UUID) */
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  targetId?: string;

  /** 한국어: 조회 시작 일시 (이 시점 이후의 로그만 반환) / Tiếng Việt: Thời gian bắt đầu truy vấn (chỉ trả về log sau thời điểm này) */
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  /** 한국어: 조회 종료 일시 (이 시점 이전의 로그만 반환) / Tiếng Việt: Thời gian kết thúc truy vấn (chỉ trả về log trước thời điểm này) */
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;

  /** 한국어: 건너뛸 레코드 수 (기본값: 0) / Tiếng Việt: Số bản ghi bỏ qua (mặc định: 0) */
  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;

  /** 한국어: 조회할 레코드 수 (기본값: 50, 최대: 200) / Tiếng Việt: Số bản ghi truy vấn (mặc định: 50, tối đa: 200) */
  @Field(() => Int, { defaultValue: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  take: number = 50;
}
