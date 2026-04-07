'use client';

import { useGetBootstrapDataQuery } from '@store/api/index';
import LoginScreen from '@screens/LoginScreen';
import MainMenuScreen from '@screens/MainMenuScreen';

/**
 * POS 진입점
 *
 * 부트스트랩 → 세션 체크 → 라우팅:
 *   session 있음 → 메인 메뉴
 *   session 없음 → 로그인 화면
 *   로그인 성공 → 부트스트랩 캐시 무효화 → 재조회 → 메인 메뉴
 */
export default function Home() {
  const { data, isLoading, refetch } = useGetBootstrapDataQuery();

  // 부트스트랩 로딩 중
  if (isLoading || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-pos-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-pos-2xl bg-primary-500 flex items-center justify-center">
            <span className="text-white text-xl font-black">H</span>
          </div>
          <p className="text-sm text-pos-text-muted">시스템 초기화 중...</p>
        </div>
      </div>
    );
  }

  // 세션 없음 → 로그인
  if (!data.session) {
    return <LoginScreen onLoginSuccess={() => { void refetch(); }} />;
  }

  // 세션 있음 → 메인 메뉴
  return <MainMenuScreen session={data.session} />;
}
