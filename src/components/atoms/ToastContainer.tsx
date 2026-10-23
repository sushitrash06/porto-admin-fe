/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { ToastMessage } from '../../types/toast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none font-sans"
    >
      {toasts.map((toast) => {
        let icon = <Info className="h-4 w-4 text-[#8B6CF6] shrink-0" />;
        let iconBg = 'bg-[#F4F0FF] border-[#E0D5FF]';
        let borderColor = 'border-[#EAE5DD]';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
          iconBg = 'bg-emerald-50 border-emerald-200';
          borderColor = 'border-emerald-200';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />;
          iconBg = 'bg-rose-50 border-rose-200';
          borderColor = 'border-rose-200';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />;
          iconBg = 'bg-amber-50 border-amber-200';
          borderColor = 'border-amber-200';
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl bg-white p-3.5 border ${borderColor} shadow-lg shadow-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200 transition-all`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${iconBg}`}
            >
              {icon}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && (
                <h5 className="font-sans text-xs font-bold text-[#202744] leading-tight mb-0.5">
                  {toast.title}
                </h5>
              )}
              <p className="font-sans text-xs font-medium text-[#69718A] leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="p-1 rounded-lg text-[#8A90A2] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer shrink-0 mt-0.5"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
