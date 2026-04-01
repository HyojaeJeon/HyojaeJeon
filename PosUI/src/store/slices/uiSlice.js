import { createSlice } from '@reduxjs/toolkit';

/**
 * UI Slice — 클라이언트 상태만 관리
 * 서버 데이터(테이블, 주문, 결제)는 RTK Query 캐시가 원본이다.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isProcessing: false,
    processingAction: null,
    activeModal: null,
    activeTab: 'table',
    deviceErrors: [],
    toasts: [],
  },
  reducers: {
    setProcessing(state, action) {
      state.isProcessing = action.payload.active;
      state.processingAction = action.payload.action || null;
    },
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    pushDeviceError(state, action) {
      state.deviceErrors.push(action.payload);
    },
    clearDeviceError(state, action) {
      state.deviceErrors = state.deviceErrors.filter(
        (e) => e.code !== action.payload,
      );
    },
    addToast(state, action) {
      state.toasts.push({ id: Date.now(), ...action.payload });
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setProcessing,
  openModal,
  closeModal,
  setActiveTab,
  pushDeviceError,
  clearDeviceError,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
