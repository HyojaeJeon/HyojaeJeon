'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import Label from '@shared/ui/atoms/Label';

/**
 * MainMenuScreen -- POS 메인 메뉴 화면 (레거시 IDD_RESTAURANT_DIALOG)
 *
 * 영업 시작/마감, 설정, 분석, 회원 관리, POS 종료 등 주요 업무 흐름의 진입점.
 * 매장 정보와 POS 상태를 한눈에 보여준다.
 *
 * Bridge Commands:
 *   SYSTEM:EXIT, SYSTEM:OPEN_BUSINESS, SYSTEM:CLOSE_BUSINESS,
 *   SYSTEM:SET_LANG, CUSTOMER:SEARCH, SYSTEM:REMOTE_CONTROL,
 *   SYSTEM:GET_NOTICE, SYSTEM:UPDATE, SYSTEM:CHECK_FIREWALL
 */

// ─── Types ───

interface AuthSession {
  employeeId: string;
  employeeName: string;
  role: string;
  storeCode: string;
  storeName: string;
  posNo: string;
  adjustNo: string;
  loginAt: string;
}

interface MainMenuScreenProps {
  session: AuthSession;
  onNavigate?: (screen: string) => void;
}

type Lang = 'KR' | 'EN' | 'VN';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: number;
}

// ─── Component ───

export default function MainMenuScreen({ session, onNavigate }: MainMenuScreenProps) {
  const [lang, setLang] = useState<Lang>('KR');
  const [dateTime, setDateTime] = useState('');
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isOnline] = useState(false); // TODO: RTK Query systemApi.getConfig 연동
  const [businessStatus, setBusinessStatus] = useState<'CLOSED' | 'OPEN'>('CLOSED');

  // ─── Clock ───
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime(
        `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  const loginTime = session.loginAt
    ? new Date(session.loginAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '-';

  // ─── Stub Handlers ───

  const handleExit = useCallback(() => {
    // TODO: SYSTEM:EXIT Bridge command -> POS 앱 종료
    console.log('[MainMenuScreen] SYSTEM:EXIT');
  }, []);

  const handleOpenBusiness = useCallback(() => {
    // TODO: SYSTEM:OPEN_BUSINESS Bridge command -> OpenBusinessUseCase
    console.log('[MainMenuScreen] SYSTEM:OPEN_BUSINESS');
    setBusinessStatus('OPEN');
    onNavigate?.('TableScreen');
  }, [onNavigate]);

  const handleCloseBusiness = useCallback(() => {
    // TODO: SYSTEM:CLOSE_BUSINESS Bridge command -> CloseBusinessUseCase
    console.log('[MainMenuScreen] SYSTEM:CLOSE_BUSINESS');
    setBusinessStatus('CLOSED');
  }, []);

  const handleAnalysis = useCallback(() => {
    // TODO: AnalysisScreen 라우팅
    console.log('[MainMenuScreen] navigate -> AnalysisScreen');
    onNavigate?.('AnalysisScreen');
  }, [onNavigate]);

  const handleSetup = useCallback(() => {
    // TODO: SetupScreen 라우팅
    console.log('[MainMenuScreen] navigate -> SetupScreen');
    onNavigate?.('SetupScreen');
  }, [onNavigate]);

  const handleMember = useCallback(() => {
    // TODO: CUSTOMER:SEARCH -> 회원 관리 화면 진입
    console.log('[MainMenuScreen] navigate -> CustomerScreen');
    onNavigate?.('CustomerScreen');
  }, [onNavigate]);

  const handleClockInOut = useCallback(() => {
    // TODO: STAFF:CLOCK_IN_OUT -> handoff to emp-diligence
    console.log('[MainMenuScreen] STAFF:CLOCK_IN_OUT (숨김)');
  }, []);

  const handleRemoteControl = useCallback(() => {
    // TODO: SYSTEM:REMOTE_CONTROL Bridge command
    console.log('[MainMenuScreen] SYSTEM:REMOTE_CONTROL');
  }, []);

  const handleStockView = useCallback(() => {
    // TODO: 재고조회 -> SetupScreen 또는 MaintenanceScreen으로 분리
    console.log('[MainMenuScreen] 재고조회');
    onNavigate?.('StockScreen');
  }, [onNavigate]);

  const handleGetNotice = useCallback(() => {
    // TODO: SYSTEM:GET_NOTICE Bridge command (온라인 시에만)
    console.log('[MainMenuScreen] SYSTEM:GET_NOTICE');
    setNotices([]); // stub
  }, []);

  const handleAuthCancel = useCallback(() => {
    // TODO: POS 인증 취소 (관리자 전용)
    console.log('[MainMenuScreen] 인증 취소');
  }, []);

  const handleUpdate = useCallback(() => {
    // TODO: SYSTEM:UPDATE Bridge command (숨김)
    console.log('[MainMenuScreen] SYSTEM:UPDATE');
  }, []);

  const handleCheckFirewall = useCallback(() => {
    // TODO: SYSTEM:CHECK_FIREWALL Bridge command
    console.log('[MainMenuScreen] SYSTEM:CHECK_FIREWALL');
  }, []);

  const handleSetLang = useCallback((newLang: Lang) => {
    // TODO: SYSTEM:SET_LANG Bridge command -> UpdateConfigUseCase
    console.log('[MainMenuScreen] SYSTEM:SET_LANG', newLang);
    setLang(newLang);
  }, []);

  const handleServerItem = useCallback(() => {
    // TODO: 서버상품적용 (숨김, 온라인 시에만)
    console.log('[MainMenuScreen] 서버상품적용');
  }, []);

  // ─── Menu Button Config ───

  const menuButtons = [
    {
      id: 'business',
      label: businessStatus === 'OPEN' ? '영업중' : '영업',
      sub: '테이블 \u00B7 주문 \u00B7 결제',
      color: 'bg-primary-500 text-white',
      handler: handleOpenBusiness,
    },
    {
      id: 'finish',
      label: '마감',
      sub: '일일 정산 \u00B7 보고서',
      color: 'bg-pos-surface text-pos-text border border-pos-border',
      handler: handleCloseBusiness,
    },
    {
      id: 'analysis',
      label: '분석',
      sub: '매출 \u00B7 통계 \u00B7 추이',
      color: 'bg-pos-surface text-pos-text border border-pos-border',
      handler: handleAnalysis,
    },
    {
      id: 'member',
      label: '회원',
      sub: '고객 \u00B7 포인트 \u00B7 외상',
      color: 'bg-pos-surface text-pos-text border border-pos-border',
      handler: handleMember,
    },
    {
      id: 'stock',
      label: '재고',
      sub: '수불 \u00B7 매입 \u00B7 장부',
      color: 'bg-pos-surface text-pos-text border border-pos-border',
      handler: handleStockView,
    },
    {
      id: 'setup',
      label: '설정',
      sub: '장치 \u00B7 환경 \u00B7 인쇄',
      color: 'bg-pos-surface text-pos-text border border-pos-border',
      handler: handleSetup,
    },
  ];

  // ─── Bottom Utility Buttons ───

  const utilityButtons = [
    { label: '재고 조회', handler: handleStockView },
    { label: '원격 지원', handler: handleRemoteControl },
    { label: '업데이트', handler: handleUpdate, hidden: true },
    { label: '방화벽 확인', handler: handleCheckFirewall },
    { label: '서버 상품갱신', handler: handleServerItem, hidden: true },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-pos-bg">
      {/* ═══ 상단 바 ═══ */}
      <header className="h-12 flex items-center justify-between px-5 border-b border-pos-border shrink-0">
        <div className="flex items-center gap-3">
          {/* 인증 취소 버튼 (관리자 전용) */}
          <button
            type="button"
            onClick={handleAuthCancel}
            className="w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:bg-pos-border active:scale-[0.95]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-pos-md bg-primary-500 flex items-center justify-center">
            <span className="text-white text-sm font-black">H</span>
          </div>
          <Label size="md" weight="bold">효정 POS</Label>
        </div>
        <div className="flex items-center gap-2">
          {/* 언어 선택 (LanguageSelector) */}
          {(['KR', 'EN', 'VN'] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleSetLang(l)}
              className={`w-10 h-8 rounded-pos-sm text-xs font-bold cursor-pointer select-none active:scale-[0.95] ${
                lang === l
                  ? 'bg-primary-500 text-white'
                  : 'bg-pos-surface text-pos-text-secondary border border-pos-border'
              }`}
            >
              {l}
            </button>
          ))}
          {/* 종료 (X) 버튼 */}
          <button
            type="button"
            onClick={handleExit}
            className="ml-2 w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:bg-pos-border active:scale-[0.95]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ═══ 본문 ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* 좌측: 매장 정보 패널 */}
        <div className="w-[280px] shrink-0 border-r border-pos-border flex flex-col">
          <div className="flex-1 p-5 space-y-4">
            {/* 매장명 */}
            <div>
              <Label size="xs" color="muted">매장명</Label>
              <p className="text-lg font-bold text-pos-text mt-1">{session.storeName}</p>
            </div>
            {/* 매장 상세 정보 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCell label="POS 번호" value={session.posNo} mono />
              <InfoCell label="담당 직원" value={session.employeeName} />
              <InfoCell label="정산 번호" value={session.adjustNo} mono />
              <InfoCell label="영업 시작" value={loginTime} mono />
            </div>
            {/* 영업 상태 표시 */}
            <div className="mt-2">
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-pos-full ${
                  businessStatus === 'OPEN'
                    ? 'bg-pos-success/10 text-pos-success'
                    : 'bg-gray-100 text-pos-text-muted'
                }`}
              >
                {businessStatus === 'OPEN' ? '영업중' : '영업 전'}
              </span>
            </div>
          </div>
          {/* 하단: 파트너 정보 + 설치업체/A/S 업체 */}
          <div className="px-5 py-3 border-t border-pos-border space-y-1">
            <Label size="xs" color="muted">v2.5.1 \u00B7 {dateTime}</Label>
            {/* TODO: RTK Query systemApi.getStoreInfo 연동 -> 파트너명, 설치업체, A/S 업체 */}
            <Label size="xs" color="muted">파트너: -</Label>
            <Label size="xs" color="muted">설치업체: - / A/S: -</Label>
          </div>
        </div>

        {/* 우측: 메뉴 버튼 + 공지사항 */}
        <div className="flex-1 flex flex-col p-6">
          {/* 공지사항 영역 (온라인 시에만 표시) */}
          {isOnline && notices.length > 0 && (
            <div className="mb-4 px-4 py-3 rounded-pos-md bg-primary-50 border border-primary-200">
              {notices.map((notice) => (
                <p key={notice.id} className="text-xs text-primary-700 truncate">
                  {notice.title}
                </p>
              ))}
            </div>
          )}

          {/* 메인 메뉴 버튼 그리드 */}
          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4">
            {menuButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={btn.handler}
                className={`flex flex-col items-center justify-center gap-2 rounded-pos-lg cursor-pointer select-none active:scale-[0.97] ${btn.color}`}
              >
                <p className="text-xl font-bold">{btn.label}</p>
                <p className={`text-2xs ${btn.id === 'business' ? 'text-white/70' : 'text-pos-text-muted'}`}>
                  {btn.sub}
                </p>
              </button>
            ))}
          </div>

          {/* 하단 유틸리티 버튼 */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {utilityButtons
              .filter((b) => !b.hidden)
              .map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.handler}
                  className="h-11 flex items-center justify-center rounded-pos-md bg-pos-surface border border-pos-border text-xs font-medium text-pos-text-secondary cursor-pointer active:bg-pos-border active:scale-[0.98]"
                >
                  {btn.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* 숨김 기능 (출퇴근, 공지사항 조회 등) -- 조건부 표시를 위한 숨김 버튼 영역 */}
      {/* TODO: feature flag 기반 조건부 표시 */}
      <div className="hidden">
        <button onClick={handleClockInOut}>출퇴근</button>
        <button onClick={handleGetNotice}>공지사항</button>
      </div>
    </div>
  );
}

// ─── Internal Components ───

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <Label size="xs" color="muted">{label}</Label>
      <p className={`text-md font-semibold text-pos-text mt-0.5 ${mono ? 'tabular-nums' : ''}`}>
        {value}
      </p>
    </div>
  );
}
