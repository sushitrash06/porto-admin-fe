/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/* ─── 1. Main Table Outer Container ─── */
export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hasOverflow?: boolean;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  children,
  className = '',
  hasOverflow = true,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#EAE5DD] bg-white shadow-3xs overflow-hidden transition-all ${className}`}
      {...props}
    >
      {hasOverflow ? (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#EAE5DD] scrollbar-track-transparent">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

/* ─── 2. Semantic Table Element ─── */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  minWidth = 'min-w-[680px]',
  className = '',
  ...props
}) => {
  return (
    <table
      className={`w-full ${minWidth} border-collapse text-left text-xs font-sans ${className}`}
      {...props}
    >
      {children}
    </table>
  );
};

/* ─── 3. Header & Columns ─── */
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead
      className={`bg-[#FAF8F5]/85 border-b border-[#EAE5DD] font-sans text-[11px] font-semibold text-[#69718A] tracking-normal select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
};

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  align = 'left',
  className = '',
  ...props
}) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th
      className={`px-5 py-3.5 whitespace-nowrap font-semibold ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

/* ─── 4. Body & Rows with Subtle Violet Hover ─── */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody
      className={`divide-y divide-[#F3EFEA] font-sans text-[#202744] ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isClickable?: boolean;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  isClickable = false,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`group transition-colors duration-150 hover:bg-[#8B6CF6]/[0.035] ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  className = '',
  ...props
}) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <td
      className={`px-5 py-4 align-middle text-xs ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

/* ─── 5. Table Identity Tile (Avatar / Initials Tile) ─── */
export interface TableIdentityTileProps {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'violet' | 'blue' | 'yellow' | 'neutral';
  className?: string;
}

export const TableIdentityTile: React.FC<TableIdentityTileProps> = ({
  name,
  image,
  size = 'md',
  variant = 'violet',
  className = '',
}) => {
  const sizeClass = {
    sm: 'h-7 w-7 rounded-lg text-[10px]',
    md: 'h-9 w-9 rounded-xl text-xs',
    lg: 'h-11 w-11 rounded-xl text-sm',
  }[size];

  const variantClass = {
    violet: 'bg-[#F3EEFF] text-[#8B6CF6] border-[#E8E0FF]',
    blue: 'bg-[#EBF3FE] text-[#4697F5] border-[#D6E6FD]',
    yellow: 'bg-[#FFF8EC] text-[#B88719] border-[#FFE8BD]',
    neutral: 'bg-[#FAF8F5] text-[#69718A] border-[#EAE5DD]',
  }[variant];

  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${sizeClass} shrink-0 object-cover bg-[#FAF8F5] border border-[#EAE5DD] shadow-3xs ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} shrink-0 font-bold uppercase flex items-center justify-center border shadow-3xs ${variantClass} ${className}`}
    >
      {initials || '?'}
    </div>
  );
};

/* ─── 6. Action Icon Button ─── */
export interface TableActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: 'default' | 'danger' | 'violet' | 'blue' | 'warning';
  className?: string;
}

export const TableActionButton: React.FC<TableActionButtonProps> = ({
  icon,
  label,
  variant = 'default',
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    default:
      'text-[#69718A] hover:text-[#8B6CF6] hover:bg-[#F3EEFF] hover:border-[#8B6CF6]/25 border-transparent',
    violet:
      'text-[#8B6CF6] hover:text-[#7857ED] hover:bg-[#F3EEFF] hover:border-[#8B6CF6]/30 border-transparent',
    blue:
      'text-[#4697F5] hover:text-[#3284EB] hover:bg-[#EBF3FE] hover:border-[#4697F5]/30 border-transparent',
    warning:
      'text-amber-700 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-200 border-transparent',
    danger:
      'text-[#69718A] hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-transparent',
  }[variant];

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border text-xs transition-all duration-150 cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95 ${variantStyles} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

/* ─── 7. Loading & Empty States for Tables ─── */
export interface TableStateProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const TableLoadingRow: React.FC<TableStateProps> = ({
  colSpan,
  message = 'Loading data records...',
}) => {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan} className="px-5 py-14 text-center text-[#69718A]">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#8B6CF6] mb-2.5" />
        <p className="font-sans text-xs font-medium text-[#202744]">{message}</p>
      </td>
    </tr>
  );
};

export const TableEmptyRow: React.FC<TableStateProps> = ({
  colSpan,
  message = 'No records found matching your criteria.',
  icon,
  children,
}) => {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan} className="px-5 py-14 text-center text-[#69718A]">
        {icon && <div className="mx-auto mb-2.5 flex justify-center text-[#8B6CF6]/60">{icon}</div>}
        <p className="font-sans text-xs font-semibold text-[#202744]">{message}</p>
        {children && <div className="mt-3 flex justify-center">{children}</div>}
      </td>
    </tr>
  );
};
