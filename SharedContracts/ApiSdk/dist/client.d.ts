import { GraphQLErrorShape, GraphQLOperation } from './types.js';
export declare class PlatformApiSdkError extends Error {
    readonly errors: GraphQLErrorShape[];
    constructor(message: string, errors: GraphQLErrorShape[]);
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
export declare class PlatformApiSdk {
    private readonly options;
    private readonly fetchImpl;
    constructor(options: PlatformApiSdkOptions);
    execute<TData, TVariables>(operation: GraphQLOperation<TData, TVariables>, variables?: TVariables, options?: ExecuteOptions): Promise<TData>;
    private sendRequest;
    private unwrapResponse;
    private shouldRetryWithFullDocument;
    private sha256;
}
