/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, X } from 'lucide-react';

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
      <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]/70 pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-8 pl-10 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] placeholder:text-[#69718A]/60 transition-all shadow-3xs"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 p-1 text-[#69718A] hover:text-[#202744] transition cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
