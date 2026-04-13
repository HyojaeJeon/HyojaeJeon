import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { rootReducer, type RootState } from './rootReducer';

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    // Redux DevTools extension 는 Symbol.observable 경고를 유발할 수 있어
    // 운영/개발 모두에서 비활성화한다. 디버깅은 Redux state slice 직접 확인으로 충분하다.
    devTools: false,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type { RootState };

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
