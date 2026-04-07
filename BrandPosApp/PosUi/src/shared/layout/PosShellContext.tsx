'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * PosShell — POS 전역 Shell 설정
 *
 * 각 스크린은 `useSetPosShell()`로 도메인/스크린명/헤더 가시성/핸들러를
 * 선언한다. `app/pos/layout.tsx`가 AppHeader를 단일 인스턴스로 렌더한다.
 */

export interface PosShellConfig {
  /** 헤더 도메인명 (주문/결제/테이블 등) */
  domain?: string;
  /** 세부 스크린명 */
  screen?: string;
  /** 헤더 표시 여부 (기본 true) */
  showHeader?: boolean;
  /** 헤더 햄버거 메뉴 핸들러 */
  onMenu?: () => void;
  /** 헤더 닫기 핸들러 */
  onClose?: () => void;
}

interface PosShellContextValue extends PosShellConfig {
  setConfig: (config: PosShellConfig) => void;
}

const PosShellContext = createContext<PosShellContextValue | null>(null);

export function PosShellProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<PosShellConfig>({ showHeader: true });

  const setConfig = useCallback((next: PosShellConfig) => {
    setConfigState((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo<PosShellContextValue>(
    () => ({ ...config, setConfig }),
    [config, setConfig]
  );

  return <PosShellContext.Provider value={value}>{children}</PosShellContext.Provider>;
}

export function usePosShell(): PosShellContextValue {
  const ctx = useContext(PosShellContext);
  if (!ctx) {
    return {
      showHeader: true,
      setConfig: () => {},
    };
  }
  return ctx;
}

/**
 * 스크린에서 호출 — 마운트 시 헤더 구성 적용, 언마운트 시 초기화.
 * deps가 변경되면 재적용.
 */
export function useSetPosShell(config: PosShellConfig) {
  const { setConfig } = usePosShell();
  const { domain, screen, showHeader = true, onMenu, onClose } = config;

  // 핸들러 refs를 ref로 고정해서 매 렌더 재생성되어도 effect가 재실행되지 않도록.
  const onMenuRef = useMemo(() => ({ current: onMenu }), [onMenu]);
  const onCloseRef = useMemo(() => ({ current: onClose }), [onClose]);

  useEffect(() => {
    setConfig({
      domain,
      screen,
      showHeader,
      onMenu: onMenuRef.current,
      onClose: onCloseRef.current,
    });
    return () => {
      setConfig({ domain: undefined, screen: undefined, showHeader: true, onMenu: undefined, onClose: undefined });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, screen, showHeader]);
}
