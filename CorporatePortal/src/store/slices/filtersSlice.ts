import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type PeriodFilter = 'current' | 'previous' | 'quarter' | 'custom';

interface FiltersState {
  periodFilter: PeriodFilter;
  dateRange: { from: string | null; to: string | null };
  departmentIds: string[];
  walletStatus: string | null;
  searchQuery: string;
}

const initialState: FiltersState = {
  periodFilter: 'current',
  dateRange: { from: null, to: null },
  departmentIds: [],
  walletStatus: null,
  searchQuery: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setPeriodFilter(state, action: PayloadAction<PeriodFilter>) {
      state.periodFilter = action.payload;
    },
    setDateRange(state, action: PayloadAction<{ from: string | null; to: string | null }>) {
      state.dateRange = action.payload;
    },
    setDepartmentIds(state, action: PayloadAction<string[]>) {
      state.departmentIds = action.payload;
    },
    setWalletStatus(state, action: PayloadAction<string | null>) {
      state.walletStatus = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setPeriodFilter,
  setDateRange,
  setDepartmentIds,
  setWalletStatus,
  setSearchQuery,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
