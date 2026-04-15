/**
 * [KO] MealTransaction GraphQL 모델
 *
 * 식권(Meal Ticket) 거래 1건을 표현하는 GraphQL ObjectType이다.
 * POS 단말(EdgePos) 또는 모바일 앱에서 직원이 식사 결제를 요청하면,
 * CentralApi가 승인/거절 판정 후 이 레코드를 생성한다.
 *
 * 거래는 크게 두 축에 속한다:
 *   - corporate 축: 어느 기업(corporateId)의 직원 지갑(walletId)에서 결제했는가
 *   - brand 축: 어느 브랜드(brandHqId) / 지점(branchId) / 단말(terminalId)에서 결제가 발생했는가
 *
 * status 흐름: APPROVED -> SETTLED (정산 완료) 또는 APPROVED -> REVERSED (취소/환불)
 *             DECLINED (거절 — 정책 위반, 잔액 부족, 비활성 상태 등)
 *
 * [VI] Model GraphQL MealTransaction
 *
 * ObjectType biểu diễn một giao dịch phiếu ăn (Meal Ticket).
 * Khi nhân viên yêu cầu thanh toán bữa ăn từ POS hoặc ứng dụng di động,
 * CentralApi phê duyệt hoặc từ chối và tạo bản ghi này.
 *
 * Giao dịch thuộc hai trục:
 *   - Trục corporate: ví nhân viên (walletId) của doanh nghiệp nào (corporateId)
 *   - Trục brand: thanh toán phát sinh tại thương hiệu (brandHqId) / chi nhánh (branchId) / thiết bị (terminalId) nào
 *
 * Luồng status: APPROVED -> SETTLED (đã quyết toán) hoặc APPROVED -> REVERSED (đảo/hoàn)
 *              DECLINED (từ chối — vi phạm chính sách, thiếu số dư, trạng thái không hoạt động, v.v.)
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealTransactionModel {
  /**
   * [KO] 거래 고유 식별자 (UUID). DB primary key.
   * [VI] Mã định danh duy nhất của giao dịch (UUID). Khóa chính DB.
   */
  @Field(() => ID) id!: string;

  /**
   * [KO] 결제에 사용된 직원 식권 지갑 ID.
   *      MealWallet 테이블의 FK. 한 직원당 하나의 지갑을 가진다.
   * [VI] ID ví phiếu ăn của nhân viên dùng để thanh toán.
   *      FK tới bảng MealWallet. Mỗi nhân viên có một ví.
   */
  @Field() walletId!: string;

  /**
   * [KO] 이 거래가 속한 기업(Corporate) ID.
   *      CORPORATE_ADMIN은 자기 corporateId에 해당하는 거래만 조회할 수 있다.
   * [VI] ID doanh nghiệp (Corporate) sở hữu giao dịch này.
   *      CORPORATE_ADMIN chỉ xem được giao dịch thuộc corporateId của mình.
   */
  @Field() corporateId!: string;

  /**
   * [KO] 결제가 발생한 브랜드 본사(BrandHQ) ID.
   *      BRAND_ADMIN은 자기 brandHqId에 해당하는 거래만 조회할 수 있다.
   * [VI] ID trụ sở thương hiệu (BrandHQ) nơi phát sinh thanh toán.
   *      BRAND_ADMIN chỉ xem được giao dịch thuộc brandHqId của mình.
   */
  @Field() brandHqId!: string;

  /**
   * [KO] 결제가 발생한 지점(Branch) ID.
   *      실제 음식을 제공하는 매장을 가리킨다.
   * [VI] ID chi nhánh (Branch) nơi phát sinh thanh toán.
   *      Chỉ đến cửa hàng thực tế cung cấp bữa ăn.
   */
  @Field() branchId!: string;

  /**
   * [KO] 결제가 발생한 POS 단말기 ID (선택).
   *      모바일 앱(QR) 결제인 경우 null일 수 있다.
   * [VI] ID thiết bị POS nơi phát sinh thanh toán (tùy chọn).
   *      Có thể null nếu thanh toán qua ứng dụng di động (QR).
   */
  @Field(() => String, { nullable: true }) terminalId?: string | null;

  /**
   * [KO] 결제 루프 유형.
   *      - 'OPEN_LOOP': 개방형 — 모바일 앱 QR/바코드로 어떤 가맹점에서든 결제 가능
   *      - 'CLOSED_LOOP': 폐쇄형 — RFID 배지/생체 인증으로 계약된 특정 가맹점에서만 결제 가능
   * [VI] Loại vòng thanh toán.
   *      - 'OPEN_LOOP': mở — thanh toán QR/mã vạch tại bất kỳ cửa hàng nào
   *      - 'CLOSED_LOOP': đóng — thanh toán bằng thẻ RFID/sinh trắc tại cửa hàng đã ký hợp đồng
   */
  @Field() loopType!: string;

  /**
   * [KO] 인증 방식. 직원의 신원을 확인하는 수단.
   *      - 'APP_QR': 모바일 앱에서 생성한 QR 코드 스캔
   *      - 'DYNAMIC_BARCODE': 모바일 앱에서 생성한 동적 바코드 스캔
   *      - 'RFID_BADGE': RFID 사원증 태그
   *      - 'BIOMETRIC_FACE': 얼굴 인식
   *      - 'BIOMETRIC_FINGERPRINT': 지문 인식
   * [VI] Phương thức xác thực. Cách xác minh danh tính nhân viên.
   *      - 'APP_QR': quét mã QR từ ứng dụng di động
   *      - 'DYNAMIC_BARCODE': quét mã vạch động từ ứng dụng
   *      - 'RFID_BADGE': thẻ nhân viên RFID
   *      - 'BIOMETRIC_FACE': nhận dạng khuôn mặt
   *      - 'BIOMETRIC_FINGERPRINT': nhận dạng vân tay
   */
  @Field() authMethod!: string;

  /**
   * [KO] 요청 금액 (VND 단위, bigint).
   *      POS/앱이 "이만큼 결제하겠다"고 보낸 원래 금액이다.
   * [VI] Số tiền yêu cầu (đơn vị VND, bigint).
   *      Là số tiền gốc mà POS/ứng dụng gửi lên để yêu cầu thanh toán.
   */
  @Field(() => GraphQLBigInt) requestedAmountVnd!: bigint;

  /**
   * [KO] 승인된 금액 (VND 단위, bigint).
   *      정상 승인 시 requestedAmountVnd와 동일하다.
   *      거절(DECLINED) 시 0이다.
   * [VI] Số tiền được phê duyệt (đơn vị VND, bigint).
   *      Khi duyệt thành công, bằng requestedAmountVnd.
   *      Khi từ chối (DECLINED) thì bằng 0.
   */
  @Field(() => GraphQLBigInt) approvedAmountVnd!: bigint;

  /**
   * [KO] 회사 부담 금액 (VND 단위).
   *      회사 지원금(companyAllowanceVnd)에서 차감된 몫이다.
   *      예: 식사 50,000 VND 중 회사가 40,000 부담, 직원이 10,000 부담.
   * [VI] Phần công ty chi trả (đơn vị VND).
   *      Số tiền trừ từ khoản trợ cấp công ty (companyAllowanceVnd).
   *      Ví dụ: bữa ăn 50.000 VND, công ty trả 40.000, nhân viên trả 10.000.
   */
  @Field(() => GraphQLBigInt) companyShareVnd!: bigint;

  /**
   * [KO] 직원 부담 금액 (VND 단위).
   *      개인 충전금(personalTopUpVnd)에서 차감된 몫이다.
   *      Split Payment가 허용되지 않으면 항상 0이다.
   * [VI] Phần nhân viên chi trả (đơn vị VND).
   *      Số tiền trừ từ khoản nạp cá nhân (personalTopUpVnd).
   *      Nếu Split Payment không được phép thì luôn bằng 0.
   */
  @Field(() => GraphQLBigInt) employeeShareVnd!: bigint;

  /**
   * [KO] 거래 상태.
   *      - 'APPROVED': 승인됨 — 잔액 차감 완료, 아직 정산 전
   *      - 'DECLINED': 거절됨 — 잔액 차감 없음 (declineReason에 사유 기록)
   *      - 'SETTLED': 정산 완료 — 브랜드에 대금이 지급됨
   *      - 'REVERSED': 취소/환불 — 승인 후 취소되어 잔액이 복원됨
   * [VI] Trạng thái giao dịch.
   *      - 'APPROVED': đã duyệt — đã trừ số dư, chưa quyết toán
   *      - 'DECLINED': từ chối — không trừ số dư (lý do ghi trong declineReason)
   *      - 'SETTLED': đã quyết toán — đã thanh toán cho thương hiệu
   *      - 'REVERSED': đảo/hoàn — đã hủy sau khi duyệt, số dư được khôi phục
   */
  @Field() status!: string;

  /**
   * [KO] 거절 사유 (status가 'DECLINED'일 때만 값이 있다).
   *      - 'EMPLOYEE_INACTIVE': 직원 지갑이 비활성 상태 (퇴사, 정지 등)
   *      - 'MERCHANT_INACTIVE': 가맹점이 비활성 (계약 해지, 일시 정지 등)
   *      - 'OUT_OF_POLICY_WINDOW': 허용 시간대/요일 밖이거나 건당 한도 초과
   *      - 'MERCHANT_CATEGORY_RESTRICTED': 가맹점 업종이 정책에서 허용하지 않는 카테고리
   *      - 'DAILY_LIMIT_EXCEEDED': 일일 사용 한도 초과
   *      - 'SPLIT_PAYMENT_DISABLED': 회사 지원금만으로 부족하고 Split Payment가 비허용
   *      - 'INSUFFICIENT_BALANCE': 지갑 잔액 부족 (회사+개인 합산 기준)
   * [VI] Lý do từ chối (chỉ có giá trị khi status = 'DECLINED').
   *      - 'EMPLOYEE_INACTIVE': ví nhân viên không hoạt động (nghỉ việc, bị khóa, v.v.)
   *      - 'MERCHANT_INACTIVE': cửa hàng không hoạt động (hết hợp đồng, tạm dừng)
   *      - 'OUT_OF_POLICY_WINDOW': ngoài khung giờ/ngày cho phép hoặc vượt hạn mức mỗi lần
   *      - 'MERCHANT_CATEGORY_RESTRICTED': ngành hàng cửa hàng không nằm trong danh mục cho phép
   *      - 'DAILY_LIMIT_EXCEEDED': vượt hạn mức sử dụng trong ngày
   *      - 'SPLIT_PAYMENT_DISABLED': trợ cấp công ty không đủ và Split Payment bị tắt
   *      - 'INSUFFICIENT_BALANCE': số dư ví không đủ (tổng công ty + cá nhân)
   */
  @Field(() => String, { nullable: true }) declineReason?: string | null;

  /**
   * [KO] 멱등성 키. 동일한 결제 요청이 네트워크 재전송 등으로 중복 도착했을 때,
   *      같은 idempotencyKey로 이미 처리된 거래가 있으면 새로 생성하지 않고 기존 결과를 반환한다.
   *      POS/앱에서 거래별로 고유한 값을 생성해서 보내야 한다.
   * [VI] Khóa idempotency. Khi cùng một yêu cầu thanh toán đến nhiều lần (do mạng gửi lại),
   *      nếu đã có giao dịch với idempotencyKey giống nhau thì trả về kết quả cũ thay vì tạo mới.
   *      POS/ứng dụng phải tạo giá trị duy nhất cho mỗi giao dịch.
   */
  @Field() idempotencyKey!: string;

  /**
   * [KO] 승인 시각. status가 'APPROVED'일 때 기록된다. 거절(DECLINED) 시 null.
   * [VI] Thời điểm phê duyệt. Được ghi khi status = 'APPROVED'. Null nếu từ chối.
   */
  @Field(() => Date, { nullable: true }) authorizedAt?: Date | null;

  /**
   * [KO] 정산 완료 시각. status가 'SETTLED'로 전환될 때 기록된다.
   * [VI] Thời điểm quyết toán. Được ghi khi status chuyển sang 'SETTLED'.
   */
  @Field(() => Date, { nullable: true }) settledAt?: Date | null;

  /**
   * [KO] 레코드 생성 시각. 승인/거절 관계없이 항상 기록된다.
   * [VI] Thời điểm tạo bản ghi. Luôn được ghi bất kể duyệt hay từ chối.
   */
  @Field() createdAt!: Date;

  /** [KO] 주문 ID (앱 기반 주문 시) / [VI] ID đơn hàng (đặt qua app) */
  @Field(() => String, { nullable: true }) orderId?: string | null;

  /** [KO] 직원명 (가상 필드 — wallet → employee resolve) / [VI] Tên nhân viên (trường ảo) */
  @Field(() => String, { nullable: true }) employeeName?: string | null;

  /** [KO] 부서명 (가상 필드 — wallet → employee → department resolve) / [VI] Tên phòng ban (trường ảo) */
  @Field(() => String, { nullable: true }) departmentName?: string | null;

  /** [KO] 브랜드명 (가상 필드) / [VI] Tên thương hiệu (trường ảo) */
  @Field(() => String, { nullable: true }) brandName?: string | null;

  /** [KO] 지점명 (가상 필드) / [VI] Tên chi nhánh (trường ảo) */
  @Field(() => String, { nullable: true }) branchName?: string | null;
}
