/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ToastMessage, ToastOptions } from '../types/toast';
import { ToastContainer } from '../components/atoms/ToastContainer';

interface ToastContextValue {
  toast: {
    success: (message: string, options?: ToastOptions | string) => void;
    error: (message: string, options?: ToastOptions | string) => void;
    info: (message: string, options?: ToastOptions | string) => void;
    warning: (message: string, options?: ToastOptions | string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastMessage['type'], message: string, options?: ToastOptions | string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const title = typeof options === 'string' ? options : options?.title;
      const duration = typeof options === 'object' && options.duration ? options.duration : 4000;

      const newToast: ToastMessage = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastMethods = useMemo(
    () => ({
      success: (msg: string, opt?: ToastOptions | string) => addToast('success', msg, opt),
      error: (msg: string, opt?: ToastOptions | string) => addToast('error', msg, opt),
      info: (msg: string, opt?: ToastOptions | string) => addToast('info', msg, opt),
      warning: (msg: string, opt?: ToastOptions | string) => addToast('warning', msg, opt),
    }),
    [addToast]
  );

  const value = useMemo(
    () => ({
      toast: toastMethods,
      removeToast,
    }),
    [toastMethods, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
