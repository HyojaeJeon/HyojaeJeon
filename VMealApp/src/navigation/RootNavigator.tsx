import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '@store/index';
import { MainTabNavigator } from './MainTabNavigator';
import SplashScreen from '@screens/splash/SplashScreen';
import OnboardingScreen from '@screens/onboarding/OnboardingScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: undefined;
  OrderScreen: { merchantId: string; branchId: string };
  OrderStatusScreen: { orderId: string };
  MerchantDetailScreen: { enrollmentId: string; tab?: string };
  TransactionDetailScreen: { transactionId: string };
  TopUpScreen: undefined;
  SettingsScreen: undefined;
  BadgeLinkScreen: undefined;
  PolicyViewScreen: undefined;
  DailyMenuListScreen: { mealType?: string };
  PreOrderScreen: { branchId: string; mealType: string };
  MyPreOrdersScreen: undefined;
  GroupPayScreen: { merchantId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/*
       * 루트 레벨 SafeAreaView — 전체 스크린에 top/bottom safe area 적용.
       * Tab Navigator 는 safeAreaInsets={{ bottom: 0 }} 으로 하단 중복 방지.
       * Splash 처럼 전체 화면이 필요한 스크린은 edges 오버라이드.
       */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top', 'bottom']}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1, backgroundColor: '#F8FAFC' },
            animation: 'slide_from_right',
          }}
        >
          {!hydrated ? (
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : !user ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              {/* Full-screen modals / detail screens */}
            </>
          )}
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
