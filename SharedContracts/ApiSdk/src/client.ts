import {
  GraphQLErrorShape,
  GraphQLOperation,
  GraphQLResponseEnvelope,
} from './types.js';

export class PlatformApiSdkError extends Error {
  constructor(
    message: string,
    readonly errors: GraphQLErrorShape[],
  ) {
    super(message);
    this.name = 'PlatformApiSdkError';
  }
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
}

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
      const persistedResponse = await this.sendRequest<TData, TVariables>(
        operation,
        variables,
        options,
        true,
        authToken,
      );

      if (!this.shouldRetryWithFullDocument(persistedResponse.errors)) {
        return this.unwrapResponse(persistedResponse);
      }
    }

    const response = await this.sendRequest<TData, TVariables>(
      operation,
      variables,
      options,
      false,
      authToken,
    );

    return this.unwrapResponse(response);
  }

  private async sendRequest<TData, TVariables>(
    operation: GraphQLOperation<TData, TVariables>,
    variables: TVariables | undefined,
    options: ExecuteOptions | undefined,
    hashOnly: boolean,
    authToken?: string,
  ): Promise<GraphQLResponseEnvelope<TData>> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(this.options.headers ?? {}),
      ...(options?.headers ?? {}),
    };

    if (authToken) {
      headers.authorization = `Bearer ${authToken}`;
    }

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

    if (!hashOnly) {
      body.query = operation.document;
    }

    const response = await this.fetchImpl(this.options.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    return (await response.json()) as GraphQLResponseEnvelope<TData>;
  }

  private unwrapResponse<TData>(response: GraphQLResponseEnvelope<TData>): TData {
    if (response.errors?.length) {
      throw new PlatformApiSdkError(response.errors[0]?.message ?? 'GraphQL request failed', response.errors);
    }

    if (!response.data) {
      throw new PlatformApiSdkError('GraphQL response did not include data', []);
    }

    return response.data;
  }

  private shouldRetryWithFullDocument(errors?: GraphQLErrorShape[]): boolean {
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
