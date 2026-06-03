/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const baseStyle = 'inline-flex items-center space-x-1 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider border';
  
  const variants = {
    primary: 'bg-black text-white border-black shadow-3xs',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-55 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-250',
    danger: 'bg-red-50 text-red-650 border-red-150',
    info: 'bg-slate-50 text-slate-500 border-slate-200',
    dark: 'bg-neutral-900 text-white border-neutral-800'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
