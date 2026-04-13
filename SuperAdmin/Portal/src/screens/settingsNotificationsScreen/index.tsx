'use client';

import { useQuery, useMutation } from '@apollo/client';
import { Mail, Globe, MessageSquare, Webhook, Power } from 'lucide-react';
import { toast } from 'sonner';
import {
  ListPageTemplate,
  SectionCard,
  Badge,
  Button,
  Checkbox,
  Skeleton,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import {
  MY_NOTIFICATION_CHANNELS_QUERY,
  MY_NOTIFICATION_PREFERENCES_QUERY,
  UPSERT_NOTIFICATION_CHANNEL_MUTATION,
  UPSERT_NOTIFICATION_PREFERENCE_MUTATION,
  DELETE_NOTIFICATION_CHANNEL_MUTATION,
  type NotificationChannelRow,
  type NotificationPreferenceRow,
} from '@graphql/queries/settings';

const CHANNEL_TYPES = ['EMAIL', 'WEB_PUSH', 'SLACK', 'WEBHOOK'] as const;
const EVENT_TYPES = [
  'SYNC_FAILED',
  'LICENSE_EXPIRING',
  'DEPLOY_COMPLETED',
  'SECURITY_ALERT',
  'SYSTEM_HEALTH_DEGRADED',
] as const;

const CHANNEL_ICON: Record<string, typeof Mail> = {
  EMAIL: Mail,
  WEB_PUSH: Globe,
  SLACK: MessageSquare,
  WEBHOOK: Webhook,
};

interface ChannelsData {
  myNotificationChannels: {
    success: { data: NotificationChannelRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

interface PreferencesData {
  myNotificationPreferences: {
    success: { data: NotificationPreferenceRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

export function SettingsNotificationsScreen() {
  const { t } = useI18n();

  const { data: chData, loading: chLoading, refetch: refetchCh } = useQuery<ChannelsData>(MY_NOTIFICATION_CHANNELS_QUERY);
  const { data: prData, loading: prLoading, refetch: refetchPr } = useQuery<PreferencesData>(MY_NOTIFICATION_PREFERENCES_QUERY);

  const [upsertChannel] = useMutation(UPSERT_NOTIFICATION_CHANNEL_MUTATION);
  const [upsertPreference] = useMutation(UPSERT_NOTIFICATION_PREFERENCE_MUTATION);
  const [deleteChannel] = useMutation(DELETE_NOTIFICATION_CHANNEL_MUTATION);

  const channels = chData?.myNotificationChannels?.success?.data ?? [];
  const preferences = prData?.myNotificationPreferences?.success?.data ?? [];

  const channelMap = new Map(channels.map((c) => [c.channelType, c]));
  const prefMap = new Map(preferences.map((p) => [p.eventType, p]));

  const handleToggleChannel = async (channelType: string) => {
    const existing = channelMap.get(channelType);
    try {
      if (existing?.isActive) {
        await upsertChannel({ variables: { input: { channelType, isActive: false } } });
      } else {
        await upsertChannel({ variables: { input: { channelType, isActive: true, config: {} } } });
      }
      await refetchCh();
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleTogglePreference = async (eventType: string, channelType: string) => {
    const existing = prefMap.get(eventType);
    const currentChannels = existing?.channels ?? [];
    const nextChannels = currentChannels.includes(channelType)
      ? currentChannels.filter((c) => c !== channelType)
      : [...currentChannels, channelType];

    try {
      await upsertPreference({
        variables: { input: { eventType, channels: nextChannels, isEnabled: nextChannels.length > 0 } },
      });
      await refetchPr();
    } catch (err) { toast.error((err as Error).message); }
  };

  const loading = chLoading || prLoading;

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.settings') }, { label: t('nav.settings.notifications') }],
        title: t('nav.settings.notifications'),
        description: t('settings.notifications.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SET-NOTI</code>,
      }}
    >
      <SectionCard title={t('settings.notifications.channels')} description={t('settings.notifications.channelsDesc')}>
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={48} />)}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {CHANNEL_TYPES.map((ct) => {
              const ch = channelMap.get(ct);
              const Icon = CHANNEL_ICON[ct] ?? Globe;
              return (
                <div key={ct} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2">
                      <Icon size={16} className="text-fg-muted" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-fg">{t(`settings.notifications.channelType.${ct}`)}</div>
                      <div className="text-[11px] text-fg-subtle">
                        {ct === 'EMAIL' && t('settings.notifications.emailHint')}
                        {ct === 'WEB_PUSH' && t('settings.notifications.webPushHint')}
                        {ct === 'SLACK' && t('settings.notifications.slackHint')}
                        {ct === 'WEBHOOK' && t('settings.notifications.webhookHint')}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={ch?.isActive ? 'outline' : 'primary'}
                    size="sm"
                    startIcon={<Power size={13} />}
                    onClick={() => handleToggleChannel(ct)}
                  >
                    {ch?.isActive ? t('settings.notifications.off') : t('settings.notifications.on')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title={t('settings.notifications.preferences')} description={t('settings.notifications.preferencesDesc')}>
        {loading ? (
          <div className="p-4"><Skeleton height={200} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="px-5 py-2 text-left font-semibold text-fg-muted">{t('settings.notifications.event')}</th>
                  {CHANNEL_TYPES.map((ct) => (
                    <th key={ct} className="px-3 py-2 text-center font-semibold text-fg-muted">{t(`settings.notifications.channelType.${ct}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EVENT_TYPES.map((et) => {
                  const pref = prefMap.get(et);
                  return (
                    <tr key={et} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-5 py-2.5 font-mono text-[11px] text-fg">{t(`settings.notifications.eventType.${et}`)}</td>
                      {CHANNEL_TYPES.map((ct) => {
                        const active = pref?.channels?.includes(ct) ?? false;
                        const channelEnabled = channelMap.get(ct)?.isActive ?? false;
                        return (
                          <td key={ct} className="px-3 py-2.5 text-center">
                            <Checkbox
                              checked={active}
                              disabled={!channelEnabled}
                              onChange={() => handleTogglePreference(et, ct)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
