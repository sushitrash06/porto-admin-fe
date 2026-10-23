/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type DeviceMockupTheme = 'violet' | 'blue' | 'warm' | 'dark';

export interface DeviceMockupIllustrationProps {
  theme?: DeviceMockupTheme;
  className?: string;
}

export const DeviceMockupIllustration: React.FC<DeviceMockupIllustrationProps> = ({
  theme = 'violet',
  className = '',
}) => {
  const themes = {
    violet: {
      bg: 'bg-[#F2EDFF]',
      browserHeader: 'bg-[#8B6CF6]',
      browserDots: 'bg-white/70',
      browserBlock1: 'bg-[#EAE2FF]',
      browserBlock2: 'bg-[#F3EEFF]',
      phoneBorder: 'border-[#202744]',
      phoneAccent: 'bg-[#FFC45B]',
      phoneBlock1: 'bg-[#EAE2FF]',
      phoneBlock2: 'bg-[#FFF2D6]',
    },
    blue: {
      bg: 'bg-[#EBF3FF]',
      browserHeader: 'bg-[#4697F5]',
      browserDots: 'bg-white/70',
      browserBlock1: 'bg-[#DBEBFF]',
      browserBlock2: 'bg-[#EDF5FF]',
      phoneBorder: 'border-[#202744]',
      phoneAccent: 'bg-[#FFC45B]',
      phoneBlock1: 'bg-[#DBEBFF]',
      phoneBlock2: 'bg-[#FFF2D6]',
    },
    warm: {
      bg: 'bg-[#FFF7EA]',
      browserHeader: 'bg-[#8B6CF6]',
      browserDots: 'bg-white/70',
      browserBlock1: 'bg-[#F3EEFF]',
      browserBlock2: 'bg-[#FFF2D6]',
      phoneBorder: 'border-[#202744]',
      phoneAccent: 'bg-[#4697F5]',
      phoneBlock1: 'bg-[#FFF2D6]',
      phoneBlock2: 'bg-[#F3EEFF]',
    },
    dark: {
      bg: 'bg-[#182035]',
      browserHeader: 'bg-[#8B6CF6]',
      browserDots: 'bg-white/70',
      browserBlock1: 'bg-[#29324D]',
      browserBlock2: 'bg-[#202744]',
      phoneBorder: 'border-white/90',
      phoneAccent: 'bg-[#FFC45B]',
      phoneBlock1: 'bg-[#29324D]',
      phoneBlock2: 'bg-[#FFF2D6]',
    },
  }[theme];

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none transition-transform duration-300 group-hover:scale-102 ${themes.bg} ${className}`}
    >
      <div className="relative flex items-center justify-center gap-3 w-full max-w-[260px] h-[140px]">
        {/* Desktop Browser Window Mockup */}
        <div className="relative w-[150px] h-[98px] rounded-xl bg-white shadow-md border border-slate-200/40 p-2 flex flex-col justify-between shrink-0">
          {/* Browser Header Bar */}
          <div>
            <div className={`h-6 w-full rounded-md ${themes.browserHeader} flex items-center px-1.5`}>
              <div className={`h-1.5 w-1.5 rounded-full ${themes.browserDots}`} />
            </div>
            {/* Content Blocks */}
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className={`h-8 rounded-md ${themes.browserBlock1}`} />
              <div className={`h-8 rounded-md ${themes.browserBlock2}`} />
            </div>
          </div>
        </div>

        {/* Mobile Phone Mockup */}
        <div
          className={`relative w-[48px] h-[106px] rounded-2xl border-[3px] ${themes.phoneBorder} bg-white shadow-lg p-1 flex flex-col justify-between shrink-0 -rotate-3`}
        >
          {/* Top Phone Screen Widget */}
          <div className="space-y-1">
            <div className={`h-5 w-full rounded-md ${themes.phoneAccent}`} />
            <div className={`h-7 w-full rounded-md ${themes.phoneBlock1}`} />
            <div className={`h-6 w-full rounded-md ${themes.phoneBlock2}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
