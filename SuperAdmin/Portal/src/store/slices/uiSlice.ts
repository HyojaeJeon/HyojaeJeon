import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  navCollapsed: boolean;
  commandPaletteOpen: boolean;
}

const initialState: UiState = {
  navCollapsed: false,
  commandPaletteOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleNavCollapsed(state) {
      state.navCollapsed = !state.navCollapsed;
    },
    setNavCollapsed(state, action: PayloadAction<boolean>) {
      state.navCollapsed = action.payload;
    },
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },
  },
});

export const { toggleNavCollapsed, setNavCollapsed, setCommandPaletteOpen } = uiSlice.actions;
export default uiSlice.reducer;
