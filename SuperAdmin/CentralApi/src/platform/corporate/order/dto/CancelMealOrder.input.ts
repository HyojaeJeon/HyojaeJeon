/**
 * [KO] CancelMealOrderInput — 주문 취소 입력 DTO.
 *      주문 ID와 취소 사유를 전달한다.
 *
 * [VI] CancelMealOrderInput — DTO đầu vào hủy đơn hàng.
 *      Truyền ID đơn hàng và lý do hủy.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class CancelMealOrderInput {
  /** [KO] 취소 대상 주문 ID / [VI] ID đơn hàng cần hủy */
  @Field(() => ID)
  @IsUUID()
  id!: string;

  /**
   * [KO] 취소 사유 (선택). 사용자가 입력한 자유 텍스트.
   * [VI] Lý do hủy (tùy chọn). Văn bản tự do do người dùng nhập.
   */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
