/**
 * 한국어:
 *   Persisted Query(사전 등록 쿼리) 허용 목록 시스템.
 *
 *   Persisted Query란?
 *   - 일반적으로 GraphQL 클라이언트는 쿼리 텍스트 전체를 서버에 보냅니다.
 *   - Persisted Query는 쿼리를 미리 등록하고, 해시(hash) 값만 보내는 방식입니다.
 *   - 마치 "비밀번호 대신 ID 카드를 보여주는 것"과 같습니다.
 *
 *   왜 중요한가요? (보안)
 *   - 프로덕션 환경에서 아무나 임의의 쿼리를 실행하는 것을 방지합니다.
 *   - manifest 파일에 등록된 쿼리 해시만 허용하므로, 허가되지 않은 쿼리는 거부됩니다.
 *
 *   동작 흐름:
 *   1. 빌드 시 모든 허용된 쿼리의 SHA-256 해시가 manifest 파일에 저장됩니다.
 *   2. 서버 시작 시 loadPersistedQueryAllowList()가 manifest를 읽어 해시 Set을 만듭니다.
 *   3. 요청이 올 때마다 validatePersistedQueryRequest()가 해시를 확인합니다.
 *
 * Tiếng Việt:
 *   Hệ thống danh sách cho phép Persisted Query (truy vấn đã đăng ký trước).
 *
 *   Persisted Query là gì?
 *   - Thông thường, client GraphQL gửi toàn bộ văn bản truy vấn đến server.
 *   - Persisted Query đăng ký truy vấn trước và chỉ gửi giá trị hash.
 *   - Giống như "trình thẻ ID thay vì nói mật khẩu".
 *
 *   Tại sao quan trọng? (Bảo mật)
 *   - Ngăn chặn việc thực thi truy vấn tùy ý trong môi trường production.
 *   - Chỉ chấp nhận hash đã đăng ký trong file manifest, từ chối truy vấn không được phép.
 *
 *   Luồng hoạt động:
 *   1. Khi build, hash SHA-256 của tất cả truy vấn được lưu trong file manifest.
 *   2. Khi server khởi động, loadPersistedQueryAllowList() đọc manifest và tạo Set các hash.
 *   3. Với mỗi request, validatePersistedQueryRequest() kiểm tra hash.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { GraphQLError } from 'graphql';

// 한국어: manifest 파일 안에 있는 개별 쿼리 항목 (쿼리 이름 + SHA-256 해시)
// Tiếng Việt: Mỗi mục truy vấn trong file manifest (tên truy vấn + hash SHA-256)
interface PersistedQueryManifestEntry {
  operationName: string;
  sha256Hash: string;
}

// 한국어: manifest 파일 전체의 구조 (생성 시각, 쿼리 수, 쿼리 목록)
// Tiếng Việt: Cấu trúc toàn bộ file manifest (thời gian tạo, số lượng truy vấn, danh sách truy vấn)
interface PersistedQueryManifestFile {
  generatedAt: string;
  operationCount?: number;
  operations: PersistedQueryManifestEntry[];
}

// 한국어: 클라이언트가 요청에 포함하는 persistedQuery 확장 정보 (버전 + 해시)
// Tiếng Việt: Thông tin extension persistedQuery mà client gửi kèm request (version + hash)
interface PersistedQueryExtensionShape {
  version?: number;
  sha256Hash?: string;
}

// 한국어: GraphQL 요청의 형태 — 쿼리 텍스트, 오퍼레이션 이름, 확장 정보를 포함
// Tiếng Việt: Cấu trúc request GraphQL — bao gồm văn bản truy vấn, tên operation, và thông tin extension
interface GraphQLRequestShape {
  query?: string;
  operationName?: string;
  extensions?: {
    persistedQuery?: PersistedQueryExtensionShape;
  };
}

// 한국어: 설정 옵션 — 기능 활성화 여부, persisted query 강제 여부, manifest 파일 경로
// Tiếng Việt: Tùy chọn cấu hình — bật/tắt tính năng, bắt buộc persisted query hay không, đường dẫn file manifest
export interface PersistedQueryAllowListOptions {
  enabled: boolean;
  requirePersistedQueries: boolean;
  manifestPath?: string;
  searchPaths?: string[];
}

// 한국어: 로드된 상태 — manifest에서 읽어온 허용 해시 Set을 포함
// Tiếng Việt: Trạng thái đã tải — bao gồm Set các hash cho phép đã đọc từ manifest
export interface PersistedQueryAllowListState {
  enabled: boolean;
  requirePersistedQueries: boolean;
  manifestPath?: string;
  hashes: ReadonlySet<string>;
}

/**
 * 한국어: manifest 파일을 찾을 기본 경로 목록을 반환합니다. 여러 위치를 순서대로 탐색합니다.
 * Tiếng Việt: Trả về danh sách đường dẫn mặc định để tìm file manifest. Tìm kiếm lần lượt nhiều vị trí.
 */
export function defaultPersistedQueryAllowListPaths(cwd = process.cwd()): string[] {
  return [
    path.resolve(
      cwd,
      'src/core/graphql/plugins/persisted-query-allow-list.generated.json',
    ),
    path.resolve(
      cwd,
      'dist/core/graphql/plugins/persisted-query-allow-list.generated.json',
    ),
    path.resolve(
      cwd,
      'src/common/graphql/persisted-query-allow-list.generated.json',
    ),
    path.resolve(
      cwd,
      'dist/common/graphql/persisted-query-allow-list.generated.json',
    ),
    path.resolve(
      cwd,
      '../../SharedContracts/ApiSdk/dist/persisted-operation-manifest.json',
    ),
    path.resolve(
      cwd,
      '../SharedContracts/ApiSdk/dist/persisted-operation-manifest.json',
    ),
  ];
}

/**
 * 한국어: manifest 파일을 읽어서 허용된 쿼리 해시 목록을 메모리에 로드합니다.
 *   기능이 비활성화(enabled=false)이면 빈 상태를 반환합니다.
 *   manifest 파일을 찾지 못하면 에러를 던집니다.
 * Tiếng Việt: Đọc file manifest và tải danh sách hash truy vấn cho phép vào bộ nhớ.
 *   Nếu tính năng tắt (enabled=false), trả về trạng thái rỗng.
 *   Nếu không tìm thấy file manifest, ném lỗi.
 */
export function loadPersistedQueryAllowList(
  options: PersistedQueryAllowListOptions,
): PersistedQueryAllowListState {
  if (!options.enabled) {
    return {
      enabled: false,
      requirePersistedQueries: false,
      hashes: new Set<string>(),
    };
  }

  const candidatePaths = [
    options.manifestPath,
    ...(options.searchPaths ?? []),
    ...defaultPersistedQueryAllowListPaths(),
  ].filter((value): value is string => Boolean(value));

  const manifestPath = candidatePaths.find((candidatePath) =>
    existsSync(candidatePath),
  );

  if (!manifestPath) {
    throw new Error(
      'Persisted query allow-list is enabled but no manifest file could be found.',
    );
  }

  const manifest = JSON.parse(
    readFileSync(manifestPath, 'utf8'),
  ) as PersistedQueryManifestFile;

  return {
    enabled: true,
    requirePersistedQueries: options.requirePersistedQueries,
    manifestPath,
    hashes: new Set(manifest.operations.map((entry) => entry.sha256Hash)),
  };
}

/**
 * 한국어: 들어온 GraphQL 요청이 허용 목록에 있는지 검증합니다.
 *   3가지 경우에 에러를 던집니다:
 *   1. persisted query가 필수인데 해시가 없는 경우 (PERSISTED_QUERY_ONLY)
 *   2. 해시가 허용 목록에 없는 경우 (PERSISTED_QUERY_NOT_ALLOWED)
 *   3. 쿼리 텍스트의 실제 해시가 전송된 해시와 다른 경우 (PERSISTED_QUERY_HASH_MISMATCH)
 *
 * Tiếng Việt: Xác minh request GraphQL có nằm trong danh sách cho phép hay không.
 *   Ném lỗi trong 3 trường hợp:
 *   1. Persisted query bắt buộc nhưng không có hash (PERSISTED_QUERY_ONLY)
 *   2. Hash không có trong danh sách cho phép (PERSISTED_QUERY_NOT_ALLOWED)
 *   3. Hash thực tế của văn bản truy vấn khác với hash được gửi (PERSISTED_QUERY_HASH_MISMATCH)
 */
export function validatePersistedQueryRequest(
  state: PersistedQueryAllowListState,
  request: GraphQLRequestShape,
): void {
  if (!state.enabled) {
    return;
  }

  const persistedQuery = request.extensions?.persistedQuery;
  const sha256Hash = persistedQuery?.sha256Hash;

  // 한국어: 해시가 없는 경우 — persisted query 필수 모드이면 거부, 아니면 통과
  // Tiếng Việt: Không có hash — nếu chế độ bắt buộc persisted query thì từ chối, nếu không thì cho qua
  if (!sha256Hash) {
    if (state.requirePersistedQueries) {
      throw new GraphQLError('Persisted query extension is required', {
        extensions: {
          code: 'PERSISTED_QUERY_ONLY',
        },
      });
    }

    return;
  }

  // 한국어: 허용 목록(Set)에 해시가 있는지 확인 — 없으면 등록되지 않은 쿼리이므로 거부
  // Tiếng Việt: Kiểm tra hash có trong danh sách cho phép (Set) — nếu không có thì từ chối vì truy vấn chưa đăng ký
  if (!state.hashes.has(sha256Hash)) {
    throw new GraphQLError('Persisted query is not allow-listed', {
      extensions: {
        code: 'PERSISTED_QUERY_NOT_ALLOWED',
        operationName: request.operationName,
      },
    });
  }

  // 한국어: 쿼리 텍스트가 함께 전송된 경우, 실제 해시를 계산해서 전송된 해시와 일치하는지 이중 확인
  // Tiếng Việt: Nếu văn bản truy vấn cũng được gửi kèm, tính hash thực tế và kiểm tra lần nữa xem có khớp không
  if (request.query) {
    const actualHash = createHash('sha256').update(request.query).digest('hex');

    if (actualHash !== sha256Hash) {
      throw new GraphQLError('Persisted query hash mismatch', {
        extensions: {
          code: 'PERSISTED_QUERY_HASH_MISMATCH',
          operationName: request.operationName,
        },
      });
    }
  }
}
