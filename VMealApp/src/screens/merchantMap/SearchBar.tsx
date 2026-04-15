import { useRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, components } from '@shared/ui/tokens';

export function SearchBar() {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Search size={18} color={colors.textTertiary} />
        </View>
        <TextInput
          ref={inputRef}
          placeholder={t('merchant.searchPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          style={{
            height: components.input.height,
            width: '100%',
            borderRadius: radius.lg,
            backgroundColor: colors.bgInput,
            paddingLeft: 44,
            paddingRight: components.input.paddingHorizontal,
            fontSize: components.input.fontSize,
            color: colors.textPrimary,
          }}
        />
      </View>
    </Pressable>
  );
}
