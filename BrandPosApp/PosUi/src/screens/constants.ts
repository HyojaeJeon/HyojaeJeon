/**
 * Business Status Enums
 * Extracted from legacy POS C++ definitions and mapped to JS constants.
 */

export const TABLE_STATUS = {
  EMPTY: 'EMPTY',           // 빈 테이블
  OCCUPIED: 'OCCUPIED',     // 주문이 진행중인 테이블
  PAYING: 'PAYING',         // 결제 진행중 (락)
  DIRTY: 'DIRTY',           // 정리 필요
};

export const ORDER_STATUS = {
  NORMAL: 'NORMAL',
  CANCEL: 'CANCEL',
  DELAYED: 'DELAYED',
};

export const PAYMENT_STATUS = {
  WAITING: 'WAITING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export const NETWORK_STATUS = {
  STABLE: 'STABLE',
  UNSTABLE: 'UNSTABLE',
  OFFLINE: 'OFFLINE',
};

export const DEVICE_STATUS = {
  OK: 'OK',
  ERROR: 'ERROR',
  DISCONNECTED: 'DISCONNECTED',
};
