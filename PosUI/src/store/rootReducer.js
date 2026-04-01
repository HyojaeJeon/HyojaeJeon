import { combineReducers } from '@reduxjs/toolkit';
import { posApi } from './api/posApi';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  [posApi.reducerPath]: posApi.reducer,
  ui: uiReducer,
});

export default rootReducer;
