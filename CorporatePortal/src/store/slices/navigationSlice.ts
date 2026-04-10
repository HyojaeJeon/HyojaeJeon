import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  navCollapsed: boolean;
}

const initialState: NavigationState = {
  navCollapsed: false,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    toggleNavCollapsed(state) {
      state.navCollapsed = !state.navCollapsed;
    },
    setNavCollapsed(state, action: PayloadAction<boolean>) {
      state.navCollapsed = action.payload;
    },
  },
});

export const { toggleNavCollapsed, setNavCollapsed } = navigationSlice.actions;
export default navigationSlice.reducer;
