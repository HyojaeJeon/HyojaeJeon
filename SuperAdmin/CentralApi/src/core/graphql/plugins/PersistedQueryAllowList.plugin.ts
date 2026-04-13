/**
 * 한국어:
 *   Apollo Server 플러그인 — Persisted Query 허용 목록 검증을 서버 요청 파이프라인에 연결합니다.
 *
 *   Apollo Server는 "플러그인(plugin)" 패턴으로 요청 처리의 각 단계에 훅(hook)을 걸 수 있습니다.
 *   이 플러그인은 요청이 들어올 때마다 자동으로 validatePersistedQueryRequest()를 호출하여
 *   허용되지 않은 쿼리를 차단합니다.
 *
 *   동작 순서:
 *   1. 클라이언트가 GraphQL 요청을 보냄
 *   2. Apollo Server가 requestDidStart 훅을 호출
 *   3. 쿼리가 파싱되고 operation이 결정된 후 didResolveOperation 훅이 호출됨
 *   4. 여기서 validatePersistedQueryRequest()로 해시를 검증
 *   5. 검증 실패 시 에러가 던져지고 쿼리 실행이 중단됨
 *
 * Tiếng Việt:
 *   Plugin Apollo Server — kết nối kiểm tra danh sách cho phép Persisted Query vào pipeline xử lý request.
 *
 *   Apollo Server dùng mẫu "plugin" để gắn hook vào từng giai đoạn xử lý request.
 *   Plugin này tự động gọi validatePersistedQueryRequest() với mỗi request,
 *   chặn các truy vấn không được phép.
 *
 *   Thứ tự hoạt động:
 *   1. Client gửi request GraphQL
 *   2. Apollo Server gọi hook requestDidStart
 *   3. Sau khi truy vấn được parse và xác định operation, hook didResolveOperation được gọi
 *   4. Tại đây, validatePersistedQueryRequest() kiểm tra hash
 *   5. Nếu kiểm tra thất bại, ném lỗi và dừng thực thi truy vấn
 */
import { ApolloServerPlugin } from '@apollo/server';
import {
  PersistedQueryAllowListState,
  validatePersistedQueryRequest,
} from './persistedQueryAllowList';

/**
 * 한국어: Persisted Query 허용 목록 검증 플러그인을 생성합니다.
 *   state 매개변수는 loadPersistedQueryAllowList()로 미리 로드한 허용 해시 목록입니다.
 * Tiếng Việt: Tạo plugin kiểm tra danh sách cho phép Persisted Query.
 *   Tham số state là danh sách hash cho phép đã tải trước bằng loadPersistedQueryAllowList().
 */
export function createPersistedQueryAllowListPlugin(
  state: PersistedQueryAllowListState,
): ApolloServerPlugin {
  return {
    // 한국어: 모든 GraphQL 요청이 시작될 때 호출되는 훅
    // Tiếng Việt: Hook được gọi khi mỗi request GraphQL bắt đầu
    async requestDidStart() {
      return {
        // 한국어: operation이 결정된 후 호출 — 여기서 persisted query 해시를 검증합니다
        // Tiếng Việt: Được gọi sau khi xác định operation — kiểm tra hash persisted query tại đây
        async didResolveOperation(requestContext) {
          validatePersistedQueryRequest(state, {
            query: requestContext.request.query,
            operationName: requestContext.request.operationName,
            extensions: requestContext.request.extensions as {
              persistedQuery?: {
                version?: number;
                sha256Hash?: string;
              };
            },
          });
        },
      };
    },
  };
}
