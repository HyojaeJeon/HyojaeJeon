import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WalletSnapshot {
  balanceVnd: number;
  companyAllowanceVnd: number;
  personalTopUpVnd: number;
  dailyLimitVnd: number;
  status: string;
}

interface WalletState {
  snapshot: WalletSnapshot | null;
  lastUpdatedAt: string | null;
}

const initialState: WalletState = {
  snapshot: null,
  lastUpdatedAt: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletSnapshot(state, action: PayloadAction<WalletSnapshot>) {
      state.snapshot = action.payload;
      state.lastUpdatedAt = new Date().toISOString();
    },
    clearWallet(state) {
      state.snapshot = null;
      state.lastUpdatedAt = null;
    },
  },
});

export const { setWalletSnapshot, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
