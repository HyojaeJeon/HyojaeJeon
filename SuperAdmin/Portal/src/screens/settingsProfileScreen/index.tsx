'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Save, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { ListPageTemplate, SectionCard, Input, Button, PhoneInput } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useAppSelector, useAppDispatch } from '@store/index';
import { setSession } from '@store/slices/authSlice';
import {
  ME_QUERY,
  UPDATE_MY_PROFILE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  type MeData,
} from '@graphql/queries/auth';

export function SettingsProfileScreen() {
  const { t } = useI18n();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const accessTokenExpiresAt = useAppSelector((s) => s.auth.accessTokenExpiresAt);
  const sessionExpiresAt = useAppSelector((s) => s.auth.sessionExpiresAt);
  const dispatch = useAppDispatch();

  const { data, refetch } = useQuery<MeData>(ME_QUERY);
  const me = data?.me?.success?.data;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => {
    if (me) {
      setDisplayName(me.displayName);
      setEmail(me.email ?? '');
      setPhone(me.phone ?? '');
    }
  }, [me]);

  const [updateProfile, { loading: saving }] = useMutation(UPDATE_MY_PROFILE_MUTATION);
  const [changePassword, { loading: changingPw }] = useMutation(CHANGE_PASSWORD_MUTATION);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const res = await updateProfile({
        variables: {
          userType: user.userType,
          id: user.id,
          input: { displayName, email: email || null, phone: phone || null },
        },
      });
      const env = res.data?.updateAuthAccount;
      if (env?.error) { toast.error(env.error.message); return; }
      toast.success(t('settings.profile.saved'));
      if (token) {
        dispatch(setSession({
          user: { ...user, displayName },
          token,
          accessTokenExpiresAt: accessTokenExpiresAt ?? new Date().toISOString(),
          sessionExpiresAt: sessionExpiresAt ?? new Date().toISOString(),
        }));
      }
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      toast.error(t('settings.profile.passwordMismatch'));
      return;
    }
    try {
      const res = await changePassword({
        variables: { currentPassword: currentPw, newPassword: newPw },
      });
      const env = res.data?.changePassword;
      if (env?.error) { toast.error(env.error.message); return; }
      toast.success(t('settings.profile.passwordChanged'));
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.settings') },
          { label: t('nav.settings.profile') },
        ],
        title: t('nav.settings.profile'),
        description: t('settings.profile.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SET-PROF</code>,
      }}
    >
      <SectionCard title={t('settings.profile.info')} description={t('settings.profile.infoDesc')}>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.loginId')}</label>
            <Input value={me?.loginId ?? '—'} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.displayName')}</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.email')}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.phone')}</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.role')}</label>
            <Input value={me?.userType ? t(`userType.${me.userType}`) : '—'} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.status')}</label>
            <Input value={me?.status ? t(`accountStatus.${me.status}`) : '—'} disabled />
          </div>
        </div>
        <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: 'var(--border)' }}>
          <span className="text-[11px] text-fg-subtle">
            {me?.lastLoginAt && `${t('settings.profile.lastLogin')}: ${new Date(me.lastLoginAt).toLocaleString()}`}
          </span>
          <Button variant="primary" size="md" startIcon={<Save size={14} />} loading={saving} onClick={handleSaveProfile}>
            {t('action.save')}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t('settings.profile.password')} description={t('settings.profile.passwordDesc')}>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.currentPassword')}</label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.newPassword')}</label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-fg-muted">{t('settings.profile.confirmPassword')}</label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end border-t px-5 py-3" style={{ borderColor: 'var(--border)' }}>
          <Button variant="outline" size="md" startIcon={<KeyRound size={14} />} loading={changingPw} onClick={handleChangePassword}
            disabled={!currentPw || !newPw || !confirmPw}
          >
            {t('settings.profile.changePassword')}
          </Button>
        </div>
      </SectionCard>
    </ListPageTemplate>
  );
}
