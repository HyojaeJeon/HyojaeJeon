/**
 * VMeal 푸시 알림 서비스
 * - Firebase Cloud Messaging (FCM)
 * - Notifee (로컬 알림 표시)
 * - 주문 상태, 결제 결과, 일일 한도 알림
 *
 * 기획서 S9: 5분 배치 윈도우, 채널 분리
 */

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/** FCM 토큰 가져오기 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('[NotificationService] getFcmToken failed:', error);
    return null;
  }
}

/** 알림 채널 생성 (Android) */
export async function createNotificationChannels(): Promise<void> {
  await notifee.createChannel({
    id: 'order_status',
    name: 'Trạng thái đơn hàng', // Order Status
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: 'payment',
    name: 'Thanh toán', // Payment
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: 'daily_limit',
    name: 'Hạn mức hàng ngày', // Daily Limit
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.createChannel({
    id: 'promotion',
    name: 'Khuyến mãi & Thực đơn', // Promotion & Menu
    importance: AndroidImportance.LOW,
  });
}

/** 알림 권한 요청 */
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/** 로컬 알림 표시 */
export async function showLocalNotification(params: {
  title: string;
  body: string;
  channelId?: string;
  data?: Record<string, string>;
}): Promise<void> {
  await notifee.displayNotification({
    title: params.title,
    body: params.body,
    android: {
      channelId: params.channelId ?? 'order_status',
      smallIcon: 'ic_notification',
      pressAction: { id: 'default' },
    },
    data: params.data,
  });
}

/** FCM 메시지 핸들러 등록 */
export function setupForegroundMessageHandler(): () => void {
  return messaging().onMessage(async (remoteMessage) => {
    const { notification, data } = remoteMessage;
    if (notification) {
      await showLocalNotification({
        title: notification.title ?? 'VMeal',
        body: notification.body ?? '',
        channelId: (data?.channelId as string) ?? 'order_status',
        data: data as Record<string, string>,
      });
    }
  });
}

/** FCM 토큰 갱신 리스너 */
export function onTokenRefresh(callback: (token: string) => void): () => void {
  return messaging().onTokenRefresh(callback);
}
