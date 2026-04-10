import { combineReducers } from '@reduxjs/toolkit';
import ui from './slices/uiSlice';
import auth from './slices/authSlice';

export const rootReducer = combineReducers({ ui, auth });
export type RootState = ReturnType<typeof rootReducer>;
