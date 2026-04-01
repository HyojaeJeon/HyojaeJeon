import { configureStore } from '@reduxjs/toolkit';
import { posApi } from './api/posApi';
import rootReducer from './rootReducer';

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().concat(posApi.middleware),
  });
}
