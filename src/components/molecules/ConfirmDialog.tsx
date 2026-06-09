/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { AlertTriangle, Info, X, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
  showCancel?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  showCancel = true
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="p-6">
            <div className="flex items-start space-x-3.5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === 'danger' 
                  ? 'bg-red-50 text-red-600' 
                  : variant === 'warning'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {variant === 'danger' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : variant === 'warning' ? (
                  <HelpCircle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                  {title}
                </DialogTitle>
                <p className="mt-2 font-sans text-xs text-slate-500 leading-relaxed break-words">
                  {message}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-md hover:bg-slate-50 font-sans text-lg cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end space-x-2">
            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-md px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs transition active:scale-95 cursor-pointer ${
                variant === 'danger' 
                  ? 'bg-red-650 hover:bg-red-750' 
                  : variant === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-black hover:bg-slate-800'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
