import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  loginId: string;
  displayName: string;
  userType: 'SUPER_ADMIN' | 'DISTRIBUTOR_USER' | 'BRAND_ADMIN' | 'CORPORATE_ADMIN';
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.hydrated = true;
    },
    clearSession(state) {
      state.user = null;
      state.token = null;
      state.hydrated = true;
    },
    markHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setSession, clearSession, markHydrated } = authSlice.actions;
export default authSlice.reducer;
