import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeviceError {
  type: string;
  device: string;
  code: string;
  msgKey: string;
  msgParams?: Record<string, string>;
  severity: string;
  recoverable: boolean;
  retryable: boolean;
  action: string;
}

interface Toast {
  id: number;
  type: string;
  message: string;
}

interface UiState {
  isProcessing: boolean;
  processingAction: string | null;
  activeModal: string | null;
  activeTab: string;
  deviceErrors: DeviceError[];
  toasts: Toast[];
}

const initialState: UiState = {
  isProcessing: false,
  processingAction: null,
  activeModal: null,
  activeTab: 'table',
  deviceErrors: [],
  toasts: [],
};

/**
 * UI Slice — 클라이언트 상태만 관리
 * 서버 데이터(테이블, 주문, 결제)는 RTK Query 캐시가 원본이다.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setProcessing(state, action: PayloadAction<{ active: boolean; action?: string }>) {
      state.isProcessing = action.payload.active;
      state.processingAction = action.payload.action || null;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    pushDeviceError(state, action: PayloadAction<DeviceError>) {
      state.deviceErrors.push(action.payload);
    },
    clearDeviceError(state, action: PayloadAction<string>) {
      state.deviceErrors = state.deviceErrors.filter(
        (e) => e.code !== action.payload,
      );
    },
    addToast(state, action: PayloadAction<{ type: string; message: string }>) {
      state.toasts.push({ id: Date.now(), ...action.payload });
    },
    removeToast(state, action: PayloadAction<number>) {
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
