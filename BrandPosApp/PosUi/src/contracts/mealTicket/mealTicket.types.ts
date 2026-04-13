/**
 * 한국어: RFID 식권 결제 브릿지 계약 — POS ↔ C++ 간 요청/응답 타입.
 * Tiếng Việt: Hợp đồng cầu nối thanh toán phiếu ăn RFID — kiểu yêu cầu/phản hồi POS ↔ C++.
 */

/** 한국어: 배지 조회 요청. / Tiếng Việt: Yêu cầu tra cứu thẻ badge. */
export interface MealTicketLookupRequest {
  badgeRfid: string;
}

/** 한국어: 배지 조회 응답 — 직원/지갑/정책 정보. / Tiếng Việt: Phản hồi tra cứu thẻ badge. */
export interface MealTicketLookupResponse {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  walletId: string;
  balanceVnd: number;
  companyAllowanceVnd: number;
  personalTopUpVnd: number;
  dailyLimitVnd: number;
  walletStatus: string;
  policyName: string | null;
}

/** 한국어: 식권 결제 승인 요청. / Tiếng Việt: Yêu cầu phê duyệt thanh toán phiếu ăn. */
export interface MealTicketAuthorizeRequest {
  walletId: string;
  brandHqId: string;
  branchId: string;
  terminalId: string;
  requestedAmountVnd: number;
  authMethod: 'RFID_BADGE';
  idempotencyKey: string;
}

/** 한국어: 식권 결제 승인 응답. / Tiếng Việt: Phản hồi phê duyệt thanh toán phiếu ăn. */
export interface MealTicketAuthorizeResponse {
  transactionId: string;
  status: 'APPROVED' | 'DECLINED';
  approvedAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  declineReason: string | null;
}
