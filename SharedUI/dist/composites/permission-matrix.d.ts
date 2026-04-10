/**
 * 한국어: PermissionMatrix — Permission(행) × Role(열) 체크박스 그리드 composite.
 *   - 행(Y) = Permission (label + key 보조)
 *   - 열(X) = Role (label + code 보조)
 *   - 셀 전체 클릭 가능 (체크박스 자체 클릭도 동일 동작)
 *   - hover 시 해당 행/열에 연한 배경 highlight 로 교차 지점 표시
 *   - 비즈니스 로직/데이터 fetching 없음 (호출자가 상태 관리)
 * Tiếng Việt: Lưới ma trận Permission × Role với hover highlight hàng/cột.
 */
import { type ReactNode } from 'react';
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
export declare function PermissionMatrix({ roles, permissions, assigned, editable, busyCell, onToggle, emptyLabel, }: PermissionMatrixProps): import("react/jsx-runtime").JSX.Element;
