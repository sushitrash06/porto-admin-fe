/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagsInput: React.FC<TagsInputProps> = ({ tags, onChange, placeholder = 'insert project tags' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleBlur = () => {
    const val = inputValue.trim().replace(/,$/, '');
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
      setInputValue('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const newTags = paste
      .split(/[,\n]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !tags.includes(tag));

    if (newTags.length > 0) {
      onChange([...tags, ...newTags]);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-400 transition text-slate-900 cursor-text">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center space-x-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-650"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer focus:outline-none transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-xs min-w-[120px] text-slate-900"
      />
    </div>
  );
};
