import {
  ErrorPayload,
  GraphQLOperation,
  GraphQLTransportError,
  OperationResponse,
} from './types.js';

/**
 * 한국어: PlatformApiSdkError — business 실패(error payload) 또는 transport fault 를 모두 표현.
 *   - error: business 실패 응답에 포함된 ErrorPayload (있을 때)
 *   - transportErrors: GraphQL `errors` 배열 (parsing/auth/system fault)
 *
 * Tiếng Việt: PlatformApiSdkError — bao gồm cả business error và transport fault.
 */
export class PlatformApiSdkError extends Error {
  constructor(
    message: string,
    readonly error?: ErrorPayload | null,
    readonly transportErrors: GraphQLTransportError[] = [],
  ) {
    super(message);
    this.name = 'PlatformApiSdkError';
  }
}

interface RawGraphQLResponse {
  data?: Record<string, OperationResponse<unknown> | null> | null;
  errors?: GraphQLTransportError[];
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
export class PlatformApiSdk {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: PlatformApiSdkOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async execute<TData, TVariables>(
    operation: GraphQLOperation<TData, TVariables>,
    variables?: TVariables,
    options?: ExecuteOptions,
  ): Promise<TData> {
    const authToken = await this.options.getAuthToken?.();

    if (this.options.usePersistedQueries) {
      const persistedResponse = await this.sendRequest(
        operation,
        variables,
        options,
        true,
        authToken,
      );

      if (!this.shouldRetryWithFullDocument(persistedResponse.errors)) {
        return this.unwrapResponse<TData>(operation, persistedResponse);
      }
    }

    const response = await this.sendRequest(
      operation,
      variables,
      options,
      false,
      authToken,
    );
    return this.unwrapResponse<TData>(operation, response);
  }

  private async sendRequest<TVariables>(
    operation: GraphQLOperation<unknown, TVariables>,
    variables: TVariables | undefined,
    options: ExecuteOptions | undefined,
    hashOnly: boolean,
    authToken?: string,
  ): Promise<RawGraphQLResponse> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(this.options.headers ?? {}),
      ...(options?.headers ?? {}),
    };
    if (authToken) headers.authorization = `Bearer ${authToken}`;
    if (options?.acceptLanguage) headers['accept-language'] = options.acceptLanguage;
    if (options?.requestId) headers['x-request-id'] = options.requestId;

    const body: Record<string, unknown> = {
      operationName: operation.operationName,
      variables: variables ?? {},
    };

    if (this.options.usePersistedQueries) {
      body.extensions = {
        persistedQuery: {
          version: 1,
          sha256Hash: await this.sha256(operation.document),
        },
      };
    }

    if (!hashOnly) body.query = operation.document;

    const response = await this.fetchImpl(this.options.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    return (await response.json()) as RawGraphQLResponse;
  }

  /**
   * 한국어: GraphQL 응답을 풀어 OperationResponse 의 success.data 를 반환한다.
   *   error payload 가 있으면 PlatformApiSdkError 로 throw.
   *   transport-level GraphQL errors 가 있으면 PlatformApiSdkError 로 throw.
   */
  private unwrapResponse<TData>(
    operation: GraphQLOperation<TData, unknown>,
    response: RawGraphQLResponse,
  ): TData {
    if (response.errors?.length) {
      throw new PlatformApiSdkError(
        response.errors[0]?.message ?? 'GraphQL transport error',
        null,
        response.errors,
      );
    }

    if (!response.data) {
      throw new PlatformApiSdkError('GraphQL response did not include data', null, []);
    }

    // Find the only field in data (operation root)
    const fieldName = Object.keys(response.data)[0];
    if (!fieldName) {
      throw new PlatformApiSdkError('GraphQL response did not include any field', null, []);
    }
    const op = response.data[fieldName];
    if (!op) {
      throw new PlatformApiSdkError(`GraphQL field ${fieldName} returned null`, null, []);
    }
    if (op.error) {
      throw new PlatformApiSdkError(op.error.message, op.error, []);
    }
    if (!op.success) {
      throw new PlatformApiSdkError(
        `GraphQL field ${fieldName} returned neither success nor error`,
        null,
        [],
      );
    }
    return op.success.data as TData;
  }

  private shouldRetryWithFullDocument(errors?: GraphQLTransportError[]): boolean {
    if (!errors?.length) return false;
    return errors.some((error) =>
      ['PERSISTED_QUERY_NOT_FOUND', 'PERSISTED_QUERY_NOT_SUPPORTED'].includes(
        String(error.extensions?.code ?? ''),
      ),
    );
  }

  private async sha256(document: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(document));
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');
  }
}
