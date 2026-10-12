/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { DynamicPortfolioRenderer, type DynamicPortfolioData } from '../organisms/DynamicPortfolioRenderer';

interface ThemeDeviceSimulatorProps {
  data: DynamicPortfolioData;
  title?: string;
  onClose?: () => void;
  publicUrl?: string;
  isModal?: boolean;
}

export const ThemeDeviceSimulator: React.FC<ThemeDeviceSimulatorProps> = ({
  data,
  title = 'Live Simulator Playground',
  onClose,
  publicUrl,
  isModal = true,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const frameWidth =
    device === 'mobile'
      ? 'w-[375px]'
      : device === 'tablet'
      ? 'w-[768px]'
      : 'w-full';

  const containerClasses = isModal
    ? `fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md transition-all duration-200 ${
        isFullscreen ? 'p-0' : 'p-3 sm:p-6'
      }`
    : 'flex flex-col h-[650px] w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl';

  return (
    <div className={containerClasses}>
      {/* ─── Top Control Bar ─── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0 text-xs font-sans text-slate-300 rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">{title}</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold">
              Live Preview
            </span>
          </div>
        </div>

        {/* Viewport Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700/80">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              device === 'desktop'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Resolution (Full Width)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              device === 'tablet'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet Resolution (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              device === 'mobile'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile Resolution (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Window Actions */}
        <div className="flex items-center gap-2">
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Open Live Public URL"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {isModal && (
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/50 transition cursor-pointer"
              title="Close Simulator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Screen Frame Container ─── */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/70">
        <div
          className={`h-full overflow-y-auto bg-white rounded-xl shadow-2xl transition-all duration-300 border border-slate-800 ${frameWidth} max-h-full`}
        >
          <DynamicPortfolioRenderer data={data} isInteractivePreview />
        </div>
      </div>
    </div>
  );
};

export default ThemeDeviceSimulator;
