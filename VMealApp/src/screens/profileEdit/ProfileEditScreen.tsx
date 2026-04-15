import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Camera, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, PrimaryButton, Card, useModal } from '@shared/ui';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';
import { useSettingsData } from '../settings/useSettingsData';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-3);
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...typography.caption, fontWeight: '500', color: colors.textTertiary }}>{label}</Text>
      <View className="flex-row items-center" style={{ height: 48, borderRadius: radius.md, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg }}>
        <Text className="flex-1" style={{ fontSize: components.input.fontSize, color: colors.textTertiary }}>{value}</Text>
        <Lock size={14} color={colors.textPlaceholder} />
      </View>
    </View>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
}

function EditableField({ label, value, onChangeText, placeholder, keyboardType = 'default' }: EditableFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ ...typography.caption, fontWeight: '500', color: colors.textSecondary }}>{label}</Text>
      <TextInput
        style={{ height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.lg, fontSize: components.input.fontSize, color: colors.textPrimary }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function ProfileEditScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { show: showModal } = useModal();
  const { employee, loading } = useSettingsData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [_saving, setSaving] = useState(false);

  // Sync local state when employee data arrives
  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
    }
  }, [employee]);

  if (loading || !employee) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppHeader title={t('profileEdit.title')} onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const initials = getInitials(employee.name);
  const maskedPhone = maskPhone(employee.phone);

  const handleChangePhoto = () => {
    showModal({
      title: t('profileEdit.changePhoto'),
      message: t('profileEdit.photoOptions'),
      confirmText: t('profileEdit.openCamera'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
        // In production: open camera/gallery picker
      },
    });
  };

  const handleSave = () => {
    setSaving(true);
    // In production: call mutation to update profile
    setTimeout(() => {
      setSaving(false);
      showModal({
        title: t('profileEdit.saved'),
        message: t('profileEdit.savedMessage'),
        confirmText: t('common.ok'),
        onConfirm: () => navigation.goBack(),
      });
    }, 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('profileEdit.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: 120 }}>
        {/* Avatar section */}
        <View className="items-center" style={{ gap: spacing.elementGap, marginBottom: spacing.xxl }}>
          <View className="items-center justify-center" style={{ height: components.avatar.xl.size + 16, width: components.avatar.xl.size + 16, borderRadius: radius.full, backgroundColor: colors.primary }}>
            <Text style={{ fontSize: components.avatar.xl.fontSize + 4, fontWeight: '700', color: colors.textInverse }}>{initials}</Text>
          </View>
          <Pressable
            className="flex-row items-center active:opacity-70"
            style={{ gap: 6 }}
            onPress={handleChangePhoto}
          >
            <Camera size={16} color={colors.primary} />
            <Text style={{ ...typography.body, fontWeight: '500', color: colors.primary }}>
              {t('profileEdit.changePhoto')}
            </Text>
          </Pressable>
        </View>

        {/* Editable fields */}
        <Card style={{ padding: spacing.cardPadding, marginBottom: spacing.lg }}>
          <View style={{ gap: spacing.lg }}>
            <EditableField
              label={t('profileEdit.name')}
              value={name}
              onChangeText={setName}
              placeholder={t('profileEdit.namePlaceholder')}
            />

            <View style={{ gap: 6 }}>
              <Text style={{ ...typography.caption, fontWeight: '500', color: colors.textTertiary }}>{t('profileEdit.phone')}</Text>
              <View className="flex-row items-center" style={{ height: 48, borderRadius: radius.md, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg }}>
                <Text className="flex-1" style={{ fontSize: components.input.fontSize, color: colors.textTertiary }}>{maskedPhone}</Text>
                <Lock size={14} color={colors.textPlaceholder} />
              </View>
            </View>

            <EditableField
              label={t('profileEdit.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('profileEdit.emailPlaceholder')}
              keyboardType="email-address"
            />
          </View>
        </Card>

        {/* Read-only fields */}
        <Card style={{ padding: spacing.cardPadding }}>
          <View style={{ gap: spacing.lg }}>
            <ReadOnlyField
              label={t('profileEdit.department')}
              value={employee.department}
            />
            <ReadOnlyField
              label={t('profileEdit.employeeCode')}
              value={employee.employeeCode}
            />
            <ReadOnlyField
              label={t('profileEdit.company')}
              value={employee.corporateName}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Bottom save button */}
      <View className="absolute bottom-0 left-0 right-0" style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.xxl, paddingTop: spacing.lg }}>
        <PrimaryButton
          title={t('profileEdit.save')}
          onPress={handleSave}
          variant="primary"
          size="lg"
          loading={_saving}
          className="w-full"
        />
      </View>
    </View>
  );
}
