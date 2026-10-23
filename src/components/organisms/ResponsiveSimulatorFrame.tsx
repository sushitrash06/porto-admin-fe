/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ResponsiveSimulatorFrameProps {
  device: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

/**
 * Isolated device viewport simulator using an internal iframe document portal.
 * This ensures that CSS Media Queries (sm:, md:, lg:, max-md:) evaluate strictly
 * against the simulated device viewport (375px for mobile, 768px for tablet, 100% for desktop)
 * rather than the host desktop browser window!
 */
export const ResponsiveSimulatorFrame: React.FC<ResponsiveSimulatorFrameProps> = ({
  device,
  children,
  className = '',
  fullHeight = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  const syncHeadAndStyles = useCallback((doc: Document) => {
    // Preserve any existing title or meta
    doc.head.innerHTML = '';

    const meta = doc.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    doc.head.appendChild(meta);

    // Copy Google Fonts, links, and all styles from host document
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });

    // Baseline reset so iframe body matches root document perfectly
    const baseStyle = doc.createElement('style');
    baseStyle.textContent = `
      *, ::before, ::after { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        min-height: 100%;
        width: 100%;
        background-color: transparent;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }
      /* Custom clean subtle scrollbar */
      ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(140, 140, 160, 0.3);
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(140, 140, 160, 0.55);
      }
    `;
    doc.head.appendChild(baseStyle);

    // Apply main font and body classes
    doc.body.className = document.body.className || '';
  }, []);

  const initIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || !doc.body) return;

      syncHeadAndStyles(doc);
      setMountNode(doc.body);
    } catch (e) {
      console.error('Failed to initialize simulator iframe:', e);
    }
  }, [syncHeadAndStyles]);

  useEffect(() => {
    initIframe();

    // Secondary trigger in case iframe document needed a tick
    const timer = setTimeout(() => {
      initIframe();
    }, 50);

    // Listen to style changes in the main document (e.g. Vite HMR style updates)
    const observer = new MutationObserver(() => {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
          const nodeIdentifier =
            node.tagName +
            (node.getAttribute('data-vite-dev-id') ||
              (node as HTMLLinkElement).href ||
              node.textContent?.slice(0, 50));
          const exists = Array.from(doc.head.children).some((child) => {
            const childId =
              child.tagName +
              (child.getAttribute('data-vite-dev-id') ||
                (child as HTMLLinkElement).href ||
                child.textContent?.slice(0, 50));
            return childId === nodeIdentifier;
          });
          if (!exists) {
            doc.head.appendChild(node.cloneNode(true));
          }
        });
      }
    });

    observer.observe(document.head, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [initIframe]);

  const widthStyle: React.CSSProperties = {
    width: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
    maxWidth: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
  };

  const casingClass =
    device === 'mobile'
      ? 'rounded-[44px] border-[10px] border-[#22283C] bg-[#22283C] ring-1 ring-white/10 shrink-0'
      : device === 'tablet'
      ? 'rounded-[32px] border-[10px] border-[#22283C] bg-[#22283C] ring-1 ring-white/10 shrink-0'
      : 'rounded-2xl border border-[#2A3454] bg-[#1E253B]';

  return (
    <div
      style={widthStyle}
      className={`transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-0 h-full ${
        fullHeight ? 'max-h-full' : 'max-h-[840px]'
      } shrink-0 ${className}`}
    >
      <div className={`w-full h-full min-h-0 flex flex-col shadow-2xl overflow-hidden relative transition-all duration-300 ${casingClass}`}>
        {/* Top Header / Bezel */}
        {device === 'mobile' && (
          <div className="h-7 bg-[#22283C] shrink-0 flex items-center justify-center relative select-none">
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2.5 gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 block" />
              <span className="w-2 h-2 rounded-full bg-[#1c2438] block" />
            </div>
          </div>
        )}
        {device === 'tablet' && (
          <div className="h-5 bg-[#22283C] shrink-0 flex items-center justify-center select-none">
            <span className="w-2 h-2 rounded-full bg-[#1c2438] ring-1 ring-white/10 block" />
          </div>
        )}
        {device === 'desktop' && (
          <div className="h-7 bg-[#1E253B] border-b border-[#2A3454] shrink-0 flex items-center px-3 gap-1.5 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 block" />
            <span className="mx-auto text-[10px] font-mono text-slate-400">foliowalaweh.dev/preview</span>
          </div>
        )}

        {/* Persistent Screen with Isolated Iframe Viewport */}
        <div className="flex-1 overflow-hidden relative w-full h-full bg-white">
          <iframe
            ref={iframeRef}
            onLoad={initIframe}
            className="w-full h-full border-none block"
            title="Responsive Device Preview"
          />
          {mountNode && createPortal(children, mountNode)}
        </div>

        {/* Bottom Bezel */}
        {device === 'mobile' && (
          <div className="h-4 bg-[#22283C] shrink-0 flex items-center justify-center select-none">
            <div className="w-28 h-1 bg-white/30 rounded-full" />
          </div>
        )}
        {device === 'tablet' && (
          <div className="h-3.5 bg-[#22283C] shrink-0" />
        )}
      </div>
    </div>
  );
};

export default ResponsiveSimulatorFrame;
