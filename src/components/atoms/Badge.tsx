/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
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

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'xs',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[9px] font-bold tracking-wider',
    sm: 'px-2.5 py-1 text-[10px] font-semibold tracking-wide',
    md: 'px-3 py-1 text-xs font-semibold tracking-normal',
  }[size];

  const variants: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    primary: {
      bg: 'bg-[#202744] text-white border border-[#202744]',
      dotColor: 'bg-[#FFC45B]',
    },
    secondary: {
      bg: 'bg-slate-100 text-[#69718A] border border-slate-200/80',
      dotColor: 'bg-slate-400',
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
      bg: 'bg-red-50 text-red-700 border border-red-200',
      dotColor: 'bg-red-500',
    },
    info: {
      bg: 'bg-blue-50 text-blue-700 border border-blue-200',
      dotColor: 'bg-[#4697F5]',
    },
    dark: {
      bg: 'bg-[#151928] text-white border border-[#2A314E]',
      dotColor: 'bg-[#8B6CF6]',
    },
    violet: {
      bg: 'bg-[#E8E0FF] text-[#5533CC] border border-[#D5C6FF]',
      dotColor: 'bg-[#8B6CF6]',
    },
    blue: {
      bg: 'bg-[#E7F2FF] text-[#1E6FD6] border border-[#BFDEFF]',
      dotColor: 'bg-[#4697F5]',
    },
    yellow: {
      bg: 'bg-[#FFF6E3] text-[#A66E00] border border-[#FFE19E]',
      dotColor: 'bg-[#FFC45B]',
    },
    lavender: {
      bg: 'bg-[#F4EFFF] text-[#633CB8] border border-[#E8E0FF]',
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
      className={`inline-flex items-center gap-1.5 rounded-full font-sans uppercase ${sizeStyles} ${currentVariant.bg} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${currentVariant.dotColor} shrink-0`} />
      )}
      <span>{children}</span>
    </span>
  );
};
