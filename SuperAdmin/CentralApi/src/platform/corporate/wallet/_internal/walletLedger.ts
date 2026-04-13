/**
 * [KO] MealWallet 2-Bucket 원장(Ledger) 헬퍼
 *
 *      ========== 2-Bucket 모델 설명 ==========
 *
 *      직원 식권 지갑은 잔액을 두 개의 "버킷(bucket)"으로 분리 관리합니다:
 *
 *      1. companyAllowanceVnd (회사 지원금 버킷)
 *         - 회사가 법인 예산(Funding Account)에서 직원에게 지급한 식대 지원금.
 *         - 회사 정책에 따라 사용처가 제한될 수 있습니다 (예: 점심만 가능, 특정 가맹점만 허용).
 *         - 결제 시 이 버킷이 먼저 소진됩니다.
 *
 *      2. personalTopUpVnd (개인 충전 버킷)
 *         - 직원이 개인 돈으로 직접 충전한 금액.
 *         - 회사 지원금이 부족할 때 보충 자금으로 사용됩니다.
 *         - split payment가 허용된 경우에만 사용 가능합니다.
 *
 *      balanceVnd = companyAllowanceVnd + personalTopUpVnd (항상 두 버킷의 합계)
 *
 *      ========== Split Payment 예시 ==========
 *
 *      예시: 직원 지갑 상태
 *        - companyAllowanceVnd: 30,000 VND (회사 지원금)
 *        - personalTopUpVnd:    20,000 VND (개인 충전)
 *        - balanceVnd:          50,000 VND (총 잔액)
 *
 *      시나리오 1: 결제 금액 25,000 VND (회사 지원금으로 충분)
 *        → companyShareVnd = 25,000 (회사에서 전액 부담)
 *        → employeeShareVnd = 0 (개인 부담 없음)
 *        → 결과: companyAllowanceVnd = 5,000 / personalTopUpVnd = 20,000 / balanceVnd = 25,000
 *
 *      시나리오 2: 결제 금액 40,000 VND, split payment 허용
 *        → companyShareVnd = 30,000 (회사 지원금 전액 소진)
 *        → employeeShareVnd = 10,000 (부족분은 개인 충전에서 차감)
 *        → 결과: companyAllowanceVnd = 0 / personalTopUpVnd = 10,000 / balanceVnd = 10,000
 *
 *      시나리오 3: 결제 금액 40,000 VND, split payment 비허용
 *        → null 반환 (결제 거절 — 회사 지원금만으로 부족하고 혼합 결제 불가)
 *
 *      시나리오 4: 결제 금액 60,000 VND (총 잔액 초과)
 *        → null 반환 (잔액 부족)
 *
 *      ========== 레거시 호환 ==========
 *
 *      기존에 버킷 필드가 없던 레거시 데이터의 경우:
 *      companyAllowanceVnd == 0 && personalTopUpVnd == 0 && balanceVnd > 0 이면
 *      balanceVnd 전체를 회사 지원금으로 간주합니다 (normalizeMealWalletFundingState).
 *
 * [VI] Helper sổ cái (Ledger) 2-Bucket cho MealWallet
 *
 *      ========== Giải thích mô hình 2-Bucket ==========
 *
 *      Ví phiếu ăn nhân viên quản lý số dư bằng hai "bucket":
 *
 *      1. companyAllowanceVnd (bucket trợ cấp công ty)
 *         - Trợ cấp ăn mà công ty cấp cho nhân viên từ ngân sách pháp nhân (Funding Account).
 *         - Có thể bị giới hạn nơi sử dụng theo chính sách công ty (ví dụ: chỉ bữa trưa, chỉ cửa hàng được chấp nhận).
 *         - Khi thanh toán, bucket này được tiêu trước.
 *
 *      2. personalTopUpVnd (bucket nạp cá nhân)
 *         - Số tiền nhân viên tự nạp bằng tiền cá nhân.
 *         - Được sử dụng làm nguồn bổ sung khi trợ cấp công ty không đủ.
 *         - Chỉ sử dụng được khi split payment được cho phép.
 *
 *      balanceVnd = companyAllowanceVnd + personalTopUpVnd (luôn là tổng hai bucket)
 *
 *      ========== Ví dụ Split Payment ==========
 *
 *      Ví dụ: Trạng thái ví nhân viên
 *        - companyAllowanceVnd: 30.000 VND (trợ cấp công ty)
 *        - personalTopUpVnd:    20.000 VND (nạp cá nhân)
 *        - balanceVnd:          50.000 VND (tổng số dư)
 *
 *      Kịch bản 1: Thanh toán 25.000 VND (trợ cấp công ty đủ)
 *        → companyShareVnd = 25.000 (công ty chi trả toàn bộ)
 *        → employeeShareVnd = 0 (nhân viên không phải trả)
 *        → Kết quả: companyAllowanceVnd = 5.000 / personalTopUpVnd = 20.000 / balanceVnd = 25.000
 *
 *      Kịch bản 2: Thanh toán 40.000 VND, cho phép split payment
 *        → companyShareVnd = 30.000 (tiêu hết trợ cấp công ty)
 *        → employeeShareVnd = 10.000 (phần thiếu trừ từ nạp cá nhân)
 *        → Kết quả: companyAllowanceVnd = 0 / personalTopUpVnd = 10.000 / balanceVnd = 10.000
 *
 *      Kịch bản 3: Thanh toán 40.000 VND, không cho phép split payment
 *        → Trả về null (từ chối thanh toán — trợ cấp công ty không đủ và không cho phép thanh toán hỗn hợp)
 *
 *      Kịch bản 4: Thanh toán 60.000 VND (vượt tổng số dư)
 *        → Trả về null (không đủ số dư)
 *
 *      ========== Tương thích dữ liệu cũ (Legacy) ==========
 *
 *      Với dữ liệu cũ chưa có trường bucket:
 *      Nếu companyAllowanceVnd == 0 && personalTopUpVnd == 0 && balanceVnd > 0 thì
 *      toàn bộ balanceVnd được coi là trợ cấp công ty (normalizeMealWalletFundingState).
 */

/**
 * [KO] 회사 지원금 출처 타입 상수 — FundingEntry의 sourceType으로 사용됩니다.
 * [VI] Hằng số loại nguồn trợ cấp công ty — được dùng làm sourceType cho FundingEntry.
 */
export const COMPANY_ALLOWANCE_SOURCE_TYPE = 'COMPANY_ALLOWANCE' as const;

/**
 * [KO] 개인 충전 출처 타입 상수 — FundingEntry의 sourceType으로 사용됩니다.
 * [VI] Hằng số loại nguồn nạp cá nhân — được dùng làm sourceType cho FundingEntry.
 */
export const PERSONAL_TOP_UP_SOURCE_TYPE = 'PERSONAL_TOP_UP' as const;

/**
 * [KO] 지갑 입금 출처 유형의 유니온 타입 — 회사 지원금 또는 개인 충전만 허용됩니다.
 * [VI] Union type cho loại nguồn nạp ví — chỉ cho phép trợ cấp công ty hoặc nạp cá nhân.
 */
export type MealWalletFundingSourceType =
  | typeof COMPANY_ALLOWANCE_SOURCE_TYPE
  | typeof PERSONAL_TOP_UP_SOURCE_TYPE;

/**
 * [KO] 지갑의 현재 자금 상태 인터페이스 — DB에서 읽어온 raw 상태.
 *      companyAllowanceVnd/personalTopUpVnd가 null일 수 있습니다 (레거시 데이터).
 * [VI] Interface trạng thái vốn hiện tại của ví — trạng thái thô đọc từ DB.
 *      companyAllowanceVnd/personalTopUpVnd có thể null (dữ liệu cũ).
 */
export interface MealWalletFundingState {
  /** [KO] 총 잔액 (VND) / [VI] Tổng số dư (VND) */
  balanceVnd: bigint;
  /** [KO] 회사 지원금 잔액 — null이면 레거시 데이터 / [VI] Số dư trợ cấp công ty — null là dữ liệu cũ */
  companyAllowanceVnd?: bigint | null;
  /** [KO] 개인 충전 잔액 — null이면 레거시 데이터 / [VI] Số dư nạp cá nhân — null là dữ liệu cũ */
  personalTopUpVnd?: bigint | null;
}

/**
 * [KO] 정규화된 자금 상태 — null이 제거되고 모든 버킷이 확정된 상태.
 *      이 상태에서만 실제 금액 계산이 수행됩니다.
 * [VI] Trạng thái vốn đã chuẩn hóa — null đã được loại bỏ, mọi bucket đều xác định.
 *      Chỉ trong trạng thái này mới thực hiện tính toán số tiền.
 */
export interface MealWalletNormalizedFundingState {
  /** [KO] 총 잔액 (VND) / [VI] Tổng số dư (VND) */
  balanceVnd: bigint;
  /** [KO] 회사 지원금 잔액 (확정) / [VI] Số dư trợ cấp công ty (đã xác định) */
  companyAllowanceVnd: bigint;
  /** [KO] 개인 충전 잔액 (확정) / [VI] Số dư nạp cá nhân (đã xác định) */
  personalTopUpVnd: bigint;
}

/**
 * [KO] 결제 할당 결과 — 결제 금액이 회사 지원금과 개인 충전에 어떻게 분배되었는지 나타냅니다.
 *      companyShareVnd + employeeShareVnd = 결제 총액
 * [VI] Kết quả phân bổ thanh toán — cho biết số tiền thanh toán được phân chia giữa trợ cấp công ty và nạp cá nhân.
 *      companyShareVnd + employeeShareVnd = tổng tiền thanh toán
 */
export interface MealWalletSpendAllocation extends MealWalletNormalizedFundingState {
  /** [KO] 회사 부담 금액 (VND) — 회사 지원금에서 차감된 금액 / [VI] Phần công ty chi trả (VND) — số tiền trừ từ trợ cấp */
  companyShareVnd: bigint;
  /** [KO] 직원 부담 금액 (VND) — 개인 충전에서 차감된 금액 / [VI] Phần nhân viên chi trả (VND) — số tiền trừ từ nạp cá nhân */
  employeeShareVnd: bigint;
}

/**
 * [KO] 레거시 데이터 정규화 함수
 *      DB에서 읽어온 raw 상태를 정규화합니다.
 *      레거시 행(companyAllowanceVnd=0, personalTopUpVnd=0, balanceVnd>0)은
 *      전체 잔액을 회사 지원금으로 간주합니다.
 *
 *      단계:
 *      1. null/undefined를 0n으로 변환
 *      2. 두 버킷 모두 0이고 잔액이 있으면 → 전액 회사 지원금으로 할당 (레거시 호환)
 *      3. 그 외에는 있는 그대로 반환
 *
 * [VI] Hàm chuẩn hóa dữ liệu cũ
 *      Chuẩn hóa trạng thái thô đọc từ DB.
 *      Hàng cũ (companyAllowanceVnd=0, personalTopUpVnd=0, balanceVnd>0)
 *      sẽ coi toàn bộ số dư là trợ cấp công ty.
 *
 *      Các bước:
 *      1. Chuyển null/undefined thành 0n
 *      2. Nếu cả hai bucket đều 0 và có số dư → gán toàn bộ cho trợ cấp công ty (tương thích cũ)
 *      3. Các trường hợp khác trả về nguyên trạng
 */
export function normalizeMealWalletFundingState(
  state: MealWalletFundingState,
): MealWalletNormalizedFundingState {
  const companyAllowanceVnd = state.companyAllowanceVnd ?? 0n;
  const personalTopUpVnd = state.personalTopUpVnd ?? 0n;

  // [KO] 레거시 호환: 버킷이 모두 0이고 잔액이 있으면 전체를 회사 지원금으로 간주
  // [VI] Tương thích cũ: nếu cả hai bucket đều 0 và có số dư, coi toàn bộ là trợ cấp công ty
  if (companyAllowanceVnd === 0n && personalTopUpVnd === 0n && state.balanceVnd > 0n) {
    return {
      balanceVnd: state.balanceVnd,
      companyAllowanceVnd: state.balanceVnd,
      personalTopUpVnd: 0n,
    };
  }

  return {
    balanceVnd: state.balanceVnd,
    companyAllowanceVnd,
    personalTopUpVnd,
  };
}

/**
 * [KO] 지갑에 자금 적립 함수 — 지정된 출처(회사/개인)에 따라 해당 버킷의 잔액을 증가시킵니다.
 *
 *      단계:
 *      1. 현재 상태를 정규화 (normalizeMealWalletFundingState)
 *      2. sourceType에 따라 해당 버킷에 amountVnd를 더함
 *      3. balanceVnd도 동일하게 증가
 *
 *      예시: companyAllowanceVnd=10,000 인 지갑에 COMPANY_ALLOWANCE로 5,000 적립
 *        → companyAllowanceVnd=15,000, balanceVnd 5,000 증가
 *
 * [VI] Hàm nạp tiền vào ví — tăng số dư bucket tương ứng theo nguồn (công ty/cá nhân).
 *
 *      Các bước:
 *      1. Chuẩn hóa trạng thái hiện tại (normalizeMealWalletFundingState)
 *      2. Cộng amountVnd vào bucket tương ứng theo sourceType
 *      3. balanceVnd cũng tăng tương ứng
 *
 *      Ví dụ: ví có companyAllowanceVnd=10.000, nạp 5.000 dạng COMPANY_ALLOWANCE
 *        → companyAllowanceVnd=15.000, balanceVnd tăng 5.000
 */
export function applyMealWalletFunding(
  state: MealWalletFundingState,
  amountVnd: bigint,
  sourceType: MealWalletFundingSourceType,
): MealWalletNormalizedFundingState {
  const normalized = normalizeMealWalletFundingState(state);

  // [KO] 개인 충전이면 personalTopUpVnd 버킷만 증가
  // [VI] Nếu là nạp cá nhân thì chỉ tăng bucket personalTopUpVnd
  if (sourceType === PERSONAL_TOP_UP_SOURCE_TYPE) {
    return {
      balanceVnd: normalized.balanceVnd + amountVnd,
      companyAllowanceVnd: normalized.companyAllowanceVnd,
      personalTopUpVnd: normalized.personalTopUpVnd + amountVnd,
    };
  }

  // [KO] 회사 지원금이면 companyAllowanceVnd 버킷만 증가
  // [VI] Nếu là trợ cấp công ty thì chỉ tăng bucket companyAllowanceVnd
  return {
    balanceVnd: normalized.balanceVnd + amountVnd,
    companyAllowanceVnd: normalized.companyAllowanceVnd + amountVnd,
    personalTopUpVnd: normalized.personalTopUpVnd,
  };
}

/**
 * [KO] 결제 금액 할당 함수 (Split Payment 핵심 로직)
 *      결제 금액을 회사 지원금과 개인 충전에 분배합니다.
 *
 *      우선순위: 회사 지원금을 먼저 소진한 뒤, 부족분만 개인 충전에서 차감합니다.
 *
 *      단계:
 *      1. 현재 상태를 정규화
 *      2. 총 가용 잔액(회사+개인) < 결제 금액이면 → null (잔액 부족)
 *      3. 회사 지원금만으로 충분하면 → 전액 회사 부담, 개인 부담 0
 *      4. 회사 지원금이 부족하고 split payment가 비허용이면 → null (결제 거절)
 *      5. split payment 허용이면 → 회사 지원금 전액 소진 + 나머지를 개인에서 차감
 *      6. 개인 충전도 부족하면 → null (잔액 부족)
 *
 *      ※ 결제 금액에서 "회사 지원금"이 우선 차감되는 이유:
 *         회사 지원금은 사용 기한이 있거나 정책 제한이 있을 수 있으므로,
 *         직원에게 유리하도록 회사 돈을 먼저 소진합니다.
 *
 * [VI] Hàm phân bổ thanh toán (Logic cốt lõi của Split Payment)
 *      Phân chia số tiền thanh toán giữa trợ cấp công ty và nạp cá nhân.
 *
 *      Ưu tiên: Tiêu trợ cấp công ty trước, phần thiếu mới trừ từ nạp cá nhân.
 *
 *      Các bước:
 *      1. Chuẩn hóa trạng thái hiện tại
 *      2. Tổng số dư khả dụng (công ty+cá nhân) < số tiền thanh toán → null (không đủ số dư)
 *      3. Trợ cấp công ty đủ → công ty chi trả toàn bộ, nhân viên trả 0
 *      4. Trợ cấp công ty không đủ và không cho phép split payment → null (từ chối thanh toán)
 *      5. Cho phép split payment → tiêu hết trợ cấp công ty + phần còn lại trừ từ cá nhân
 *      6. Nạp cá nhân cũng không đủ → null (không đủ số dư)
 *
 *      ※ Lý do trợ cấp công ty bị trừ ưu tiên:
 *         Trợ cấp công ty có thể có hạn sử dụng hoặc giới hạn chính sách,
 *         nên tiêu tiền công ty trước để có lợi cho nhân viên.
 */
export function allocateMealWalletSpend(
  state: MealWalletFundingState,
  amountVnd: bigint,
  allowSplitPayment: boolean,
): MealWalletSpendAllocation | null {
  const normalized = normalizeMealWalletFundingState(state);
  const totalAvailable = normalized.companyAllowanceVnd + normalized.personalTopUpVnd;

  // [KO] 총 잔액 부족 → 결제 불가
  // [VI] Tổng số dư không đủ → không thể thanh toán
  if (amountVnd > totalAvailable) return null;

  // [KO] 회사 지원금만으로 충분 → 전액 회사 부담
  // [VI] Trợ cấp công ty đủ → công ty chi trả toàn bộ
  if (amountVnd <= normalized.companyAllowanceVnd) {
    return {
      ...normalized,
      companyShareVnd: amountVnd,
      employeeShareVnd: 0n,
      balanceVnd: normalized.balanceVnd - amountVnd,
      companyAllowanceVnd: normalized.companyAllowanceVnd - amountVnd,
      personalTopUpVnd: normalized.personalTopUpVnd,
    };
  }

  // [KO] 회사 지원금 부족 + split payment 비허용 → 결제 거절
  // [VI] Trợ cấp công ty không đủ + không cho phép split payment → từ chối thanh toán
  if (!allowSplitPayment) return null;

  // [KO] Split payment: 회사 지원금 전액 소진 + 나머지는 개인에서 차감
  // [VI] Split payment: tiêu hết trợ cấp công ty + phần còn lại trừ từ cá nhân
  const companyShareVnd = normalized.companyAllowanceVnd;
  const employeeShareVnd = amountVnd - companyShareVnd;

  // [KO] 개인 충전도 부족하면 결제 불가
  // [VI] Nạp cá nhân cũng không đủ thì không thể thanh toán
  if (employeeShareVnd > normalized.personalTopUpVnd) return null;

  return {
    ...normalized,
    companyShareVnd,
    employeeShareVnd,
    balanceVnd: normalized.balanceVnd - amountVnd,
    companyAllowanceVnd: 0n,
    personalTopUpVnd: normalized.personalTopUpVnd - employeeShareVnd,
  };
}

/**
 * [KO] 결제 환불(복원) 함수 — 취소된 결제의 금액을 원래 버킷으로 되돌립니다.
 *      companyShareVnd는 회사 지원금 버킷으로, employeeShareVnd는 개인 충전 버킷으로 복원됩니다.
 *
 *      예시: 40,000 결제(회사 30,000 + 개인 10,000) 환불 시
 *        → companyAllowanceVnd += 30,000
 *        → personalTopUpVnd += 10,000
 *        → balanceVnd += 40,000
 *
 * [VI] Hàm hoàn trả (khôi phục) thanh toán — trả lại số tiền của giao dịch bị hủy vào đúng bucket gốc.
 *      companyShareVnd trả về bucket trợ cấp công ty, employeeShareVnd trả về bucket nạp cá nhân.
 *
 *      Ví dụ: Hoàn trả giao dịch 40.000 (công ty 30.000 + cá nhân 10.000)
 *        → companyAllowanceVnd += 30.000
 *        → personalTopUpVnd += 10.000
 *        → balanceVnd += 40.000
 */
export function restoreMealWalletSpend(
  state: MealWalletFundingState,
  companyShareVnd: bigint,
  employeeShareVnd: bigint,
): MealWalletNormalizedFundingState {
  const normalized = normalizeMealWalletFundingState(state);
  return {
    balanceVnd: normalized.balanceVnd + companyShareVnd + employeeShareVnd,
    companyAllowanceVnd: normalized.companyAllowanceVnd + companyShareVnd,
    personalTopUpVnd: normalized.personalTopUpVnd + employeeShareVnd,
  };
}
