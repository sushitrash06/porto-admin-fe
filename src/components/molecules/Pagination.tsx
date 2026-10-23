/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
  variant?: 'table' | 'standalone';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemLabel = 'records',
  onPageChange,
  className = '',
  variant = 'table',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems === 0)) {
    return null;
  }

  // Calculate range if totalItems and itemsPerPage are provided
  let rangeInfo = '';
  if (totalItems !== undefined && itemsPerPage !== undefined) {
    const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    rangeInfo = `Showing ${start}–${end} of ${totalItems} ${itemLabel}`;
  } else if (totalItems !== undefined) {
    rangeInfo = `Page ${currentPage} of ${totalPages} (${totalItems} ${itemLabel})`;
  } else {
    rangeInfo = `Page ${currentPage} of ${totalPages}`;
  }

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const containerStyles =
    variant === 'table'
      ? 'border-t border-[#EAE5DD] bg-[#FAF8F5]/70 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs'
      : 'flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-4';

  return (
    <div className={`${containerStyles} ${className}`}>
      {/* Informative text */}
      <div className="font-sans text-[#69718A]">
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <span>
            Showing <strong className="font-semibold text-[#202744]">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</strong>–<strong className="font-semibold text-[#202744]">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong className="font-semibold text-[#202744]">{totalItems}</strong> {itemLabel}
          </span>
        ) : (
          <span>{rangeInfo}</span>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 select-none">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#EAE5DD] bg-white text-xs font-semibold text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6]/40 transition shadow-3xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numeric page pills */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="h-8 w-6 flex items-center justify-center text-[#69718A] text-xs">
                  …
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`h-8 min-w-[32px] px-2 rounded-lg font-sans text-xs font-semibold transition cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-[#8B6CF6] text-white shadow-3xs font-bold'
                    : 'bg-white border border-[#EAE5DD] text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6]/30 shadow-3xs'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Small screen page indicator */}
        <span className="sm:hidden font-sans text-xs font-semibold text-[#202744] px-2">
          {currentPage} / {totalPages}
        </span>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#EAE5DD] bg-white text-xs font-semibold text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6]/40 transition shadow-3xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
