/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  monochromeWordmark?: boolean;
  className?: string;
  to?: string;
}

export const BrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="Foliowalaweh Logo Icon"
    >
      <defs>
        {/* Soft gradient sheen for ribbon layers */}
        <linearGradient id="folioVioletGrad" x1="8" y1="12" x2="52" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9B7DFF" />
          <stop offset="100%" stopColor="#7E5BF0" />
        </linearGradient>
        <linearGradient id="folioBlueGrad" x1="8" y1="28" x2="50" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5DA6FF" />
          <stop offset="100%" stopColor="#3A8BEB" />
        </linearGradient>
        <linearGradient id="folioYellowGrad" x1="12" y1="42" x2="40" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD278" />
          <stop offset="100%" stopColor="#F5B642" />
        </linearGradient>
        <filter id="folioShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#202744" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Group with subtle shadow */}
      <g filter="url(#folioShadow)">
        {/* TOP RIBBON (Violet) - Flowing top bar of the F */}
        <path
          d="M14 30.5C14 20.835 21.835 13 31.5 13H48C51.866 13 55 16.134 55 20C55 23.866 51.866 27 48 27H29C23.477 27 19 31.477 19 37V37.5C19 37.5 14 36 14 30.5Z"
          fill="url(#folioVioletGrad)"
        />

        {/* MIDDLE RIBBON (Blue) - Rounded cross-arm of the F */}
        <path
          d="M14 29C14 38 18.5 44 26 44H44C47.866 44 51 40.866 51 37C51 33.134 47.866 30 44 30H27C21.477 30 17 25.523 17 20C17 20 14 23 14 29Z"
          fill="url(#folioBlueGrad)"
        />

        {/* BOTTOM RIBBON / STEM (Yellow) - Friendly organic lower sweep of the F */}
        <path
          d="M16 41C16 51.5 22.5 61 31 61C36.5 61 40 56.5 40 51.5C40 43.5 32 37.5 24 37.5L16 41Z"
          fill="url(#folioYellowGrad)"
        />

        {/* SPARKLE ACCENT (Yellow Star) at upper right */}
        <path
          d="M58 13.5C58 17.5 59.5 19 63.5 19C59.5 19 58 20.5 58 24.5C58 20.5 56.5 19 52.5 19C56.5 19 58 17.5 58 13.5Z"
          fill="#FFC45B"
        />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'auto',
  showTagline = false,
  monochromeWordmark = false,
  className = '',
  to,
}) => {
  const iconSizeMap = {
    sm: 26,
    md: 34,
    lg: 42,
    xl: 52,
  };

  const textStyleMap = {
    sm: 'text-base font-extrabold tracking-tight',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  };

  const taglineSizeMap = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const textColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#202744]'
      : 'text-[#202744] dark:text-white';

  const taglineColor =
    theme === 'dark'
      ? 'text-slate-300'
      : theme === 'light'
      ? 'text-[#69718A]'
      : 'text-[#69718A] dark:text-slate-300';

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'wordmark' && (
        <BrandIcon size={iconSizeMap[size]} />
      )}

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center">
            <span
              className={`font-sans ${textStyleMap[size]} ${textColor} transition-colors`}
              style={{ fontFamily: '"Plus Jakarta Sans", "Outfit", sans-serif' }}
            >
              {monochromeWordmark ? (
                'foliowalaweh'
              ) : (
                <>
                  folio<span className="text-[#8B6CF6]">walaweh</span>
                </>
              )}
            </span>
          </div>

          {showTagline && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={`font-sans font-semibold tracking-wide ${taglineSizeMap[size]} ${taglineColor}`}>
                Your Work <span className="text-[#FFC45B]">•</span> Your Story <span className="text-[#4697F5]">•</span> Your Way
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center transition hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
};
