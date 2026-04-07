import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const distRoot = path.join(packageRoot, 'dist');
const distIndexPath = path.join(distRoot, 'index.js');
const manifestPath = path.join(distRoot, 'persisted-operation-manifest.json');

function isGraphqlOperation(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.operationName === 'string' &&
    typeof value.document === 'string'
  );
}

function sha256(document) {
  return createHash('sha256').update(document).digest('hex');
}

const sdkModule = await import(pathToFileURL(distIndexPath).href);

const operations = Object.values(sdkModule)
  .filter(isGraphqlOperation)
  .sort((left, right) => left.operationName.localeCompare(right.operationName));

const manifest = {
  generatedAt: new Date().toISOString(),
  operationCount: operations.length,
  operations: operations.map((operation) => ({
    operationName: operation.operationName,
    sha256Hash: sha256(operation.document),
  })),
};

await mkdir(distRoot, { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

process.stdout.write(
  `Generated persisted operation manifest with ${manifest.operationCount} operations at ${manifestPath}\n`,
);
