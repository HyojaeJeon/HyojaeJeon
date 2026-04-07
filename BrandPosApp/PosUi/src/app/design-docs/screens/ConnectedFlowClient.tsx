'use client';

import { lazy, Suspense, useCallback, useMemo, useState } from 'react';

type FlowScreen =
  | 'login'
  | 'main-menu'
  | 'table'
  | 'order'
  | 'payment'
  | 'customer'
  | 'employee'
  | 'stock'
  | 'setup'
  | 'maintenance'
  | 'analysis';

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

const LazyLoginScreen = lazy(() => import('@screens/LoginScreen'));
const LazyMainMenuScreen = lazy(() => import('@screens/MainMenuScreen'));
const LazyTableScreen = lazy(() => import('@screens/TableScreen'));
const LazyOrderScreen = lazy(() => import('@screens/OrderScreen'));
const LazyPaymentScreen = lazy(() => import('@screens/PaymentScreen'));
const LazyCustomerScreen = lazy(() => import('@screens/CustomerScreen'));
const LazyEmployeeScreen = lazy(() => import('@screens/EmployeeScreen'));
const LazyStockScreen = lazy(() => import('@screens/StockScreen'));
const LazySetupScreen = lazy(() => import('@screens/SetupScreen'));
const LazyMaintenanceScreen = lazy(() => import('@screens/MaintenanceScreen'));

const DEMO_SESSION_BASE = {
  employeeId: 'EMP001',
  employeeName: '김민수',
  role: 'MANAGER',
  storeCode: 'S001',
  storeName: '효정 레스토랑 강남점',
  posNo: 'POS-001',
  adjustNo: '001',
};

function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-pos-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        <p className="text-sm text-pos-text-muted">화면을 불러오는 중...</p>
      </div>
    </div>
  );
}

function FlowPlaceholder({
  title,
  description,
  onBack,
}: {
  title: string;
  description: string;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-pos-bg text-pos-text">
      <div className="rounded-2xl border border-pos-border bg-pos-surface px-8 py-6 shadow-pos-card">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-pos-text-muted">{description}</p>
      </div>
      <button
        type="button"
        className="rounded-pos-btn bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
        onClick={onBack}
      >
        메인으로 돌아가기
      </button>
    </div>
  );
}

export default function ConnectedFlowClient() {
  const [screen, setScreen] = useState<FlowScreen>('login');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [events, setEvents] = useState<string[]>(['FLOW_READY']);
  const flowScreens: FlowScreen[] = [
    'login',
    'main-menu',
    'table',
    'order',
    'payment',
    'customer',
    'employee',
    'stock',
    'setup',
    'maintenance',
    'analysis',
  ];

  const record = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setEvents((prev) => [`${timestamp} ${message}`, ...prev].slice(0, 12));
  }, []);

  const goTo = useCallback((next: FlowScreen, reason: string) => {
    setScreen(next);
    record(reason);
  }, [record]);

  const resetFlow = useCallback(() => {
    setSession(null);
    setScreen('login');
    setEvents(['FLOW_RESET']);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setSession({
      ...DEMO_SESSION_BASE,
      loginAt: new Date().toISOString(),
    });
    goTo('main-menu', 'LOGIN -> MAIN_MENU');
  }, [goTo]);

  const handleMainNavigate = useCallback((target: string) => {
    switch (target) {
      case 'TableScreen':
        goTo('table', 'MAIN_MENU -> TABLE');
        break;
      case 'CustomerScreen':
        goTo('customer', 'MAIN_MENU -> CUSTOMER');
        break;
      case 'SetupScreen':
        goTo('setup', 'MAIN_MENU -> SETUP');
        break;
      case 'StockScreen':
        goTo('stock', 'MAIN_MENU -> STOCK');
        break;
      case 'AnalysisScreen':
        goTo('analysis', 'MAIN_MENU -> ANALYSIS');
        break;
      default:
        record(`MAIN_MENU -> ${target}`);
        break;
    }
  }, [goTo, record]);

  const handleTableNavigate = useCallback((target: 'MainMenu' | 'Order' | 'Payment') => {
    if (target === 'MainMenu') {
      goTo('main-menu', 'TABLE -> MAIN_MENU');
      return;
    }
    if (target === 'Order') {
      goTo('order', 'TABLE -> ORDER');
      return;
    }
    if (target === 'Payment') {
      goTo('payment', 'TABLE -> PAYMENT');
    }
  }, [goTo]);

  const handleOrderNavigate = useCallback((target: 'MainMenu' | 'Table' | 'Payment') => {
    if (target === 'MainMenu') {
      goTo('main-menu', 'ORDER -> MAIN_MENU');
      return;
    }
    if (target === 'Table') {
      goTo('table', 'ORDER -> TABLE');
      return;
    }
    if (target === 'Payment') {
      goTo('payment', 'ORDER -> PAYMENT');
    }
  }, [goTo]);

  const handlePaymentNavigate = useCallback((target: 'MainMenu' | 'Table' | 'Order') => {
    if (target === 'MainMenu') {
      goTo('main-menu', 'PAYMENT -> MAIN_MENU');
      return;
    }
    if (target === 'Table') {
      goTo('table', 'PAYMENT -> TABLE');
      return;
    }
    if (target === 'Order') {
      goTo('order', 'PAYMENT -> ORDER');
    }
  }, [goTo]);

  const screenTitle = useMemo<Record<FlowScreen, string>>(() => ({
    login: '로그인',
    'main-menu': '메인 메뉴',
    table: '테이블',
    order: '주문',
    payment: '결제',
    customer: '고객',
    employee: '직원',
    stock: '재고/매입',
    setup: '설정',
    maintenance: '유지보수',
    analysis: '분석(준비 중)',
  }), []);

  const currentSession = session ?? {
    ...DEMO_SESSION_BASE,
    loginAt: '-',
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.95),rgba(15,23,42,1)_58%)] text-white">
      <header className="border-b border-white/10 bg-slate-950/65 backdrop-blur">
        <div className="mx-auto flex max-w-[1640px] flex-col gap-3 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.34em] text-slate-400">Connected POS Flow</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-white">로그인 → 메인 → 테이블 → 주문 → 결제</h1>
                <span className="rounded-full border border-primary-400/30 bg-primary-500/15 px-3 py-1 text-xs font-semibold text-primary-100">
                  {screenTitle[screen]}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={resetFlow}
              className="shrink-0 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/12"
            >
              초기화
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {flowScreens.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setScreen(key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  screen === key
                    ? 'bg-primary-500 text-white shadow-[0_10px_24px_rgba(239,68,68,0.25)]'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                {screenTitle[key]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1640px] px-4 py-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
            <span>Live preview · 1024 × 768</span>
            <span>{session ? `${session.employeeName} · ${session.storeName}` : '로그인 대기'}</span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[1410px] items-start gap-6">
              <div className="relative h-[768px] w-[1024px] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-pos-bg shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
                <Suspense fallback={<LoadingSpinner />}>
                  {screen === 'login' && (
                    <LazyLoginScreen
                      onLoginSuccess={handleLoginSuccess}
                      initialEmployeeId="000"
                      initialPassword="1234"
                      initialDeposit="0"
                    />
                  )}
                  {screen === 'main-menu' && (
                    <LazyMainMenuScreen session={currentSession} onNavigate={handleMainNavigate} />
                  )}
                  {screen === 'table' && <LazyTableScreen onNavigate={handleTableNavigate} />}
                  {screen === 'order' && <LazyOrderScreen />}
                {screen === 'payment' && (
                  <LazyPaymentScreen
                    onNavigate={handlePaymentNavigate}
                    onBack={() => goTo('order', 'PAYMENT -> ORDER')}
                    onClose={() => goTo('table', 'PAYMENT -> TABLE')}
                  />
                )}
                {screen === 'customer' && <LazyCustomerScreen onClose={() => setScreen('main-menu')} />}
                {screen === 'employee' && <LazyEmployeeScreen onClose={() => setScreen('main-menu')} />}
                {screen === 'stock' && <LazyStockScreen onClose={() => setScreen('main-menu')} />}
                {screen === 'setup' && <LazySetupScreen onClose={() => setScreen('main-menu')} />}
                {screen === 'maintenance' && <LazyMaintenanceScreen onClose={() => setScreen('main-menu')} />}
                {screen === 'analysis' && (
                  <FlowPlaceholder
                    title="분석 화면"
                    description="아직 실제 분석 화면 컴포넌트가 연결되지 않았습니다."
                    onBack={() => setScreen('main-menu')}
                    />
                  )}
                </Suspense>
              </div>

              <aside className="grid w-[360px] shrink-0 gap-4 self-start">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/72 p-4 text-slate-100">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Current</div>
                  <div className="mt-1 text-xl font-bold">{screenTitle[screen]}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {session ? `${session.employeeName} · ${session.storeName}` : '로그인 대기'}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-slate-400">Bridge</div>
                      <div className="mt-1 font-semibold">mockTransport</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-slate-400">Session</div>
                      <div className="mt-1 font-semibold">{session ? 'ACTIVE' : 'EMPTY'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-slate-400">Login ID</div>
                      <div className="mt-1 font-semibold">{session?.employeeId ?? '000'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-slate-400">POS No</div>
                      <div className="mt-1 font-semibold">{session?.posNo ?? 'POS-001'}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/72 p-4 text-slate-100">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Flow Trace</div>
                  <div className="mt-3 space-y-2 text-[11px] text-slate-300">
                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono">LOGIN → MAIN_MENU</div>
                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono">MAIN_MENU → TABLE / ORDER / PAYMENT</div>
                    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono">TABLE → ORDER → PAYMENT</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/72 p-4 text-slate-100">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Demo Credentials</div>
                  <div className="mt-2 grid gap-2 text-sm">
                    <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
                      <span className="text-slate-400">Employee ID</span>
                      <span className="font-mono font-semibold">000</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
                      <span className="text-slate-400">Password</span>
                      <span className="font-mono font-semibold">1234</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/72 p-4 text-slate-100">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Event Log</div>
                  <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto text-[11px] text-slate-300">
                    {events.map((event, index) => (
                      <div key={`${event}-${index}`} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono">
                        {event}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
