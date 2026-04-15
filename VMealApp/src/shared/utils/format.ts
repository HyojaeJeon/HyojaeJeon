/**
 * Currency & date formatting utilities.
 * Mock data와 무관한 순수 유틸리티.
 */

export function formatVnd(amount: number | bigint): string {
  return new Intl.NumberFormat('vi-VN').format(Number(amount)) + '\u20AB';
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatTime(iso)} · ${formatDate(iso)}`;
}
