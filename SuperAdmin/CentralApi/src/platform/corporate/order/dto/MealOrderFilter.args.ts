/**
 * [KO] MealOrderFilterArgs — 주문 목록 조회 시 필터링 인자.
 *      기본 PaginationArgs(skip, take)를 확장하여 상태(status) 필터를 추가한다.
 *
 * [VI] MealOrderFilterArgs — Tham số lọc khi truy vấn danh sách đơn hàng.
 *      Mở rộng PaginationArgs (skip, take) cơ bản, thêm bộ lọc trạng thái (status).
 */
import { ArgsType, Field } from '@nestjs/graphql';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationArgs } from '@core/graphql/pagination/Pagination.args';

/** [KO] 유효한 주문 상태 값 목록 / [VI] Danh sách giá trị trạng thái đơn hàng hợp lệ */
const VALID_ORDER_STATUSES = [
  'PAID_PENDING_ACCEPT',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED_BY_USER',
  'REJECTED',
  'EXPIRED',
] as const;

@ArgsType()
export class MealOrderFilterArgs extends PaginationArgs {
  /**
   * [KO] 상태 필터 (선택) — 특정 상태의 주문만 조회할 때 사용.
   * [VI] Bộ lọc trạng thái (tùy chọn) — dùng khi chỉ muốn xem đơn hàng ở trạng thái cụ thể.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(VALID_ORDER_STATUSES)
  status?: string;
}
