/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SparkleAccent } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
  secondaryAction?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  className = '',
  secondaryAction,
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#E5E1DA] bg-white/70 p-8 md:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden ${className}`}
    >
      {/* Decorative sparkle in corner */}
      <div className="absolute top-4 right-4 opacity-40">
        <SparkleAccent size={16} />
      </div>

      {/* Icon orb */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8E0FF]/60 border border-[#D5C6FF] text-[#8B6CF6] shadow-xs">
        {icon || <SparkleAccent size={28} color="#8B6CF6" />}
      </div>

      <h3 className="font-sans text-base font-bold text-[#202744] mb-1.5 max-w-sm">
        {title}
      </h3>
      <p className="font-sans text-xs text-[#69718A] max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            leftIcon={actionIcon}
          >
            {actionText}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
};
