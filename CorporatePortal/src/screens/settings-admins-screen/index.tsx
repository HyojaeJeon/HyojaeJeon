'use client';

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Input,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

type AdminRole = 'CORPORATE_OWNER' | 'HR_ADMIN' | 'FINANCE_ADMIN' | 'VIEWER';
type AdminStatus = 'ACTIVE' | 'PENDING_INVITE' | 'SUSPENDED';

interface AdminRow {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: string | null;
}

const ROLE_LABEL: Record<AdminRole, string> = {
  CORPORATE_OWNER: '소유자',
  HR_ADMIN: 'HR 관리자',
  FINANCE_ADMIN: '재무 관리자',
  VIEWER: '뷰어',
};

const ROLE_TONE: Record<AdminRole, 'brand' | 'info' | 'success' | 'neutral'> = {
  CORPORATE_OWNER: 'brand',
  HR_ADMIN: 'info',
  FINANCE_ADMIN: 'success',
  VIEWER: 'neutral',
};

const STATUS_LABEL: Record<AdminStatus, string> = {
  ACTIVE: '활성',
  PENDING_INVITE: '초대 대기',
  SUSPENDED: '정지',
};

const STATUS_TONE: Record<AdminStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  PENDING_INVITE: 'warning',
  SUSPENDED: 'danger',
};

export function SettingsAdminsScreen() {
  const { t } = useI18n();
  const canWrite = useHasPermission(PERMISSIONS.PROFILE_WRITE);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('VIEWER');
  const [error, setError] = useState<string | null>(null);

  // TODO: useQuery(ADMIN_LIST_QUERY, { variables: { corporateId } })
  const admins: AdminRow[] = [];
  const loading = false;

  if (!canWrite) return <LockedScreen />;

  const cols: DataTableColumn<AdminRow>[] = [
    {
      key: 'fullName',
      header: '이름',
      render: (r) => <span className="font-semibold text-fg">{r.fullName}</span>,
    },
    {
      key: 'email',
      header: '이메일',
      width: '220px',
      render: (r) => <span className="text-[12px] text-fg-muted">{r.email}</span>,
    },
    {
      key: 'role',
      header: '역할',
      width: '140px',
      render: (r) => (
        <Badge tone={ROLE_TONE[r.role]} size="sm">
          {ROLE_LABEL[r.role]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '120px',
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]} size="sm" startDot>
          {STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
    {
      key: 'lastLoginAt',
      header: '마지막 로그인',
      width: '180px',
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString('ko-KR') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '액션',
      width: '100px',
      render: (r) => (
        <div className="flex gap-1">
          {r.status === 'ACTIVE' && (
            <button
              type="button"
              className="rounded px-2 py-1 text-[11px] font-semibold text-danger hover:bg-[var(--danger-soft)]"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: mutation suspendAdmin
              }}
            >
              정지
            </button>
          )}
          {r.status === 'SUSPENDED' && (
            <button
              type="button"
              className="rounded px-2 py-1 text-[11px] font-semibold hover:bg-[var(--success-soft)]"
              style={{ color: 'var(--success)' }}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: mutation reactivateAdmin
              }}
            >
              복원
            </button>
          )}
          {r.status === 'PENDING_INVITE' && (
            <button
              type="button"
              className="rounded px-2 py-1 text-[11px] font-semibold text-fg-muted hover:bg-[var(--surface-2)]"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: mutation resendInvite
              }}
            >
              재전송
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inviteEmail) {
      setError('이메일을 입력해주세요.');
      return;
    }
    // TODO: mutation inviteAdmin({ email: inviteEmail, role: inviteRole })
    setInviteEmail('');
    setInviteRole('VIEWER');
    setShowInviteForm(false);
  };

  const handleRefresh = () => {
    // TODO: refetch query
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.settings'), href: '/settings' },
          { label: t('nav.settings.admins') },
        ],
        title: t('nav.settings.admins'),
        description: '관리자 계정을 관리하고 새 관리자를 초대합니다.',
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={handleRefresh}>
              {t('common.refresh')}
            </Button>
            <Button
              variant="primary"
              startIcon={<Plus size={14} />}
              onClick={() => setShowInviteForm((v) => !v)}
            >
              관리자 초대
            </Button>
          </div>
        ),
      }}
      summaryItems={[
        { label: '전체 관리자', value: admins.length, tone: 'brand' },
        { label: '활성', value: admins.filter((a) => a.status === 'ACTIVE').length, tone: 'success' },
        { label: '초대 대기', value: admins.filter((a) => a.status === 'PENDING_INVITE').length, tone: 'warning' },
      ]}
    >
      {/* Invite form */}
      {showInviteForm && (
        <div className="mb-3">
          <SectionCard title="관리자 초대">
            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              {error && (
                <div
                  className="rounded-md p-2 text-[12px] text-danger"
                  style={{ background: 'var(--danger-soft)' }}
                >
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">이메일 *</label>
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="admin@company.com"
                    type="email"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">역할 *</label>
                  <select
                    className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] text-fg outline-none"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                    required
                  >
                    <option value="CORPORATE_OWNER">소유자</option>
                    <option value="HR_ADMIN">HR 관리자</option>
                    <option value="FINANCE_ADMIN">재무 관리자</option>
                    <option value="VIEWER">뷰어</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowInviteForm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary">
                  초대 전송
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {/* Admin list */}
      <SectionCard
        title={t('nav.settings.admins')}
        description={`${admins.length}명`}
        padding="none"
      >
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'var(--surface-2)' }}
            >
              <Plus size={24} className="text-fg-muted" />
            </div>
            <p className="text-sm font-semibold text-fg-muted">등록된 관리자가 없습니다.</p>
            <p className="text-[12px] text-fg-subtle">
              &apos;관리자 초대&apos; 버튼을 눌러 팀원을 초대하세요.
            </p>
            <Button
              variant="primary"
              size="sm"
              startIcon={<Plus size={14} />}
              onClick={() => setShowInviteForm(true)}
            >
              관리자 초대
            </Button>
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={admins}
            rowKey={(r) => r.id}
            compact
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
