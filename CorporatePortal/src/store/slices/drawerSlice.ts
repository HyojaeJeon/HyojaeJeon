import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface DrawerState {
  openDrawer: string | null;
  drawerId: string | null;
}

const initialState: DrawerState = {
  openDrawer: null,
  drawerId: null,
};

const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    openDrawer(state, action: PayloadAction<{ drawer: string; id?: string }>) {
      state.openDrawer = action.payload.drawer;
      state.drawerId = action.payload.id ?? null;
    },
    closeDrawer(state) {
      state.openDrawer = null;
      state.drawerId = null;
    },
  },
});

export const { openDrawer, closeDrawer } = drawerSlice.actions;
export default drawerSlice.reducer;
