import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const centralApiRoot = path.resolve(__dirname, '..');
const platformRoot = path.resolve(centralApiRoot, '..', '..');
const sourceManifestPath = path.join(
  platformRoot,
  'SharedContracts',
  'ApiSdk',
  'dist',
  'persisted-operation-manifest.json',
);
const targetRelativePath = path.join(
  'common',
  'graphql',
  'persisted-query-allow-list.generated.json',
);
const sourceTargetPath = path.join(centralApiRoot, 'src', targetRelativePath);
const distTargetPath = path.join(centralApiRoot, 'dist', targetRelativePath);

await mkdir(path.dirname(sourceTargetPath), { recursive: true });
await cp(sourceManifestPath, sourceTargetPath, { force: true });

try {
  await mkdir(path.dirname(distTargetPath), { recursive: true });
  await cp(sourceManifestPath, distTargetPath, { force: true });
} catch {
  // dist may not exist yet during prebuild; source copy is the canonical fallback.
}

process.stdout.write(
  `Synced persisted query allow-list manifest to ${sourceTargetPath} and ${distTargetPath}\n`,
);
