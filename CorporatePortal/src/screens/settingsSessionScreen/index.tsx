'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Input,
  Skeleton,
  Select,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { ME_QUERY } from '@graphql/queries/auth';

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success { data }
      error { code message }
    }
  }
`;

type SupportedLanguage = 'ko' | 'vi' | 'en';
type Timezone = 'Asia/Ho_Chi_Minh' | 'Asia/Seoul' | 'UTC';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ko: '한국어',
  vi: 'Tiếng Việt',
  en: 'English',
};

const TIMEZONE_LABELS: Record<Timezone, string> = {
  'Asia/Ho_Chi_Minh': '베트남 (UTC+7)',
  'Asia/Seoul': '한국 (UTC+9)',
  UTC: 'UTC',
};

export function SettingsSessionScreen() {
  const { t } = useI18n();

  const { data, loading } = useQuery(ME_QUERY);
  const meData = data?.me?.success?.data;

  // Section 1: Profile
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('ko');
  const [timezone, setTimezone] = useState<Timezone>('Asia/Ho_Chi_Minh');

  useEffect(() => {
    if (meData) {
      setFullName(meData.displayName ?? '');
      setEmail(meData.loginId ?? '');
    }
  }, [meData]);

  // Section 2: Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [changePassword] = useMutation(CHANGE_PASSWORD_MUTATION);

  const handleProfileSave = async () => {
    // TODO: mutation updateMyProfile({ fullName, phone, language, timezone })
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const { data: res } = await changePassword({
        variables: { input: { currentPassword, newPassword } },
      });
      if (res?.changePassword?.error) {
        setPasswordError(res.changePassword.error.message);
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
    } catch {
      setPasswordError('비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.settings'), href: '/settings' },
          { label: t('nav.settings.session') },
        ],
        title: t('nav.settings.session'),
        description: '내 프로필과 비밀번호를 관리합니다.',
      }}
    >
      {/* Section 1: My Profile */}
      <SectionCard title="내 프로필" description="개인 정보를 수정합니다.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-fg-muted">이름</label>
            {loading ? (
              <Skeleton height={36} />
            ) : (
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="홍길동"
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-fg-muted">
              이메일 <span className="text-fg-subtle">(읽기 전용)</span>
            </label>
            {loading ? (
              <Skeleton height={36} />
            ) : (
              <Input value={email} readOnly placeholder="user@company.com" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-fg-muted">전화번호</label>
            {loading ? (
              <Skeleton height={36} />
            ) : (
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 90 123 4567"
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-fg-muted">언어 설정</label>
            {loading ? (
              <Skeleton height={36} />
            ) : (
              <Select
                value={language}
                onChange={(val) => setLanguage(val as SupportedLanguage)}
                options={(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((key) => ({
                  value: key,
                  label: LANGUAGE_LABELS[key],
                }))}
              />
            )}
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[12px] font-semibold text-fg-muted">타임존</label>
            {loading ? (
              <Skeleton height={36} />
            ) : (
              <Select
                value={timezone}
                onChange={(val) => setTimezone(val as Timezone)}
                options={(Object.keys(TIMEZONE_LABELS) as Timezone[]).map((key) => ({
                  value: key,
                  label: TIMEZONE_LABELS[key],
                }))}
              />
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            startIcon={<Save size={14} />}
            onClick={handleProfileSave}
          >
            {t('common.save')}
          </Button>
        </div>
      </SectionCard>

      {/* Section 2: Password Change */}
      <div className="mt-4">
        <SectionCard title="비밀번호 변경" description="현재 비밀번호를 확인한 후 변경합니다.">
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            {passwordError && (
              <div
                className="rounded-md p-2 text-[12px] text-danger"
                style={{ background: 'var(--danger-soft)' }}
              >
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div
                className="rounded-md p-2 text-[12px]"
                style={{ color: 'var(--success)', background: 'var(--success-soft)' }}
              >
                비밀번호가 성공적으로 변경되었습니다.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">현재 비밀번호 *</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">새 비밀번호 *</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8자 이상"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">새 비밀번호 확인 *</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 재입력"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                비밀번호 변경
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
