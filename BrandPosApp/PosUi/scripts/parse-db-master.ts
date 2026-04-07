/**
 * parse-db-master.ts
 *
 * Build-time script that reads the DB Master markdown file and outputs
 * structured JSON for the design-docs DB Table Master page.
 *
 * Usage:  npx tsx scripts/parse-db-master.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DbColumn {
  name: string;
  type: string;
  nullable: string;
  default: string;
  description: string;
}

interface DbTable {
  id: string;
  name: string;
  section: string;
  owner: string;
  storage: string;
  syncDirection: string;
  columns: DbColumn[];
  constraints: string[];
  indexes: string[];
  scenarios: string[];
  deprecated: boolean;
  deprecatedNote: string;
}

interface DbMasterData {
  platformTables: DbTable[];
  legacyTables: DbTable[];
  totalPlatformCount: number;
  totalLegacyCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toKebab(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/** Extract cells from a markdown table row like `| a | b | c |`. */
function parseTableRow(row: string): string[] {
  return row
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());
}

/** True for separator rows like `|---|---|`. */
function isSeparatorRow(row: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(row.trim());
}

/** Strip backticks from a value. */
function stripBackticks(v: string): string {
  return v.replace(/`/g, '').trim();
}

/** Extract list items from lines that start with `-`. */
function extractListItems(lines: string[]): string[] {
  return lines.filter((l) => /^\s*-\s/.test(l)).map((l) => l.replace(/^\s*-\s+/, '').trim());
}

// ---------------------------------------------------------------------------
// Section detection helpers
// ---------------------------------------------------------------------------

/** Identify the Source header that tells us which domain section we are in. */
function inferSection(sourceHeader: string): string {
  if (/Shared\/ReferenceData/i.test(sourceHeader)) return 'Shared/ReferenceData';
  if (/SuperAdmin\/Governance/i.test(sourceHeader)) return 'SuperAdmin/Governance';
  if (/RegionalDistributor\/ChannelGovernance/i.test(sourceHeader)) return 'Distributor/ChannelGovernance';
  if (/BrandHQ\/MasterData/i.test(sourceHeader)) return 'BrandHQ/MasterData';
  if (/EdgePos\/OperationalCore/i.test(sourceHeader)) return 'EdgePOS/OperationalCore';
  return 'Unknown';
}

// ---------------------------------------------------------------------------
// Platform table parser (Korean sections only)
// ---------------------------------------------------------------------------

function parsePlatformTable(block: string, section: string): DbTable | null {
  const lines = block.split('\n');

  // Table name from ### X.X TableName
  const headingMatch = lines[0]?.match(/^###\s+\d+\.\d+\s+(.+)/);
  if (!headingMatch) return null;
  const tableName = headingMatch[1].trim();

  // Metadata table
  let owner = '';
  let storage = '';
  let syncDirection = '';

  let i = 1;
  // Find the metadata table
  while (i < lines.length && !lines[i].trim().startsWith('|')) i++;
  // Parse metadata key-value rows
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const row = lines[i].trim();
    if (!isSeparatorRow(row)) {
      const cells = parseTableRow(row);
      if (cells.length >= 2) {
        const key = cells[0].trim();
        const val = stripBackticks(cells[1]);
        if (key === '소유 주체') owner = val;
        else if (key === '저장 위치') storage = val;
        else if (key === '동기화 방향') syncDirection = val;
      }
    }
    i++;
  }

  // Column definitions — look for #### 컬럼 정의
  const columns: DbColumn[] = [];
  const colDefIdx = lines.findIndex((l) => /^####\s+컬럼 정의/.test(l));
  if (colDefIdx >= 0) {
    let ci = colDefIdx + 1;
    // Skip to table start
    while (ci < lines.length && !lines[ci].trim().startsWith('|')) ci++;
    // Skip header + separator
    let headerSkipped = false;
    while (ci < lines.length && lines[ci].trim().startsWith('|')) {
      const row = lines[ci].trim();
      if (isSeparatorRow(row)) {
        ci++;
        headerSkipped = true;
        continue;
      }
      if (!headerSkipped) {
        ci++;
        continue;
      }
      const cells = parseTableRow(row);
      if (cells.length >= 5) {
        columns.push({
          name: stripBackticks(cells[0]),
          type: stripBackticks(cells[1]),
          nullable: cells[2].trim(),
          default: stripBackticks(cells[3]) || '-',
          description: cells[4].trim(),
        });
      }
      ci++;
    }
  }

  // Constraints
  const constraintIdx = lines.findIndex((l) => /^####\s+제약 조건/.test(l));
  let constraints: string[] = [];
  if (constraintIdx >= 0) {
    let ci = constraintIdx + 1;
    const subLines: string[] = [];
    while (ci < lines.length && !lines[ci].startsWith('####') && !lines[ci].startsWith('###')) {
      subLines.push(lines[ci]);
      ci++;
    }
    constraints = extractListItems(subLines);
  }

  // Indexes
  const indexIdx = lines.findIndex((l) => /^####\s+인덱스/.test(l));
  let indexes: string[] = [];
  if (indexIdx >= 0) {
    let ci = indexIdx + 1;
    const subLines: string[] = [];
    while (ci < lines.length && !lines[ci].startsWith('####') && !lines[ci].startsWith('###')) {
      subLines.push(lines[ci]);
      ci++;
    }
    indexes = extractListItems(subLines);
  }

  // Scenarios
  const scenarioIdx = lines.findIndex((l) => /^####\s+사용 시나리오/.test(l));
  let scenarios: string[] = [];
  if (scenarioIdx >= 0) {
    let ci = scenarioIdx + 1;
    const subLines: string[] = [];
    while (ci < lines.length && !lines[ci].startsWith('####') && !lines[ci].startsWith('###')) {
      subLines.push(lines[ci]);
      ci++;
    }
    scenarios = extractListItems(subLines);
  }

  return {
    id: toKebab(tableName),
    name: tableName,
    section,
    owner,
    storage,
    syncDirection,
    columns,
    constraints,
    indexes,
    scenarios,
    deprecated: false,
    deprecatedNote: '',
  };
}

// ---------------------------------------------------------------------------
// Legacy table parser
// ---------------------------------------------------------------------------

function parseLegacyTable(block: string): DbTable | null {
  const lines = block.split('\n');

  // ### Table Name: XXX
  const headingMatch = lines[0]?.match(/^###\s+Table Name:\s+(.+)/);
  if (!headingMatch) return null;
  const tableName = headingMatch[1].trim();

  // Check for deprecated note
  let deprecated = false;
  let deprecatedNote = '';
  for (const line of lines) {
    const deprecMatch = line.match(/>\s*\*\*⛔\s*폐기 후보\*\*\s*—\s*(.*)/);
    if (deprecMatch) {
      deprecated = true;
      deprecatedNote = deprecMatch[1].trim();
      break;
    }
  }

  // Check for special note (e.g. "Note: Partner는 ...")
  let noteText = '';
  for (const line of lines) {
    const noteMatch = line.match(/^>\s*Note:\s*(.*)/);
    if (noteMatch) {
      noteText = noteMatch[1].trim();
    }
  }

  // Column table
  const columns: DbColumn[] = [];
  let i = 1;
  // find table start
  while (i < lines.length && !lines[i].trim().startsWith('|')) i++;
  let headerSkipped = false;
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const row = lines[i].trim();
    if (isSeparatorRow(row)) {
      i++;
      headerSkipped = true;
      continue;
    }
    if (!headerSkipped) {
      i++;
      continue;
    }
    const cells = parseTableRow(row);
    if (cells.length >= 5) {
      columns.push({
        name: stripBackticks(cells[0]),
        type: stripBackticks(cells[1]),
        nullable: cells[2].trim(),
        default: stripBackticks(cells[3]) || '-',
        description: cells[4].trim(),
      });
    }
    i++;
  }

  return {
    id: `legacy-${toKebab(tableName)}`,
    name: tableName,
    section: 'Legacy',
    owner: 'HJ-POS',
    storage: 'Local MSSQL',
    syncDirection: '-',
    columns,
    constraints: [],
    indexes: [],
    scenarios: noteText ? [noteText] : [],
    deprecated,
    deprecatedNote,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const mdPath = path.resolve(
    __dirname,
    '../../../1.Docs/기획 및 설계/프로젝트 통합설계/DB설계/10-전체-테이블-컬럼-마스터.md',
  );

  if (!fs.existsSync(mdPath)) {
    console.error(`[parse-db-master] Source file not found: ${mdPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(mdPath, 'utf-8');
  const allLines = raw.split('\n');

  const platformTables: DbTable[] = [];
  const legacyTables: DbTable[] = [];

  // -----------------------------------------------------------------------
  // 1) Parse Platform tables — we only use Korean sections (## 1. Korean)
  // -----------------------------------------------------------------------

  // Identify Source headers and their Korean sections
  let currentSection = '';
  let inKoreanSection = false;
  let inLegacySection = false;
  let blockBuffer: string[] = [];
  let currentTableHeading = '';

  function flushPlatformBlock(): void {
    if (blockBuffer.length > 0 && currentTableHeading) {
      const block = blockBuffer.join('\n');
      const table = parsePlatformTable(block, currentSection);
      if (table && table.columns.length > 0) {
        platformTables.push(table);
      }
    }
    blockBuffer = [];
    currentTableHeading = '';
  }

  function flushLegacyBlock(): void {
    if (blockBuffer.length > 0 && currentTableHeading) {
      const block = blockBuffer.join('\n');
      const table = parseLegacyTable(block);
      if (table && table.columns.length > 0) {
        // Deduplicate: legacy section has some repeated tables in
        // "Additional SQL-only tables" section. Keep the first occurrence.
        const existingIdx = legacyTables.findIndex((t) => t.name === table.name);
        if (existingIdx < 0) {
          legacyTables.push(table);
        }
      }
    }
    blockBuffer = [];
    currentTableHeading = '';
  }

  for (let li = 0; li < allLines.length; li++) {
    const line = allLines[li];

    // Detect Source header
    if (/^### Source:/.test(line)) {
      flushPlatformBlock();
      currentSection = inferSection(line);
      inKoreanSection = false;
      inLegacySection = false;
      continue;
    }

    // Detect Legacy section start
    if (/^## 2\. Legacy HJ-POS/.test(line)) {
      flushPlatformBlock();
      inKoreanSection = false;
      inLegacySection = true;
      continue;
    }

    // Detect Korean/Vietnamese section toggles within a Source group
    if (/^## 1\. Korean/.test(line)) {
      flushPlatformBlock();
      inKoreanSection = true;
      continue;
    }
    if (/^## 2\. Tiếng Việt/.test(line)) {
      flushPlatformBlock();
      inKoreanSection = false;
      continue;
    }
    if (/^## 3\. Notes/.test(line)) {
      if (inLegacySection) flushLegacyBlock();
      else flushPlatformBlock();
      inKoreanSection = false;
      inLegacySection = false;
      continue;
    }

    // Platform table heading: ### X.X TableName
    if (inKoreanSection && /^### \d+\.\d+\s+/.test(line)) {
      flushPlatformBlock();
      currentTableHeading = line;
      blockBuffer.push(line);
      continue;
    }

    // Legacy table heading: ### Table Name: XXX or ### Additional SQL-only ...
    if (inLegacySection && /^### Table Name:\s+/.test(line)) {
      flushLegacyBlock();
      currentTableHeading = line;
      blockBuffer.push(line);
      continue;
    }

    // Skip "### Additional SQL-only tables" sub-heading
    if (inLegacySection && /^### Additional SQL-only/.test(line)) {
      flushLegacyBlock();
      continue;
    }

    // Skip "### Legacy table order" heading
    if (inLegacySection && /^### Legacy table order/.test(line)) {
      continue;
    }

    // Accumulate
    if (inKoreanSection && currentTableHeading) {
      blockBuffer.push(line);
    }
    if (inLegacySection && currentTableHeading) {
      blockBuffer.push(line);
    }
  }

  // Flush remaining
  if (inLegacySection) flushLegacyBlock();
  else if (inKoreanSection) flushPlatformBlock();

  // -----------------------------------------------------------------------
  // Build output
  // -----------------------------------------------------------------------

  const data: DbMasterData = {
    platformTables,
    legacyTables,
    totalPlatformCount: platformTables.length,
    totalLegacyCount: legacyTables.length,
  };

  const outDir = path.resolve(__dirname, '../src/app/design-docs/docs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'db-master-data.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`[parse-db-master] Done.`);
  console.log(`  Platform tables: ${data.totalPlatformCount}`);
  console.log(`  Legacy tables:   ${data.totalLegacyCount}`);
  console.log(`  Output: ${outPath}`);
}

main();
