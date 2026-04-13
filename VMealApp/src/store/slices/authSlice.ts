import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id: string;
  loginId: string;
  displayName: string;
  userType: string;
  corporateId: string | null;
  employeeId: string | null;
  walletId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
    },
    markHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setSession, clearSession, markHydrated } = authSlice.actions;
export default authSlice.reducer;
