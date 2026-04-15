import { useCallback, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Check, Clock, Plus, X } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows, components } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';

interface Participant {
  initials: string;
  name: string;
  amountVnd: number;
  status: 'PAID' | 'PENDING';
  isSelf: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  onAddParticipant?: (name: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ParticipantList({ participants, onAddParticipant }: ParticipantListProps) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [localParticipants, setLocalParticipants] = useState<Participant[]>([]);

  const allParticipants = [...participants, ...localParticipants];

  const handleAdd = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const handleConfirmAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (onAddParticipant) {
      onAddParticipant(trimmed);
    } else {
      setLocalParticipants((prev) => [
        ...prev,
        {
          initials: getInitials(trimmed),
          name: trimmed,
          amountVnd: 0,
          status: 'PENDING',
          isSelf: false,
        },
      ]);
    }

    setNewName('');
    setShowAddForm(false);
  }, [newName, onAddParticipant]);

  const handleCancelAdd = useCallback(() => {
    setNewName('');
    setShowAddForm(false);
  }, []);

  return (
    <View style={{ gap: spacing.elementGap }}>
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <Text style={typography.cardTitle}>
          {t('groupPay.members')} ({allParticipants.length})
        </Text>
        <Pressable onPress={handleAdd} className="flex-row items-center active:opacity-70" style={{ gap: spacing.xs }}>
          <Plus size={14} color={colors.primary} />
          <Text style={{ ...typography.caption, fontWeight: '500', color: colors.primary }}>
            {t('groupPay.add')}
          </Text>
        </Pressable>
      </View>

      {/* Add participant inline form */}
      {showAddForm && (
        <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: `${colors.primary}4D`, backgroundColor: colors.primaryLight, padding: spacing.cardPaddingCompact, gap: spacing.elementGap }}>
          <Text style={{ ...typography.caption, fontWeight: '500', color: colors.textPrimary }}>
            {t('groupPay.addMember', { defaultValue: 'Add Participant' })}
          </Text>
          <View className="flex-row items-center" style={{ gap: spacing.sm }}>
            <TextInput
              className="flex-1"
              style={{ height: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.elementGap, fontSize: typography.body.fontSize, color: colors.textPrimary }}
              placeholder={t('groupPay.namePlaceholder', { defaultValue: 'Enter name' })}
              placeholderTextColor={colors.textPlaceholder}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleConfirmAdd}
              returnKeyType="done"
            />
            <Pressable
              onPress={handleConfirmAdd}
              className="flex items-center justify-center active:opacity-80"
              style={{ height: 40, width: 40, borderRadius: radius.sm, backgroundColor: colors.primary }}
            >
              <Plus size={18} color={colors.textInverse} />
            </Pressable>
            <Pressable
              onPress={handleCancelAdd}
              className="flex items-center justify-center active:bg-gray-50"
              style={{ height: 40, width: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite }}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Participant cards */}
      <View style={{ gap: spacing.sm }}>
        {allParticipants.map((p) => (
          <View
            key={p.name}
            className="flex-row items-center"
            style={{ gap: spacing.elementGap, borderRadius: radius.md, backgroundColor: colors.bgCard, padding: spacing.cardPaddingCompact, ...shadows.card }}
          >
            {/* Avatar */}
            <View className="flex shrink-0 items-center justify-center" style={{ height: components.avatar.md.size, width: components.avatar.md.size, borderRadius: radius.full, backgroundColor: colors.primaryLight }}>
              <Text style={{ fontSize: components.avatar.md.fontSize, fontWeight: '600', color: colors.primary }}>{p.initials}</Text>
            </View>

            {/* Name + amount */}
            <View className="flex-1 min-w-0">
              <Text style={typography.cardTitle} numberOfLines={1}>
                {p.name}
                {p.isSelf && (
                  <Text style={typography.caption}> ({t('groupPay.you')})</Text>
                )}
              </Text>
              <Text style={typography.body}>{formatVnd(p.amountVnd)}</Text>
            </View>

            {/* Status */}
            {p.status === 'PAID' ? (
              <View className="flex items-center justify-center" style={{ height: 28, width: 28, borderRadius: radius.full, backgroundColor: colors.successLight }}>
                <Check size={16} color={colors.success} />
              </View>
            ) : (
              <View className="flex-row items-center" style={{ gap: spacing.xs, borderRadius: radius.full, backgroundColor: colors.warningLight, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Clock size={12} color={colors.warning} />
                <Text style={{ fontSize: 11, fontWeight: '500', color: colors.warning }}>{t('groupPay.waiting')}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
