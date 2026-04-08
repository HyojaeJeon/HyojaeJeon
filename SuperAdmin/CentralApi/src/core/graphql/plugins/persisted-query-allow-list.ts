import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { GraphQLError } from 'graphql';

interface PersistedQueryManifestEntry {
  operationName: string;
  sha256Hash: string;
}

interface PersistedQueryManifestFile {
  generatedAt: string;
  operationCount?: number;
  operations: PersistedQueryManifestEntry[];
}

interface PersistedQueryExtensionShape {
  version?: number;
  sha256Hash?: string;
}

interface GraphQLRequestShape {
  query?: string;
  operationName?: string;
  extensions?: {
    persistedQuery?: PersistedQueryExtensionShape;
  };
}

export interface PersistedQueryAllowListOptions {
  enabled: boolean;
  requirePersistedQueries: boolean;
  manifestPath?: string;
  searchPaths?: string[];
}

export interface PersistedQueryAllowListState {
  enabled: boolean;
  requirePersistedQueries: boolean;
  manifestPath?: string;
  hashes: ReadonlySet<string>;
}

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

export function validatePersistedQueryRequest(
  state: PersistedQueryAllowListState,
  request: GraphQLRequestShape,
): void {
  if (!state.enabled) {
    return;
  }

  const persistedQuery = request.extensions?.persistedQuery;
  const sha256Hash = persistedQuery?.sha256Hash;

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

  if (!state.hashes.has(sha256Hash)) {
    throw new GraphQLError('Persisted query is not allow-listed', {
      extensions: {
        code: 'PERSISTED_QUERY_NOT_ALLOWED',
        operationName: request.operationName,
      },
    });
  }

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
