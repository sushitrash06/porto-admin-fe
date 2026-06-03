/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  id = 'search-input',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-4 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
};
