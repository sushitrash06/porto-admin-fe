/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'dark'
  | 'violet'
  | 'blue'
  | 'yellow'
  | 'lavender'
  | 'navy';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
  uppercase?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'xs',
  className = '',
  dot = false,
  uppercase = false,
}) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold leading-tight',
    sm: 'px-2.5 py-0.5 text-[11px] font-semibold leading-tight',
    md: 'px-3 py-1 text-xs font-semibold leading-normal',
  }[size];

  const variants: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    primary: {
      bg: 'bg-[#202744] text-white border border-[#202744]',
      dotColor: 'bg-[#FFC45B]',
    },
    secondary: {
      bg: 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]',
      dotColor: 'bg-[#69718A]',
    },
    neutral: {
      bg: 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]',
      dotColor: 'bg-[#69718A]',
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-800 border border-amber-200',
      dotColor: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-50 text-rose-700 border border-rose-200',
      dotColor: 'bg-rose-500',
    },
    info: {
      bg: 'bg-[#EFF6FF] text-[#1D63ED] border border-[#BFDBFE]',
      dotColor: 'bg-[#4697F5]',
    },
    dark: {
      bg: 'bg-[#151928] text-white border border-[#2A314E]',
      dotColor: 'bg-[#8B6CF6]',
    },
    violet: {
      bg: 'bg-[#F3EEFF] text-[#6941C6] border border-[#E8E0FF]',
      dotColor: 'bg-[#8B6CF6]',
    },
    blue: {
      bg: 'bg-[#EFF6FF] text-[#1E40AF] border border-[#DBEAFE]',
      dotColor: 'bg-[#4697F5]',
    },
    yellow: {
      bg: 'bg-[#FFF8EC] text-[#9A6B0A] border border-[#FFE8BD]',
      dotColor: 'bg-[#FFC45B]',
    },
    lavender: {
      bg: 'bg-[#FAF5FF] text-[#6B21A8] border border-[#F3E8FF]',
      dotColor: 'bg-[#8B6CF6]',
    },
    navy: {
      bg: 'bg-[#202744] text-white border border-[#2B3456]',
      dotColor: 'bg-[#FFC45B]',
    },
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-sans transition-colors ${
        uppercase ? 'uppercase tracking-wider' : 'tracking-normal'
      } ${sizeStyles} ${currentVariant.bg} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${currentVariant.dotColor} shrink-0`} />
      )}
      {children}
    </span>
  );
};
