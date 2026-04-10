'use client';

/**
 * 한국어: PermissionMatrix — Permission(행) × Role(열) 체크박스 그리드 composite.
 *   - 행(Y) = Permission (label + key 보조)
 *   - 열(X) = Role (label + code 보조)
 *   - 셀 전체 클릭 가능 (체크박스 자체 클릭도 동일 동작)
 *   - hover 시 해당 행/열에 연한 배경 highlight 로 교차 지점 표시
 *   - 비즈니스 로직/데이터 fetching 없음 (호출자가 상태 관리)
 * Tiếng Việt: Lưới ma trận Permission × Role với hover highlight hàng/cột.
 */

import { useState, type CSSProperties, type ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import { Checkbox } from '../primitives/checkbox';

export interface PermissionMatrixRole {
  id: string;
  roleCode: string;
  roleName: string;
}

export interface PermissionMatrixPermission {
  permissionKey: string;
  description?: string | null;
  domain?: string | null;
}

export interface PermissionMatrixProps {
  roles: PermissionMatrixRole[];
  permissions: PermissionMatrixPermission[];
  /**
   * 한국어: Set<`${roleId}:${permissionKey}`> 형태. 존재하면 checked.
   * Tiếng Việt: Tập hợp cặp role×permission đã gán.
   */
  assigned: Set<string>;
  editable?: boolean;
  busyCell?: string | null;
  onToggle?: (roleId: string, permissionKey: string, nextChecked: boolean) => void;
  emptyLabel?: ReactNode;
}

export function PermissionMatrix({
  roles,
  permissions,
  assigned,
  editable = true,
  busyCell = null,
  onToggle,
  emptyLabel = 'No data',
}: PermissionMatrixProps) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  if (roles.length === 0 || permissions.length === 0) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: 'center',
          color: T.colors.textMuted,
          fontSize: 13,
          fontFamily: T.typography.fontFamily,
          background: T.colors.surface,
          border: `1px solid ${T.colors.border}`,
          borderRadius: T.radius.md,
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  const wrap: CSSProperties = {
    overflow: 'auto',
    border: `1px solid ${T.colors.border}`,
    borderRadius: T.radius.lg,
    background: T.colors.surface,
    fontFamily: T.typography.fontFamily,
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  };
  const table: CSSProperties = {
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: '100%',
    fontSize: 12,
  };

  const cornerTh: CSSProperties = {
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 3,
    background: T.colors.surfaceMuted,
    borderBottom: `1px solid ${T.colors.border}`,
    borderRight: `1px solid ${T.colors.border}`,
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    color: T.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    whiteSpace: 'nowrap',
    minWidth: 260,
  };

  const roleTh = (colIdx: number): CSSProperties => {
    const isHover = hover?.col === colIdx;
    return {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      background: isHover ? T.colors.brandSoft : T.colors.surfaceMuted,
      borderBottom: `1px solid ${T.colors.border}`,
      borderRight: `1px solid ${T.colors.border}`,
      padding: '10px 12px',
      textAlign: 'center',
      fontWeight: 600,
      color: T.colors.text,
      whiteSpace: 'nowrap',
      transition: 'background 120ms ease',
      minWidth: 130,
    };
  };

  const permTh = (rowIdx: number): CSSProperties => {
    const isHover = hover?.row === rowIdx;
    return {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      background: isHover ? T.colors.brandSoft : T.colors.surface,
      borderBottom: `1px solid ${T.colors.border}`,
      borderRight: `1px solid ${T.colors.border}`,
      padding: '10px 14px',
      textAlign: 'left',
      fontWeight: 500,
      color: T.colors.text,
      whiteSpace: 'nowrap',
      transition: 'background 120ms ease',
    };
  };

  const cellTd = (rowIdx: number, colIdx: number, disabled: boolean): CSSProperties => {
    const isRowHover = hover?.row === rowIdx;
    const isColHover = hover?.col === colIdx;
    const isExact = isRowHover && isColHover;
    let bg: string = T.colors.surface;
    if (isExact) bg = T.colors.brandSoft;
    else if (isRowHover || isColHover) bg = T.colors.surfaceMuted;
    return {
      padding: '10px 6px',
      borderBottom: `1px solid ${T.colors.border}`,
      borderRight: `1px solid ${T.colors.border}`,
      textAlign: 'center',
      background: bg,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 100ms ease',
      userSelect: 'none',
    };
  };

  return (
    <div style={wrap}>
      <table style={table}>
        <thead>
          <tr>
            <th style={cornerTh}>Permission \ Role</th>
            {roles.map((role, colIdx) => (
              <th
                key={role.id}
                style={roleTh(colIdx)}
                scope="col"
                onMouseEnter={() => setHover((h) => ({ row: h?.row ?? -1, col: colIdx }))}
                onMouseLeave={() => setHover((h) => (h?.col === colIdx ? { row: h.row, col: -1 } : h))}
              >
                <div style={{ fontSize: 12, color: T.colors.text }}>{role.roleName}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.colors.textMuted,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontWeight: 400,
                    marginTop: 2,
                  }}
                >
                  {role.roleCode}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((p, rowIdx) => (
            <tr key={p.permissionKey}>
              <th
                style={permTh(rowIdx)}
                scope="row"
                onMouseEnter={() => setHover((h) => ({ row: rowIdx, col: h?.col ?? -1 }))}
                onMouseLeave={() => setHover((h) => (h?.row === rowIdx ? { row: -1, col: h.col } : h))}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: T.colors.text }}>
                  {p.description ?? p.permissionKey}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.colors.textMuted,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    marginTop: 2,
                  }}
                >
                  {p.permissionKey}
                </div>
              </th>
              {roles.map((role, colIdx) => {
                const cellKey = `${role.id}:${p.permissionKey}`;
                const checked = assigned.has(cellKey);
                const isBusy = busyCell === cellKey;
                const disabled = !editable || isBusy;
                const toggle = () => {
                  if (disabled) return;
                  onToggle?.(role.id, p.permissionKey, !checked);
                };
                return (
                  <td
                    key={cellKey}
                    style={cellTd(rowIdx, colIdx, disabled)}
                    onClick={toggle}
                    onMouseEnter={() => setHover({ row: rowIdx, col: colIdx })}
                    onMouseLeave={() =>
                      setHover((h) =>
                        h?.row === rowIdx && h?.col === colIdx ? null : h,
                      )
                    }
                    aria-label={`${role.roleCode} · ${p.permissionKey}`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle()}
                      ariaLabel={`${role.roleCode} · ${p.permissionKey}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
