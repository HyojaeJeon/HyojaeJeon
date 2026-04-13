import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Locale = 'vi' | 'ko' | 'en';

interface SettingsState {
  locale: Locale;
  biometricEnabled: boolean;
  notificationEnabled: boolean;
}

const initialState: SettingsState = {
  locale: 'vi',
  biometricEnabled: false,
  notificationEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.biometricEnabled = action.payload;
    },
    setNotificationEnabled(state, action: PayloadAction<boolean>) {
      state.notificationEnabled = action.payload;
    },
  },
});

export const { setLocale, setBiometricEnabled, setNotificationEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;
