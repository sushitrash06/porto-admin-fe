/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'blue'
  | 'accent'
  | 'lavender'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-xl',
    md: 'px-4.5 py-2.5 text-sm font-semibold gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base font-bold gap-2.5 rounded-2xl',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#8B6CF6] text-white hover:bg-[#7A56F4] shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary:
      'bg-white text-[#202744] border border-[#E5E1DA] hover:bg-[#FAF8F5] hover:border-[#8B6CF6]/40 shadow-xs active:scale-[0.98]',
    blue:
      'bg-[#4697F5] text-white hover:bg-[#3284EB] shadow-sm hover:shadow-md active:scale-[0.98]',
    accent:
      'bg-[#FFC45B] text-[#202744] font-bold hover:bg-[#F7B540] shadow-sm hover:shadow-md active:scale-[0.98]',
    lavender:
      'bg-[#E8E0FF] text-[#202744] hover:bg-[#DCD0FF] border border-[#D5C6FF] active:scale-[0.98]',
    outline:
      'border-2 border-[#202744] text-[#202744] hover:bg-[#202744] hover:text-white active:scale-[0.98]',
    ghost:
      'text-[#69718A] hover:text-[#202744] hover:bg-slate-100/80 active:scale-[0.98]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-sans transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
