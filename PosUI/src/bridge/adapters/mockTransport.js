import tableMockData from '../mocks/screens/table.json';
import menuMockData from '../mocks/screens/menu.json';

/**
 * Mock Transport — 디자인 시스템 / 개발 환경용
 * C++ cefQuery 동작을 시뮬레이션한다.
 * envelope 규격: { v, requestId, timestamp, cmd, params, idempotencyKey? }
 * 응답 규격:     { v, requestId, timestamp, ok, code, data?, error? }
 */
export const mockTransport = async (envelope) => {
  const { cmd, params = {}, requestId, timestamp, v } = envelope;

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
      const scenario = params.scenario || 'default';
      const data = tableMockData.scenarios[scenario] || tableMockData.scenarios['default'];
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
      const data = menuMockData.scenarios?.default || { categories: [], items: [] };
      return makeSuccess(v, requestId, data);
    }

    case 'SYSTEM:BOOTSTRAP': {
      return makeSuccess(v, requestId, {
        posId: 'POS-DEV-001',
        storeName: '개발용 매장',
        operatorId: 'admin',
        dbConnected: true,
        internetConnected: true,
        mqttConnected: false,
        paymentGatewayConnected: false,
        printerConnected: false,
        syncBacklogCount: 0,
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

function makeSuccess(v, requestId, data) {
  return {
    v: v || 1,
    requestId,
    timestamp: new Date().toISOString(),
    ok: true,
    code: 'OK',
    data,
  };
}

function makeError(v, requestId, code, message) {
  return {
    v: v || 1,
    requestId,
    timestamp: new Date().toISOString(),
    ok: false,
    code,
    error: { message },
  };
}
