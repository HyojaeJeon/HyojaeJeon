/**
 * VMeal OS 권한 요청 서비스
 * - 위치 (GPS 사기방지 + 가맹점 검색)
 * - 알림 (주문 상태 업데이트)
 * - 카메라 (QR 스캔 - future)
 *
 * Uses react-native-permissions
 */

import { Platform } from 'react-native';
import {
  check,
  request,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  RESULTS,
  openSettings,
  type PermissionStatus,
} from 'react-native-permissions';

export type PermissionType = 'location' | 'notification' | 'camera';

const PERMISSION_MAP = {
  location: Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }),
  camera: Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  }),
} as const;

/** 권한 상태 확인 */
export async function checkPermission(type: PermissionType): Promise<PermissionStatus> {
  if (type === 'notification') {
    // iOS & Android: use cross-platform checkNotifications API
    const { status } = await checkNotifications();
    return status;
  }
  const permission = PERMISSION_MAP[type];
  if (!permission) return RESULTS.UNAVAILABLE;
  return check(permission);
}

/** 권한 요청 */
export async function requestPermission(type: PermissionType): Promise<PermissionStatus> {
  if (type === 'notification') {
    // iOS & Android: use cross-platform requestNotifications API
    const { status } = await requestNotifications(['alert', 'badge', 'sound']);
    return status;
  }
  const permission = PERMISSION_MAP[type];
  if (!permission) return RESULTS.UNAVAILABLE;
  return request(permission);
}

/** 권한 거부 시 설정으로 이동 */
export function openAppSettings(): void {
  openSettings();
}

/** 모든 필수 권한 한번에 체크 */
export async function checkAllPermissions(): Promise<Record<PermissionType, PermissionStatus>> {
  const [location, notification, camera] = await Promise.all([
    checkPermission('location'),
    checkPermission('notification'),
    checkPermission('camera'),
  ]);
  return { location, notification, camera };
}

/** 위치 권한이 granted 인지 확인 (GPS 결제 검증용) */
export async function isLocationGranted(): Promise<boolean> {
  const status = await checkPermission('location');
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}
