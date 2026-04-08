/**
 * 한국어: PlatformApiSdkError — business 실패(error payload) 또는 transport fault 를 모두 표현.
 *   - error: business 실패 응답에 포함된 ErrorPayload (있을 때)
 *   - transportErrors: GraphQL `errors` 배열 (parsing/auth/system fault)
 *
 * Tiếng Việt: PlatformApiSdkError — bao gồm cả business error và transport fault.
 */
export class PlatformApiSdkError extends Error {
    error;
    transportErrors;
    constructor(message, error, transportErrors = []) {
        super(message);
        this.error = error;
        this.transportErrors = transportErrors;
        this.name = 'PlatformApiSdkError';
    }
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
    options;
    fetchImpl;
    constructor(options) {
        this.options = options;
        this.fetchImpl = options.fetchImpl ?? fetch;
    }
    async execute(operation, variables, options) {
        const authToken = await this.options.getAuthToken?.();
        if (this.options.usePersistedQueries) {
            const persistedResponse = await this.sendRequest(operation, variables, options, true, authToken);
            if (!this.shouldRetryWithFullDocument(persistedResponse.errors)) {
                return this.unwrapResponse(operation, persistedResponse);
            }
        }
        const response = await this.sendRequest(operation, variables, options, false, authToken);
        return this.unwrapResponse(operation, response);
    }
    async sendRequest(operation, variables, options, hashOnly, authToken) {
        const headers = {
            'content-type': 'application/json',
            ...(this.options.headers ?? {}),
            ...(options?.headers ?? {}),
        };
        if (authToken)
            headers.authorization = `Bearer ${authToken}`;
        if (options?.acceptLanguage)
            headers['accept-language'] = options.acceptLanguage;
        if (options?.requestId)
            headers['x-request-id'] = options.requestId;
        const body = {
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
        if (!hashOnly)
            body.query = operation.document;
        const response = await this.fetchImpl(this.options.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: options?.signal,
        });
        return (await response.json());
    }
    /**
     * 한국어: GraphQL 응답을 풀어 OperationResponse 의 success.data 를 반환한다.
     *   error payload 가 있으면 PlatformApiSdkError 로 throw.
     *   transport-level GraphQL errors 가 있으면 PlatformApiSdkError 로 throw.
     */
    unwrapResponse(operation, response) {
        if (response.errors?.length) {
            throw new PlatformApiSdkError(response.errors[0]?.message ?? 'GraphQL transport error', null, response.errors);
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
            throw new PlatformApiSdkError(`GraphQL field ${fieldName} returned neither success nor error`, null, []);
        }
        return op.success.data;
    }
    shouldRetryWithFullDocument(errors) {
        if (!errors?.length)
            return false;
        return errors.some((error) => ['PERSISTED_QUERY_NOT_FOUND', 'PERSISTED_QUERY_NOT_SUPPORTED'].includes(String(error.extensions?.code ?? '')));
    }
    async sha256(document) {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(document));
        return Array.from(new Uint8Array(digest))
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('');
    }
}
