/**
 * fix-db-column-casing.ts
 *
 * Converts DB column names from PascalCase to camelCase in the master
 * markdown file, while preserving table names in PascalCase.
 *
 * Usage:  npx tsx scripts/fix-db-column-casing.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Known table names — these must NEVER be converted
// ---------------------------------------------------------------------------

const PLATFORM_TABLE_NAMES = new Set([
  'Language', 'Region', 'Currency',
  'SuperAdminUser', 'PlatformLicense', 'PlatformPolicy', 'AuditLog',
  'DeployPackage', 'DeployRelease',
  'DistributorProfile', 'Territory', 'DistributorContract',
  'BrandAssignment', 'DeploymentScope',
  'ChannelUser',
  'BrandProfile', 'Branch', 'BrandMenuCategory', 'BrandMenuItem',
  'PricePolicy', 'Promotion', 'BrandEmployee', 'StaffRole',
  'EdgePosTerminal', 'Device', 'DeviceBinding', 'LocalSetting',
  'OrderSlip', 'OrderDetail', 'SellSlip', 'SellDetail',
  'CardSell', 'CashReceipt',
  'TableLayout', 'TableStatus',
  'CustomerMaster', 'PointLedger',
  'SyncOutbox', 'RequestLedger', 'SyncState',
]);

// Dynamically collected table names from ### X.X and ### Table Name: headers
const dynamicTableNames = new Set<string>();

// ---------------------------------------------------------------------------
// Type/keyword/value patterns that should NOT be converted
// ---------------------------------------------------------------------------

/** Check if a backtick-wrapped token is a SQL type. */
function isSqlType(token: string): boolean {
  const lower = token.toLowerCase();
  // Standard types
  if (/^(uuid|text|int|integer|smallint|bigint|real|float|double|boolean|date|time|timestamp|timestamptz|jsonb|json|inet|serial|bytea)$/.test(lower)) return true;
  // varchar(N), char(N)
  if (/^(var)?char\(\d+\)$/.test(lower)) return true;
  // numeric(p,s)
  if (/^(numeric|decimal)\(\d+(,\s*\d+)?\)$/.test(lower)) return true;
  return false;
}

/** Check if a backtick-wrapped token is a constant/keyword/value. */
function isConstantOrKeyword(token: string): boolean {
  // Already lowercase or snake_case (index names, etc.)
  if (/^[a-z_][a-z0-9_]*$/.test(token)) return true;
  // Quoted string values like 'LTR', 'Active', etc.
  if (token.startsWith("'") || token.startsWith('"')) return true;
  // Known constants
  if (['HALF_UP', 'LTR', 'RTL', 'DESC', 'ASC'].includes(token)) return true;
  // boolean/null/function values
  if (['true', 'false', 'null', 'now()'].includes(token.toLowerCase())) return true;
  // ALL_UPPER_SNAKE like STATUS_OLD, MODIFILE_DATE, etc. (legacy uppercase columns)
  // These are UPPER_SNAKE_CASE — not PascalCase, so skip conversion
  if (/^[A-Z][A-Z0-9_]+$/.test(token)) return true;
  // Index names: idx_*, uq_*, etc.
  if (/^(idx|uq|pk|fk|ck|ix)_/.test(token.toLowerCase())) return true;
  // Empty string
  if (token.trim() === '' || token === '-') return true;
  // JSON-like values
  if (token.startsWith('{') || token.startsWith('[')) return true;
  // Numeric
  if (/^\d+$/.test(token)) return true;
  // Expressions with spaces (like "Direction in ('LTR', 'RTL')")
  // These are Check constraint expressions inside a single backtick block
  if (/\s+in\s+\(/i.test(token)) return true;
  return false;
}

/** Convert PascalCase to camelCase: just lowercase the first letter. */
function toCamelCase(name: string): string {
  if (name.length === 0) return name;
  return name[0].toLowerCase() + name.slice(1);
}

/** Check if a token looks like PascalCase (starts with uppercase letter). */
function isPascalCase(token: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(token);
}

// ---------------------------------------------------------------------------
// Pre-scan: collect all table names from headings
// ---------------------------------------------------------------------------

function collectTableNames(lines: string[]): void {
  for (const line of lines) {
    // ### X.X TableName (platform sections)
    const platformMatch = line.match(/^###\s+\d+\.\d+\s+(\S+)/);
    if (platformMatch) {
      dynamicTableNames.add(platformMatch[1].trim());
    }
    // ### Table Name: XXX (legacy sections)
    const legacyMatch = line.match(/^### Table Name:\s+(\S+)/);
    if (legacyMatch) {
      dynamicTableNames.add(legacyMatch[1].trim());
    }
  }
}

function isTableName(token: string): boolean {
  return PLATFORM_TABLE_NAMES.has(token) || dynamicTableNames.has(token);
}

// ---------------------------------------------------------------------------
// Line-level conversion
// ---------------------------------------------------------------------------

/**
 * Process a single backtick-wrapped token in context.
 * Returns the token as-is or converted to camelCase.
 */
function convertToken(token: string, context: 'table-row' | 'constraint' | 'index' | 'other'): string {
  // Never convert table names
  if (isTableName(token)) return token;

  // Never convert SQL types
  if (isSqlType(token)) return token;

  // Never convert constants/keywords/values
  if (isConstantOrKeyword(token)) return token;

  // Only convert if it looks PascalCase
  if (isPascalCase(token)) {
    return toCamelCase(token);
  }

  return token;
}

/**
 * Convert a column name token. This is used specifically for column definition
 * table rows where we KNOW the token is a column name, so we skip the table
 * name check (a column can share a name with its table, e.g., BasicCode).
 */
function convertColumnName(token: string): string {
  // Never convert SQL types
  if (isSqlType(token)) return token;
  // Never convert constants/keywords/values
  if (isConstantOrKeyword(token)) return token;
  // Only convert if it looks PascalCase
  if (isPascalCase(token)) {
    return toCamelCase(token);
  }
  return token;
}

/**
 * Process a table row line: `| \`ColumnName\` | \`type\` | ... |`
 * Only convert the FIRST backtick-wrapped cell (the column name).
 */
function processTableDataRow(line: string): string {
  // Split into cells
  const cells = line.split('|');
  if (cells.length < 3) return line;

  // cells[0] is before first |, cells[1] is first data cell, etc.
  // The column name is in cells[1]
  let processed = false;
  const result = cells.map((cell, idx) => {
    if (idx === 0 || processed) return cell;
    // First data cell with backtick content = column name
    const backtickMatch = cell.match(/^(\s*)`([^`]+)`(\s*)$/);
    if (backtickMatch && !processed) {
      processed = true;
      const [, prefix, token, suffix] = backtickMatch;
      // In column definition rows, we ALWAYS convert PascalCase to camelCase,
      // even if the column name happens to match a table name (e.g., BasicCode
      // table has a BasicCode column).
      const converted = convertColumnName(token);
      return `${prefix}\`${converted}\`${suffix}`;
    }
    return cell;
  });

  return result.join('|');
}

/**
 * Process a constraint/index line.
 * Converts column name references inside backticks, but preserves table names.
 *
 * Examples:
 *   - Primary Key: `Id`                         → `id`
 *   - Unique: `LanguageCode`                     → `languageCode`
 *   - Foreign Key: `PackageId -> DeployPackage.Id`
 *     → `packageId -> DeployPackage.id`
 *   - Check: `Direction in ('LTR', 'RTL')`      → `direction in ('LTR', 'RTL')`
 *   - on `(IsActive, IsDefault)`                 → on `(isActive, isDefault)`
 *   - Unique: `(PolicyKey, ScopeType, ScopeId, Version)` → camelCase each
 */
function processConstraintOrIndexLine(line: string): string {
  // Replace each backtick-wrapped segment
  return line.replace(/`([^`]+)`/g, (_match, content: string) => {
    // Check constraint expression: "Direction in ('LTR', 'RTL')"
    if (/\s+in\s+\(/i.test(content)) {
      // Convert the column name before "in", preserve the rest
      return '`' + content.replace(/^([A-Z][a-zA-Z0-9]*)(\s+in\s+)/, (_m: string, col: string, rest: string) => {
        return toCamelCase(col) + rest;
      }) + '`';
    }

    // Foreign Key pattern: "ColumnName -> TableName.ColumnName"
    if (/->/.test(content)) {
      return '`' + content.replace(/([A-Z][a-zA-Z0-9]*)\s*->\s*([A-Z][a-zA-Z0-9]*)\.([A-Z][a-zA-Z0-9]*)/, (_m: string, fkCol: string, tableName: string, refCol: string) => {
        const convertedFk = isTableName(fkCol) ? fkCol : toCamelCase(fkCol);
        const convertedRef = isTableName(refCol) ? refCol : toCamelCase(refCol);
        return `${convertedFk} -> ${tableName}.${convertedRef}`;
      }) + '`';
    }

    // Tuple of columns: "(ColA, ColB, ColC)" or "(ColA, ColB, ColC DESC)"
    if (content.startsWith('(') && content.endsWith(')')) {
      const inner = content.slice(1, -1);
      const parts = inner.split(',').map(part => {
        const trimmed = part.trim();
        // Handle "ColName DESC" or "ColName ASC"
        const dirMatch = trimmed.match(/^([A-Z][a-zA-Z0-9]*)\s+(DESC|ASC)$/);
        if (dirMatch) {
          const col = dirMatch[1];
          const dir = dirMatch[2];
          const converted = isTableName(col) ? col : toCamelCase(col);
          return ` ${converted} ${dir}`;
        }
        // Plain column name
        if (isPascalCase(trimmed) && !isTableName(trimmed)) {
          return ` ${toCamelCase(trimmed)}`;
        }
        return part;
      });
      return '`(' + parts.join(',').trim().replace(/^,\s*/, '') + ')`';
    }

    // Index name (snake_case) — preserve
    if (/^(idx|uq|pk|fk|ck|ix)_/.test(content.toLowerCase())) {
      return '`' + content + '`';
    }

    // Single column name
    if (isPascalCase(content) && !isTableName(content)) {
      return '`' + toCamelCase(content) + '`';
    }

    return '`' + content + '`';
  });
}

/**
 * Determine if a line is a metadata row that contains a table name
 * (e.g., `| 테이블명 | \`Language\` |` or `| Tên bảng | \`Language\` |`)
 */
function isTableNameMetadataRow(line: string): boolean {
  // Match only when 테이블명/Tên b���ng is the FIRST data cell.
  // Pattern: `| 테이블명 | ...` or `| Tên bảng | ...`
  // This avoids false positives where 테이블명 appears in a description column.
  return /^\|\s*(���이블명|Tên bảng)\s*\|/.test(line.trim());
}

/** Determine if a line is a table separator row. */
function isSeparatorRow(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

/** Determine if a line is a table header row (컬럼명, Tên cột, etc.) */
function isColumnHeaderRow(line: string): boolean {
  return /\|\s*(컬럼명|Tên cột|Column)\s*\|/.test(line);
}

// ---------------------------------------------------------------------------
// Main conversion
// ---------------------------------------------------------------------------

function main(): void {
  const mdPath = path.resolve(
    __dirname,
    '../../../1.Docs/기획 및 설계/프로젝트 통합설계/DB설계/10-전체-테이블-컬럼-마스터.md',
  );

  if (!fs.existsSync(mdPath)) {
    console.error(`[fix-db-column-casing] Source file not found: ${mdPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(mdPath, 'utf-8');
  const lines = raw.split('\n');

  // Pre-scan to collect all table names
  collectTableNames(lines);
  console.log(`[fix-db-column-casing] Collected ${dynamicTableNames.size} table names from headings`);
  console.log(`[fix-db-column-casing] Known platform table names: ${PLATFORM_TABLE_NAMES.size}`);

  // State machine
  let inColumnTable = false;    // Currently inside a column definition table
  let inMetadataTable = false;  // Currently inside a metadata key-value table
  let inConstraintSection = false;
  let inIndexSection = false;
  let changeCount = 0;

  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect section headers that reset state
    if (trimmed.startsWith('####') || trimmed.startsWith('###') || trimmed.startsWith('##')) {
      inColumnTable = false;
      inMetadataTable = false;
      inConstraintSection = false;
      inIndexSection = false;

      if (/^####\s+(컬럼 정의|Định nghĩa cột)/.test(trimmed)) {
        inColumnTable = true;
      } else if (/^####\s+(제약 조건|Ràng buộc)/.test(trimmed)) {
        inConstraintSection = true;
      } else if (/^####\s+(인덱스|Index)/.test(trimmed)) {
        inIndexSection = true;
      } else if (/^###\s+\d+\.\d+\s+/.test(trimmed) || /^### Table Name:/.test(trimmed)) {
        // New table definition — the metadata table follows
        inMetadataTable = true;
      }

      output.push(line);
      continue;
    }

    // Blank line resets column table state (but not constraint/index)
    if (trimmed === '') {
      if (inColumnTable) {
        // Check if the column table has ended
        // (blank line after table rows means table ended)
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        if (prevLine.startsWith('|')) {
          // Still could be in the table area, but blank line means end
          inColumnTable = false;
        }
      }
      output.push(line);
      continue;
    }

    // --- Handle table rows ---
    if (trimmed.startsWith('|')) {
      // Skip separator rows
      if (isSeparatorRow(trimmed)) {
        output.push(line);
        continue;
      }

      // Skip metadata rows with table names
      if (isTableNameMetadataRow(trimmed)) {
        output.push(line);
        continue;
      }

      // Column header rows (컬럼명, Tên cột) signal start of column data
      if (isColumnHeaderRow(trimmed)) {
        // Transition: if we were in a metadata table (e.g., after ### Table Name:),
        // the column header means the metadata section is over and column defs start.
        inMetadataTable = false;
        inColumnTable = true;
        output.push(line);
        continue;
      }

      // If we are in a metadata table (항목/값), skip all its rows
      if (inMetadataTable && !inColumnTable) {
        output.push(line);
        continue;
      }

      // Column definition table row — convert the first column (the name)
      if (inColumnTable || isDataRowAfterColumnHeader(lines, i)) {
        const converted = processTableDataRow(line);
        if (converted !== line) changeCount++;
        output.push(converted);
        continue;
      }

      // Legacy table: column rows come directly after ### Table Name and separator
      // These are handled by the same logic since we detect column tables
      // by looking at the row structure
      const converted = processTableDataRow(line);
      if (converted !== line) changeCount++;
      output.push(converted);
      continue;
    }

    // --- Handle constraint lines ---
    if (inConstraintSection && trimmed.startsWith('-')) {
      const converted = processConstraintOrIndexLine(line);
      if (converted !== line) changeCount++;
      output.push(converted);
      continue;
    }

    // --- Handle index lines ---
    if (inIndexSection && trimmed.startsWith('-')) {
      const converted = processConstraintOrIndexLine(line);
      if (converted !== line) changeCount++;
      output.push(converted);
      continue;
    }

    // --- Default: pass through ---
    output.push(line);
  }

  // Write back
  fs.writeFileSync(mdPath, output.join('\n'), 'utf-8');

  console.log(`[fix-db-column-casing] Done. ${changeCount} lines changed.`);
  console.log(`  File: ${mdPath}`);
}

/**
 * Helper: check if line at index `i` is a data row that follows a column
 * header (컬럼명 | 타입 | ...) with separator in between.
 * This handles cases where the state machine missed the #### heading
 * (e.g., legacy tables that have column tables without a preceding #### header).
 */
function isDataRowAfterColumnHeader(lines: string[], idx: number): boolean {
  // Look backwards for the header pattern
  for (let j = idx - 1; j >= Math.max(0, idx - 3); j--) {
    const prev = lines[j].trim();
    if (prev === '') continue;
    if (isSeparatorRow(prev)) continue;
    if (isColumnHeaderRow(prev)) return true;
    // If we hit a non-header, non-separator, non-blank line, stop
    break;
  }
  return false;
}

main();
