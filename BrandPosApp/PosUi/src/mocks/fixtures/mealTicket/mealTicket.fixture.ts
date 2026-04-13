/**
 * 한국어: RFID 식권 mock fixture 3종 (default / empty / error).
 * Tiếng Việt: Fixture mock phiếu ăn RFID 3 kịch bản (default / empty / error).
 */
import type {
  MealTicketLookupResponse,
  MealTicketAuthorizeResponse,
} from '@contracts/mealTicket/mealTicket.types';

interface MealTicketFixtures {
  lookup: {
    default: MealTicketLookupResponse;
    empty: null;
    error: null;
  };
  authorize: {
    default: MealTicketAuthorizeResponse;
    empty: null;
    error: MealTicketAuthorizeResponse;
  };
}

export const mealTicketFixtures: MealTicketFixtures = {
  lookup: {
    /** 한국어: 정상 조회 — 활성 직원 + 잔액 충분. / Tiếng Việt: Tra cứu thành công. */
    default: {
      employeeId: 'emp-001',
      employeeName: '김민수',
      departmentName: '개발팀',
      walletId: 'wallet-001',
      balanceVnd: 500_000,
      companyAllowanceVnd: 300_000,
      personalTopUpVnd: 200_000,
      dailyLimitVnd: 200_000,
      walletStatus: 'ACTIVE',
      policyName: '기본 식대 정책',
    },
    /** 한국어: 미등록 배지 — null 반환. / Tiếng Việt: Thẻ badge chưa đăng ký. */
    empty: null,
    /** 한국어: 서버 오류. / Tiếng Việt: Lỗi máy chủ. */
    error: null,
  },
  authorize: {
    /** 한국어: 승인 성공 — 회사/개인 분할. / Tiếng Việt: Phê duyệt thành công. */
    default: {
      transactionId: 'txn-001',
      status: 'APPROVED',
      approvedAmountVnd: 150_000,
      companyShareVnd: 150_000,
      employeeShareVnd: 0,
      declineReason: null,
    },
    /** 한국어: 빈 결과. / Tiếng Việt: Kết quả rỗng. */
    empty: null,
    /** 한국어: 잔액 부족 거절. / Tiếng Việt: Từ chối do số dư không đủ. */
    error: {
      transactionId: 'txn-002',
      status: 'DECLINED',
      approvedAmountVnd: 0,
      companyShareVnd: 0,
      employeeShareVnd: 0,
      declineReason: 'INSUFFICIENT_BALANCE',
    },
  },
};
