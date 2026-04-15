import { gql } from '@apollo/client';

/**
 * RFID 사원증 배정 — 관리자(CorporatePortal)가 직원에게 배지를 할당한다.
 * 앱에서는 조회 + 분실 신고만 가능하지만, mutation 정의는 공유한다.
 */
export const MEAL_EMPLOYEE_ASSIGN_BADGE = gql`
  mutation MealEmployeeAssignBadge($employeeId: ID!, $badgeRfid: String!) {
    mealEmployeeAssignBadge(employeeId: $employeeId, badgeRfid: $badgeRfid) {
      success {
        code
        data {
          id
          employeeCode
          fullName
          badgeRfid
          status
          updatedAt
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

/**
 * 디바이스 정보 등록 — FCM 토큰, 디바이스 ID, 플랫폼을 서버에 전달하여 푸시 알림을 활성화한다.
 */
export const MEAL_EMPLOYEE_UPDATE_DEVICE_INFO = gql`
  mutation MealEmployeeUpdateDeviceInfo(
    $employeeId: ID!
    $fcmToken: String!
    $deviceId: String!
    $platform: String!
  ) {
    mealEmployeeUpdateDeviceInfo(
      employeeId: $employeeId
      fcmToken: $fcmToken
      deviceId: $deviceId
      platform: $platform
    ) {
      success {
        code
        data {
          id
          employeeCode
          fullName
          status
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;

/**
 * 알림 설정 변경 — 푸시 알림 on/off, 주문 상태 알림, 일별 메뉴 알림 등의 환경설정.
 */
export const MEAL_EMPLOYEE_UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation MealEmployeeUpdateNotificationSettings($employeeId: ID!, $settings: JSON!) {
    mealEmployeeUpdateNotificationSettings(
      employeeId: $employeeId
      settings: $settings
    ) {
      success {
        code
        data {
          id
          employeeCode
          fullName
          status
        }
      }
      error {
        code
        message
        details
      }
    }
  }
`;
