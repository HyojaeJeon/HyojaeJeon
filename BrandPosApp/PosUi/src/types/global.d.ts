interface CefQueryRequest {
  request: string;
  onSuccess: (response: string) => void;
  onFailure: (errorCode: number, errorMessage: string) => void;
}

interface Window {
  cefQuery?: (req: CefQueryRequest) => void;
  posRealTimeCallback?: (jsonStr: string) => void;
  __MOCK_DELAY_MS?: number;
  __MOCK_OFFLINE?: boolean;
}
