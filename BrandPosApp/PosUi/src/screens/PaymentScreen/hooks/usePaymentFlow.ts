import { useState, useCallback } from 'react';

// -------------------------------------------------------------------
// usePaymentFlow -- 결제 플로우 UI 전용 훅
//
// UI 상태 관리 전용. 데이터 조회/변경은 store/api/*Api.ts 훅 사용.
// 장치 imperative action은 bridge/commands/ 사용.
// -------------------------------------------------------------------

export type PaymentStep = 'idle' | 'selecting' | 'processing' | 'completed' | 'cancelled' | 'error';

interface UsePaymentFlowReturn {
  step: PaymentStep;
  selectedMethod: string;
  receivedAmount: number;
  numpadValue: string;
  errorMessage: string | null;
  setStep: (step: PaymentStep) => void;
  setSelectedMethod: (method: string) => void;
  setReceivedAmount: (amount: number) => void;
  setNumpadValue: (value: string) => void;
  setErrorMessage: (msg: string | null) => void;
  resetFlow: () => void;
}

export function usePaymentFlow(): UsePaymentFlowReturn {
  const [step, setStep] = useState<PaymentStep>('idle');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [numpadValue, setNumpadValue] = useState<string>('0');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFlow = useCallback(() => {
    setStep('idle');
    setSelectedMethod('');
    setReceivedAmount(0);
    setNumpadValue('0');
    setErrorMessage(null);
  }, []);

  return {
    step,
    selectedMethod,
    receivedAmount,
    numpadValue,
    errorMessage,
    setStep,
    setSelectedMethod,
    setReceivedAmount,
    setNumpadValue,
    setErrorMessage,
    resetFlow,
  };
}
