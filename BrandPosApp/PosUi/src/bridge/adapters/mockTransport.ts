import tableMockData from '../mocks/screens/table.json';
import menuMockData from '../mocks/screens/menu.json';

interface Envelope {
  v: number;
  requestId: string;
  timestamp: string;
  cmd: string;
  params: Record<string, unknown>;
  idempotencyKey?: string;
}

interface MockResponse {
  v: number;
  requestId: string;
  timestamp: string;
  ok: boolean;
  code: string;
  data?: unknown;
  error?: { message: string };
}

/**
 * Mock 세션 저장소
 * 실제 운영에서는 C++ SQLite가 담당. mock에서는 메모리로 시뮬레이션.
 */
let mockSession: Record<string, unknown> | null = null;
let mockTheme: string = 'light';

/**
 * Mock Transport — 디자인 시스템 / 개발 환경용
 * C++ cefQuery 동작을 시뮬레이션한다.
 */
export const mockTransport = async (envelope: Envelope): Promise<MockResponse> => {
  const { cmd, params = {}, requestId, v } = envelope;

  // 네트워크 지연 시뮬레이션
  const delayMs = typeof window !== 'undefined' && window.__MOCK_DELAY_MS != null
    ? window.__MOCK_DELAY_MS
    : 200;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // 오프라인 시뮬레이션
  if (typeof window !== 'undefined' && window.__MOCK_OFFLINE) {
    return makeError(v, requestId, 'TRANSPORT_ERROR', 'Device is currently offline');
  }

  switch (cmd) {
    case 'TABLE:GET_ALL': {
      const scenario = (params.scenario as string) || 'default';
      const scenarios = tableMockData.scenarios as Record<string, unknown>;
      const data = scenarios[scenario] || scenarios['default'];
      return makeSuccess(v, requestId, data);
    }

    case 'TABLE:SELECT': {
      const allTables = tableMockData.scenarios['default'].tables;
      const table = allTables.find((t) => t.id === params.id);
      if (!table) {
        return makeError(v, requestId, 'NOT_FOUND', `Table ${params.id} not found`);
      }
      return makeSuccess(v, requestId, { ...table, status: 'OCCUPIED' });
    }

    case 'MENU:GET_ALL': {
      const scenarios = (menuMockData as { scenarios?: { default?: unknown } }).scenarios;
      const data = scenarios?.default || { categories: [], items: [] };
      return makeSuccess(v, requestId, data);
    }

    case 'AUTH:LOGIN': {
      // 인증 시뮬레이션 (1초 지연)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const empId = params.employeeId as string;
      const pw = params.password as string;
      // mock: ID "000" + PW "1234" → 성공, 그 외 실패
      if (empId === '000' && pw === '1234') {
        mockSession = {
          employeeId: empId,
          employeeName: '김민수',
          role: 'MANAGER',
          storeCode: '09270',
          storeName: '효정 레스토랑 강남점',
          posNo: 'POS-001',
          adjustNo: '001',
          loginAt: new Date().toISOString(),
        };
        return makeSuccess(v, requestId, mockSession);
      }
      return makeError(v, requestId, 'AUTH_FAILED', '사원번호 또는 비밀번호가 일치하지 않습니다');
    }

    case 'AUTH:LOGOUT': {
      mockSession = null;
      return makeSuccess(v, requestId, null);
    }

    case 'SYSTEM:SET_THEME': {
      mockTheme = (params.theme as string) === 'dark' ? 'dark' : 'light';
      return makeSuccess(v, requestId, { theme: mockTheme });
    }

    case 'SYSTEM:BOOTSTRAP': {
      return makeSuccess(v, requestId, {
        posId: 'POS-DEV-001',
        storeName: '개발용 매장',
        dbConnected: true,
        internetConnected: true,
        mqttConnected: false,
        printerConnected: false,
        syncBacklogCount: 0,
        session: mockSession,
        theme: mockTheme,
      });
    }

    case 'ORDER:GET': {
      return makeSuccess(v, requestId, {
        orderId: params.orderId || 1,
        tableId: params.tableId,
        items: [],
        totalAmount: 0,
        status: 'NORMAL',
      });
    }

    case 'ORDER:ADD_ITEM': {
      return makeSuccess(v, requestId, {
        orderId: 1,
        tableId: params.tableId,
        menuId: params.menuId,
        quantity: params.quantity || 1,
        status: 'NORMAL',
      });
    }

    case 'PAYMENT:EXECUTE': {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return makeSuccess(v, requestId, {
        paymentId: `PAY-${Date.now()}`,
        orderId: params.orderId,
        amount: params.amount,
        status: 'SUCCESS',
      });
    }

    default:
      console.warn(`[MockTransport] Unhandled cmd: ${cmd}`);
      return makeSuccess(v, requestId, null);
  }
};

function makeSuccess(v: number, requestId: string, data: unknown): MockResponse {
  return { v: v || 1, requestId, timestamp: new Date().toISOString(), ok: true, code: 'OK', data };
}

function makeError(v: number, requestId: string, code: string, message: string): MockResponse {
  return { v: v || 1, requestId, timestamp: new Date().toISOString(), ok: false, code, error: { message } };
}
