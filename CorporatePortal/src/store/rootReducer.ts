import { combineReducers } from '@reduxjs/toolkit';
import navigation from './slices/navigationSlice';
import filters from './slices/filtersSlice';
import drawer from './slices/drawerSlice';
import auth from './slices/authSlice';

export const rootReducer = combineReducers({ auth, navigation, filters, drawer });
export type RootState = ReturnType<typeof rootReducer>;
