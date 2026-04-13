import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  loginId: string;
  displayName: string;
  userType: string;
  corporateId: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  accessTokenExpiresAt: string | null;
  sessionExpiresAt: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  accessTokenExpiresAt: null,
  sessionExpiresAt: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{
        user: AuthUser;
        token: string;
        accessTokenExpiresAt: string;
        sessionExpiresAt: string;
      }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
      state.hydrated = true;
    },
    clearSession(state) {
      state.user = null;
      state.token = null;
      state.accessTokenExpiresAt = null;
      state.sessionExpiresAt = null;
      state.hydrated = true;
    },
    markHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setSession, clearSession, markHydrated } = authSlice.actions;
export default authSlice.reducer;
