'use client';

import { Badge, type DataTableColumn } from '@platform/shared-ui';
import { ComingSoonScreen } from '@screens/common/ComingSoonScreen';
import { DEPLOY_RELEASES_QUERY, type DeployReleasesData, type DeployReleaseRow } from '@graphql/queries/deploy';
import { formatDateTime } from '@shared/utils/format';
import { StatusBadge } from '@shared/ui/StatusBadge';

const columns: DataTableColumn<DeployReleaseRow>[] = [
  { key: 'id', header: 'Release ID', width: '200px', render: (r) => <span className="font-mono text-[12px]">{r.id.slice(0, 8)}</span> },
  { key: 'package', header: 'Package', width: '200px', render: (r) => <span className="font-mono text-[12px] text-fg-muted">{r.packageId.slice(0, 8)}</span> },
  { key: 'scope', header: 'Scope', width: '200px', render: (r) => <><Badge tone="neutral" variant="soft">{r.scopeType}</Badge>{r.scopeId && <span className="ml-2 font-mono text-[11px] text-fg-subtle">{r.scopeId.slice(0, 8)}</span>}</> },
  { key: 'status', header: 'Status', width: '140px', render: (r) => <StatusBadge status={r.releaseStatus} /> },
  { key: 'deployed', header: 'Deployed', width: '160px', align: 'right', render: (r) => r.deployedAt ? <span className="num text-[12px] text-fg-muted">{formatDateTime(r.deployedAt)}</span> : <span className="text-fg-subtle">—</span> },
];

export function DeployReleaseListScreen() {
  // deployReleases 는 scopeType / scopeId 필수 (backend 설계상 brand 별 조회).
  // Phase 2 에서 브랜드 선택 UI + per-scope 조회 화면으로 확장.
  // 현재는 컨텍스트가 없어 ComingSoon 으로 둔다.
  void DEPLOY_RELEASES_QUERY;
  void columns;
  const _unused: DeployReleasesData | null = null;
  void _unused;
  void formatDateTime;
  void StatusBadge;
  return <ComingSoonScreen titleKey="deploy.release.list.title" descriptionKey="deploy.release.list.description" screenId="SA-DEPLOY-REL-001" />;
}
