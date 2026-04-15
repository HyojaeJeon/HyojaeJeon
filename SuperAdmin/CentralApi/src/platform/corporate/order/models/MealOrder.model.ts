/**
 * [KO] MealOrder GraphQL 모델
 *
 * VMeal 식권 플랫폼의 앱 기반 식사 주문 1건을 표현하는 GraphQL ObjectType이다.
 * 직원이 모바일 앱에서 메뉴를 선택하고 결제하면 이 레코드가 생성된다.
 *
 * 주문은 두 축에 속한다:
 *   - corporate 축: 어느 기업(corporateId)의 직원 지갑(walletId)에서 결제했는가
 *   - brand 축: 어느 브랜드(brandHqId) / 지점(branchId)에서 주문이 발생했는가
 *
 * status 흐름:
 *   PAID_PENDING_ACCEPT → ACCEPTED → PREPARING → READY → COMPLETED
 *   또는 → CANCELLED_BY_USER | REJECTED | EXPIRED
 *
 * [VI] Model GraphQL MealOrder
 *
 * ObjectType biểu diễn một đơn hàng bữa ăn trên nền tảng VMeal.
 * Khi nhân viên chọn menu và thanh toán qua ứng dụng, bản ghi này được tạo.
 *
 * Đơn hàng thuộc hai trục:
 *   - Trục corporate: ví nhân viên (walletId) của doanh nghiệp nào (corporateId)
 *   - Trục brand: đơn hàng phát sinh tại thương hiệu (brandHqId) / chi nhánh (branchId) nào
 *
 * Luồng status:
 *   PAID_PENDING_ACCEPT → ACCEPTED → PREPARING → READY → COMPLETED
 *   hoặc → CANCELLED_BY_USER | REJECTED | EXPIRED
 */
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { MealOrderItemModel } from './MealOrderItem.model';

@ObjectType()
export class MealOrderModel {
  /** [KO] 주문 고유 식별자 (UUID) / [VI] Mã định danh duy nhất đơn hàng (UUID) */
  @Field(() => ID) id!: string;

  /** [KO] 결제에 사용된 직원 식권 지갑 ID / [VI] ID ví phiếu ăn nhân viên dùng để thanh toán */
  @Field() walletId!: string;

  /** [KO] 이 주문이 속한 기업(Corporate) ID / [VI] ID doanh nghiệp sở hữu đơn hàng */
  @Field() corporateId!: string;

  /** [KO] 주문이 발생한 브랜드 본사(BrandHQ) ID / [VI] ID trụ sở thương hiệu nơi phát sinh đơn hàng */
  @Field() brandHqId!: string;

  /** [KO] 주문이 발생한 지점(Branch) ID / [VI] ID chi nhánh nơi phát sinh đơn hàng */
  @Field() branchId!: string;

  /**
   * [KO] 주문 번호 — 사람이 읽을 수 있는 짧은 코드.
   *      형식: ORD-YYYYMMDD-XXXX (4자리 랜덤 영숫자).
   * [VI] Số đơn hàng — mã ngắn con người đọc được.
   *      Định dạng: ORD-YYYYMMDD-XXXX (4 ký tự chữ-số ngẫu nhiên).
   */
  @Field() orderNo!: string;

  /**
   * [KO] 주문 유형.
   *      - 'ONSITE': 현장 주문 — 매장에서 즉시 메뉴 선택
   *      - 'PRE_ORDER': 사전 주문 — 미리 예약 후 지정 시간에 수령
   * [VI] Loại đơn hàng.
   *      - 'ONSITE': đặt tại chỗ — chọn menu ngay tại cửa hàng
   *      - 'PRE_ORDER': đặt trước — đặt trước và nhận vào giờ chỉ định
   */
  @Field() orderType!: string;

  /**
   * [KO] 식사 유형.
   *      - 'DINE_IN': 매장 내 식사
   *      - 'TAKEOUT': 포장/테이크아웃
   * [VI] Loại dùng bữa.
   *      - 'DINE_IN': ăn tại chỗ
   *      - 'TAKEOUT': mang về
   */
  @Field() diningType!: string;

  /**
   * [KO] 주문 상태.
   *      - 'PAID_PENDING_ACCEPT': 결제 완료, 가맹점 수락 대기
   *      - 'ACCEPTED': 가맹점 수락됨
   *      - 'PREPARING': 조리 중
   *      - 'READY': 준비 완료 (수령 대기)
   *      - 'COMPLETED': 완료
   *      - 'CANCELLED_BY_USER': 사용자 취소
   *      - 'REJECTED': 가맹점 거절
   *      - 'EXPIRED': 만료
   * [VI] Trạng thái đơn hàng.
   *      - 'PAID_PENDING_ACCEPT': đã thanh toán, chờ cửa hàng chấp nhận
   *      - 'ACCEPTED': cửa hàng đã chấp nhận
   *      - 'PREPARING': đang chế biến
   *      - 'READY': sẵn sàng (chờ nhận)
   *      - 'COMPLETED': hoàn thành
   *      - 'CANCELLED_BY_USER': người dùng hủy
   *      - 'REJECTED': cửa hàng từ chối
   *      - 'EXPIRED': hết hạn
   */
  @Field() status!: string;

  /** [KO] 총 주문 금액 (VND, bigint) / [VI] Tổng tiền đơn hàng (VND, bigint) */
  @Field(() => GraphQLBigInt) totalAmountVnd!: bigint;

  /** [KO] 회사 부담 금액 (VND) — 회사 지원금에서 차감된 몫 / [VI] Phần công ty chi trả (VND) */
  @Field(() => GraphQLBigInt) companyShareVnd!: bigint;

  /** [KO] 직원 부담 금액 (VND) — 개인 충전금에서 차감된 몫 / [VI] Phần nhân viên chi trả (VND) */
  @Field(() => GraphQLBigInt) employeeShareVnd!: bigint;

  /**
   * [KO] 예약 시각 — PRE_ORDER의 수령 예정 시각 또는 ONSITE의 주문 시각.
   * [VI] Thời điểm hẹn — giờ nhận cho PRE_ORDER hoặc giờ đặt cho ONSITE.
   */
  @Field() scheduledAt!: Date;

  /** [KO] 테이블 번호 (매장 내 식사 시) / [VI] Số bàn (khi ăn tại chỗ) */
  @Field(() => String, { nullable: true }) tableNo?: string | null;

  /** [KO] QR 체크인 시각 / [VI] Thời điểm check-in QR */
  @Field(() => Date, { nullable: true }) checkedInAt?: Date | null;

  /** [KO] 사용자 위도 (GPS 사기 방지용) / [VI] Vĩ độ người dùng (chống gian lận GPS) */
  @Field(() => Float, { nullable: true }) userLatitude?: number | null;

  /** [KO] 사용자 경도 (GPS 사기 방지용) / [VI] Kinh độ người dùng (chống gian lận GPS) */
  @Field(() => Float, { nullable: true }) userLongitude?: number | null;

  /** [KO] 멱등성 키 — 중복 주문 방지 / [VI] Khóa idempotency — ngăn đặt trùng */
  @Field() idempotencyKey!: string;

  /** [KO] 가맹점 수락 시각 / [VI] Thời điểm cửa hàng chấp nhận */
  @Field(() => Date, { nullable: true }) acceptedAt?: Date | null;

  /** [KO] 주문 완료 시각 / [VI] Thời điểm hoàn thành đơn hàng */
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;

  /** [KO] 취소 시각 / [VI] Thời điểm hủy */
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;

  /** [KO] 취소 사유 / [VI] Lý do hủy */
  @Field(() => String, { nullable: true }) cancelReason?: string | null;

  /** [KO] 만료 시각 / [VI] Thời điểm hết hạn */
  @Field(() => Date, { nullable: true }) expiresAt?: Date | null;

  /** [KO] 레코드 생성 시각 / [VI] Thời điểm tạo bản ghi */
  @Field() createdAt!: Date;

  /** [KO] 레코드 최종 수정 시각 / [VI] Thời điểm cập nhật cuối */
  @Field() updatedAt!: Date;

  /** [KO] 주문 항목 목록 / [VI] Danh sách mục đơn hàng */
  @Field(() => [MealOrderItemModel]) items!: MealOrderItemModel[];
}
