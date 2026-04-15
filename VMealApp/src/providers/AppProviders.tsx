import React, { useCallback, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import { I18nextProvider } from 'react-i18next';
import { store, persistor } from '@store/index';
import { markHydrated } from '@store/slices/authSlice';
import { apolloClient } from '@graphql/client';
import { i18n } from '@i18n/index';
import { ModalProvider } from '@shared/ui';

/**
 * fooding-app 참고: react-native-css-interop 에서 displayName 없으면 경고 발생
 */
(SafeAreaProvider as unknown as { displayName: string }).displayName = 'SafeAreaProvider';
(I18nextProvider as unknown as { displayName: string }).displayName = 'I18nextProvider';

function HydrationLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-sm text-gray-400">Loading...</Text>
    </View>
  );
}

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  /**
   * PersistGate rehydration 완료 후 호출.
   * fooding-app 패턴: 모든 초기화가 끝난 뒤 hydrated 플래그를 켜서
   * RootNavigator 가 Splash → Onboarding/Main 으로 전환되도록 한다.
   */
  const handleBeforeLift = useCallback(() => {
    // Redux persist 복원 완료 → 저장된 locale로 i18n 동기화
    const savedLocale = store.getState().settings.locale;
    if (savedLocale && savedLocale !== i18n.language) {
      i18n.changeLanguage(savedLocale);
    }
    store.dispatch(markHydrated());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate
          loading={<HydrationLoading />}
          persistor={persistor}
          onBeforeLift={handleBeforeLift}
        >
          <ApolloProvider client={apolloClient}>
            <I18nextProvider i18n={i18n}>
              <SafeAreaProvider>
                <ModalProvider>
                  {children}
                </ModalProvider>
              </SafeAreaProvider>
            </I18nextProvider>
          </ApolloProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
