import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { View, Text, Pressable, Modal as RNModal } from 'react-native';

interface ModalConfig {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  /** Custom content rendered below the title, instead of message */
  content?: ReactNode;
}

interface ModalContextValue {
  show: (config: ModalConfig) => void;
  hide: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const show = useCallback((c: ModalConfig) => setConfig(c), []);
  const hide = useCallback(() => {
    setConfig(null);
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!config?.onConfirm) {
      hide();
      return;
    }
    setLoading(true);
    try {
      await config.onConfirm();
      hide();
    } catch {
      setLoading(false);
    }
  }, [config, hide]);

  const handleCancel = useCallback(() => {
    config?.onCancel?.();
    hide();
  }, [config, hide]);

  const isDanger = config?.variant === 'danger';
  const showCancelButton = config?.cancelText !== undefined || config?.onCancel;

  return (
    <ModalContext.Provider value={{ show, hide }}>
      {children}
      {config && (
        <RNModal visible transparent animationType="fade" onRequestClose={hide}>
          <Pressable
            className="flex-1 bg-black/50 items-center justify-center px-6"
            onPress={hide}
          >
            <Pressable
              className="w-full bg-white rounded-2xl overflow-hidden"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Content */}
              <View className="px-6 pt-6 pb-4">
                <Text className="text-lg font-bold text-gray-900 text-center">
                  {config.title}
                </Text>
                {config.message && (
                  <Text className="mt-2 text-sm text-gray-500 text-center leading-5">
                    {config.message}
                  </Text>
                )}
                {config.content}
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-100" />

              {/* Actions */}
              <View className="flex-row">
                {showCancelButton ? (
                  <>
                    <Pressable
                      className="flex-1 py-4 items-center border-r border-gray-100"
                      onPress={handleCancel}
                    >
                      <Text className="text-[15px] font-medium text-gray-500">
                        {config.cancelText ?? 'Cancel'}
                      </Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 py-4 items-center"
                      onPress={handleConfirm}
                      disabled={loading}
                    >
                      <Text
                        className={`text-[15px] font-semibold ${isDanger ? 'text-red-500' : 'text-blue-500'}`}
                      >
                        {loading ? '...' : (config.confirmText ?? 'OK')}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable className="flex-1 py-4 items-center" onPress={handleConfirm}>
                    <Text
                      className={`text-[15px] font-semibold ${isDanger ? 'text-red-500' : 'text-blue-500'}`}
                    >
                      {config.confirmText ?? 'OK'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Pressable>
        </RNModal>
      )}
    </ModalContext.Provider>
  );
}
