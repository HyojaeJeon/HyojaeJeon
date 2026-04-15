/**
 * [KO] CreateMealOrderInput — 앱 기반 식사 주문 생성 입력 DTO.
 *      직원이 모바일 앱에서 메뉴를 선택하고 결제를 요청할 때 사용한다.
 *      items 배열로 주문 항목(메뉴명, 수량, 단가, 옵션)을 전달한다.
 *
 * [VI] CreateMealOrderInput — DTO đầu vào tạo đơn hàng bữa ăn qua ứng dụng.
 *      Dùng khi nhân viên chọn menu và yêu cầu thanh toán qua ứng dụng di động.
 *      Truyền danh sách mục đơn hàng (tên menu, số lượng, đơn giá, tùy chọn) qua mảng items.
 */
import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { GraphQLJSON } from 'graphql-scalars';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from '@core/validation/bigintValidators';

/**
 * [KO] 주문 항목 입력 — 메뉴 이름, 수량, 단가, 옵션 JSON.
 * [VI] Mục đơn hàng đầu vào — tên menu, số lượng, đơn giá, JSON tùy chọn.
 */
@InputType()
export class MealOrderItemInput {
  /** [KO] 메뉴 항목 이름 (주문 시점 스냅샷) / [VI] Tên mục menu (snapshot lúc đặt) */
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  menuItemName!: string;

  /** [KO] 수량 (최소 1) / [VI] Số lượng (tối thiểu 1) */
  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  /** [KO] 단가 (VND, bigint, 양수 필수) / [VI] Đơn giá (VND, bigint, phải dương) */
  @Field(() => GraphQLBigInt)
  @IsBigIntMin(1n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  unitPriceVnd!: bigint;

  /**
   * [KO] 선택 옵션 JSON — 사이즈, 토핑, 특별 요청 등 (선택).
   *      기본값은 빈 배열([]).
   * [VI] JSON tùy chọn — size, topping, yêu cầu đặc biệt (tùy chọn).
   *      Mặc định là mảng rỗng ([]).
   */
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  optionsJson?: unknown;
}

@InputType()
export class CreateMealOrderInput {
  /** [KO] 결제에 사용할 지갑 ID / [VI] ID ví dùng để thanh toán */
  @Field(() => ID)
  @IsUUID()
  walletId!: string;

  /** [KO] 주문 대상 브랜드 본사 ID / [VI] ID trụ sở thương hiệu nhận đơn */
  @Field(() => ID)
  @IsUUID()
  brandHqId!: string;

  /** [KO] 주문 대상 지점 ID / [VI] ID chi nhánh nhận đơn */
  @Field(() => ID)
  @IsUUID()
  branchId!: string;

  /**
   * [KO] 주문 유형.
   *      - 'ONSITE': 현장 주문
   *      - 'PRE_ORDER': 사전 주문
   * [VI] Loại đơn hàng.
   *      - 'ONSITE': đặt tại chỗ
   *      - 'PRE_ORDER': đặt trước
   */
  @Field()
  @IsIn(['ONSITE', 'PRE_ORDER'])
  orderType!: string;

  /**
   * [KO] 식사 유형.
   *      - 'DINE_IN': 매장 내 식사
   *      - 'TAKEOUT': 포장
   * [VI] Loại dùng bữa.
   *      - 'DINE_IN': ăn tại chỗ
   *      - 'TAKEOUT': mang về
   */
  @Field()
  @IsIn(['DINE_IN', 'TAKEOUT'])
  diningType!: string;

  /**
   * [KO] 예약 시각 — PRE_ORDER 시 수령 예정 시각. ONSITE는 현재 시각 사용.
   * [VI] Thời điểm hẹn — giờ nhận cho PRE_ORDER. ONSITE dùng thời gian hiện tại.
   */
  @Field(() => Date, { nullable: true })
  @IsOptional()
  scheduledAt?: Date;

  /** [KO] 테이블 번호 (DINE_IN 시) / [VI] Số bàn (khi DINE_IN) */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tableNo?: string;

  /** [KO] 사용자 GPS 위도 (사기 방지 검증용) / [VI] Vĩ độ GPS người dùng (kiểm tra gian lận) */
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  userLatitude?: number;

  /** [KO] 사용자 GPS 경도 (사기 방지 검증용) / [VI] Kinh độ GPS người dùng (kiểm tra gian lận) */
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  userLongitude?: number;

  /**
   * [KO] 멱등성 키 — 동일 키로 중복 요청 시 기존 주문을 반환한다.
   *      클라이언트(앱)에서 주문별로 고유한 값을 생성해야 한다.
   * [VI] Khóa idempotency — nếu trùng khóa thì trả về đơn hàng cũ.
   *      Client (ứng dụng) phải tạo giá trị duy nhất cho mỗi đơn hàng.
   */
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  idempotencyKey!: string;

  /**
   * [KO] 주문 항목 배열 — 최소 1개 필수.
   * [VI] Mảng mục đơn hàng — tối thiểu 1 mục.
   */
  @Field(() => [MealOrderItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MealOrderItemInput)
  items!: MealOrderItemInput[];
}
