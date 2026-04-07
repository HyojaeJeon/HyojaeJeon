export class PlatformApiSdkError extends Error {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.name = 'PlatformApiSdkError';
    }
}
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
                return this.unwrapResponse(persistedResponse);
            }
        }
        const response = await this.sendRequest(operation, variables, options, false, authToken);
        return this.unwrapResponse(response);
    }
    async sendRequest(operation, variables, options, hashOnly, authToken) {
        const headers = {
            'content-type': 'application/json',
            ...(this.options.headers ?? {}),
            ...(options?.headers ?? {}),
        };
        if (authToken) {
            headers.authorization = `Bearer ${authToken}`;
        }
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
        if (!hashOnly) {
            body.query = operation.document;
        }
        const response = await this.fetchImpl(this.options.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: options?.signal,
        });
        return (await response.json());
    }
    unwrapResponse(response) {
        if (response.errors?.length) {
            throw new PlatformApiSdkError(response.errors[0]?.message ?? 'GraphQL request failed', response.errors);
        }
        if (!response.data) {
            throw new PlatformApiSdkError('GraphQL response did not include data', []);
        }
        return response.data;
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
