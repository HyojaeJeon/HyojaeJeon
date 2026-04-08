import { ErrorPayload, GraphQLOperation, GraphQLTransportError } from './types.js';
/**
 * 한국어: PlatformApiSdkError — business 실패(error payload) 또는 transport fault 를 모두 표현.
 *   - error: business 실패 응답에 포함된 ErrorPayload (있을 때)
 *   - transportErrors: GraphQL `errors` 배열 (parsing/auth/system fault)
 *
 * Tiếng Việt: PlatformApiSdkError — bao gồm cả business error và transport fault.
 */
export declare class PlatformApiSdkError extends Error {
    readonly error?: (ErrorPayload | null) | undefined;
    readonly transportErrors: GraphQLTransportError[];
    constructor(message: string, error?: (ErrorPayload | null) | undefined, transportErrors?: GraphQLTransportError[]);
}
export interface PlatformApiSdkOptions {
    endpoint: string;
    headers?: Record<string, string>;
    usePersistedQueries?: boolean;
    getAuthToken?: () => string | Promise<string | undefined> | undefined;
    fetchImpl?: typeof fetch;
}
export interface ExecuteOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Accept-Language 헤더 명시 override (e.g. 'ko', 'en', 'vi'). */
    acceptLanguage?: string;
    /** 클라이언트가 발급한 request id (서버는 헤더가 있으면 그대로 사용). */
    requestId?: string;
}
/**
 * 한국어: PlatformApiSdk — 모든 호출이 OperationResponse<T> 를 반환하도록 정규화한다.
 *   - 성공: success.data 를 반환
 *   - business 실패: error payload 를 PlatformApiSdkError 로 throw
 *   - transport fault: GraphQL errors 를 PlatformApiSdkError 로 throw
 *
 * Tiếng Việt: SDK chuẩn hoá mọi response thành OperationResponse và throw lỗi nếu thất bại.
 */
export declare class PlatformApiSdk {
    private readonly options;
    private readonly fetchImpl;
    constructor(options: PlatformApiSdkOptions);
    execute<TData, TVariables>(operation: GraphQLOperation<TData, TVariables>, variables?: TVariables, options?: ExecuteOptions): Promise<TData>;
    private sendRequest;
    /**
     * 한국어: GraphQL 응답을 풀어 OperationResponse 의 success.data 를 반환한다.
     *   error payload 가 있으면 PlatformApiSdkError 로 throw.
     *   transport-level GraphQL errors 가 있으면 PlatformApiSdkError 로 throw.
     */
    private unwrapResponse;
    private shouldRetryWithFullDocument;
    private sha256;
}
