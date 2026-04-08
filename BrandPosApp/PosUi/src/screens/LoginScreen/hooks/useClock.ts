'use client';

import { useEffect, useState } from 'react';

/**
 * useClock — 1초 주기 현재시각/영업일 문자열.
 * 영업일은 추후 systemApi.getConfig (configCache) 로 대체한다.
 */
export function useClock() {
  const [dateTime, setDateTime] = useState('');
  const [businessDate, setBusinessDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setDateTime(
        `${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()} ` +
          `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      );
      setBusinessDate(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return { dateTime, businessDate };
}
