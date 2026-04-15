import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '@store/index';
import { MainTabNavigator } from './MainTabNavigator';
import SplashScreen from '@screens/splash/SplashScreen';
import OnboardingScreen from '@screens/onboarding/OnboardingScreen';
import LoginScreen from '@screens/login/LoginScreen';
import AuthScreen from '@screens/auth/AuthScreen';
import TopUpScreen from '@screens/topUp/TopUpScreen';
import MerchantDetailScreen from '@screens/merchantDetail/MerchantDetailScreen';
import TransactionDetailScreen from '@screens/transactionDetail/TransactionDetailScreen';
import GroupPayScreen from '@screens/groupPay/GroupPayScreen';
import BadgeLinkScreen from '@screens/badgeLink/BadgeLinkScreen';
import PolicyViewScreen from '@screens/policyView/PolicyViewScreen';
import DailyMenuListScreen from '@screens/dailyMenuList/DailyMenuListScreen';
import PreOrderScreen from '@screens/preOrder/PreOrderScreen';
import MyPreOrdersScreen from '@screens/myPreOrders/MyPreOrdersScreen';
import EWalletLinkScreen from '@screens/eWalletLink/EWalletLinkScreen';
import SupportScreen from '@screens/support/SupportScreen';
import AppInfoScreen from '@screens/appInfo/AppInfoScreen';
import ProfileEditScreen from '@screens/profileEdit/ProfileEditScreen';
import NotificationSettingScreen from '@screens/notificationSetting/NotificationSettingScreen';
import LanguageSettingScreen from '@screens/languageSetting/LanguageSettingScreen';
import TopUpResultScreen from '@screens/topUpResult/TopUpResultScreen';
import MerchantNavigateScreen from '@screens/merchantNavigate/MerchantNavigateScreen';
import NotificationListScreen from '@screens/notificationList/NotificationListScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Auth: undefined;
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
  ProfileEditScreen: undefined;
  EWalletLinkScreen: undefined;
  NotificationListScreen: undefined;
  NotificationSettingScreen: undefined;
  LanguageSettingScreen: undefined;
  SupportScreen: undefined;
  AppInfoScreen: undefined;
  TopUpResultScreen: { amount: number; success: boolean; balanceAfter: number };
  MerchantNavigateScreen: { latitude: number; longitude: number; address: string; merchantName: string };
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
            <>
              {/* 기획서 §4.1 인증 흐름: Onboarding → Login → Auth(OTP/매핑/권한) */}
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Auth" component={AuthScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen name="TopUpScreen" component={TopUpScreen} />
              <Stack.Screen name="MerchantDetailScreen" component={MerchantDetailScreen} />
              <Stack.Screen name="TransactionDetailScreen" component={TransactionDetailScreen} />
              <Stack.Screen name="GroupPayScreen" component={GroupPayScreen} />
              <Stack.Screen name="BadgeLinkScreen" component={BadgeLinkScreen} />
              <Stack.Screen name="PolicyViewScreen" component={PolicyViewScreen} />
              <Stack.Screen name="DailyMenuListScreen" component={DailyMenuListScreen} />
              <Stack.Screen name="PreOrderScreen" component={PreOrderScreen} />
              <Stack.Screen name="MyPreOrdersScreen" component={MyPreOrdersScreen} />
              <Stack.Screen name="EWalletLinkScreen" component={EWalletLinkScreen} />
              <Stack.Screen name="SupportScreen" component={SupportScreen} />
              <Stack.Screen name="AppInfoScreen" component={AppInfoScreen} />
              <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} />
              <Stack.Screen name="NotificationListScreen" component={NotificationListScreen} />
              <Stack.Screen name="NotificationSettingScreen" component={NotificationSettingScreen} />
              <Stack.Screen name="LanguageSettingScreen" component={LanguageSettingScreen} />
              <Stack.Screen name="TopUpResultScreen" component={TopUpResultScreen} />
              <Stack.Screen name="MerchantNavigateScreen" component={MerchantNavigateScreen} />
            </>
          )}
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
