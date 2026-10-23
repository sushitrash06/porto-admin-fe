/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, ArrowUpRight, Sparkles } from 'lucide-react';

interface AuthShowcaseCardProps {
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: string;
}

export const AuthShowcaseCard: React.FC<AuthShowcaseCardProps> = ({
  eyebrow = 'RUANG UNTUK KARYAMU',
  title = (
    <>
      Karyamu punya<br />
      cerita. Lanjutkan, yuk.
    </>
  ),
  subtitle = 'Rapikan proyek, perbarui profil, dan siapkan ruang untuk kesempatan berikutnya.',
}) => {
  return (
    <div className="w-full h-full rounded-[32px] sm:rounded-[36px] bg-[#EBE7FF] p-6 sm:p-8 lg:p-9 flex flex-col justify-between shadow-xs relative overflow-hidden">
      <div>
        {/* Top Header Pill & Sparkle */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center rounded-full bg-white/90 border border-white px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4361EE] shadow-3xs">
            {eyebrow}
          </span>
          <Sparkles className="h-5 w-5 text-[#8B6CF6] opacity-80" />
        </div>

        {/* Main Headline */}
        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#202744] leading-tight tracking-tight mb-2">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
          {subtitle}
        </p>

        {/* Browser Mockup Window */}
        <div className="rounded-2xl bg-white border border-white/80 shadow-[0_12px_36px_rgba(32,39,68,0.08)] overflow-hidden text-left mb-5">
          {/* Top Bar with Lock and Address */}
          <div className="flex items-center justify-between border-b border-[#F0EBE3] px-3.5 py-2.5 bg-[#FAF9F7]/90 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#69718A] font-medium">
              <Lock className="h-3 w-3 text-[#69718A]" />
              <span>nayaputri.foliowalaweh.com</span>
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase text-[#69718A]">
              CONTOH PORTOFOLIO
            </span>
          </div>

          {/* Browser Page Body */}
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Internal Profile Navbar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-sm font-black text-[#202744] tracking-tight">naya.</span>
              <div className="flex items-center space-x-2.5 text-[10px] font-medium text-[#69718A]">
                <span className="hover:text-[#202744] cursor-pointer">Karya</span>
                <span className="hover:text-[#202744] cursor-pointer">Tentang</span>
                <span className="hover:text-[#202744] cursor-pointer inline-flex items-center gap-0.5">
                  Kontak <ArrowUpRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>

            {/* Status & Headline */}
            <div>
              <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>TERBUKA UNTUK KOLABORASI</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#202744] leading-tight">
                Ide yang dekat,<br />
                desain yang melekat.
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#69718A] leading-relaxed mt-1">
                Naya Putri — Desainer grafis di Bandung.<br />
                Merangkai identitas untuk usaha dan cerita yang berarti.
              </p>
            </div>

            {/* 2 Project Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Project 1: Kopi Sela */}
              <div>
                <div className="rounded-lg overflow-hidden h-24 sm:h-28 bg-amber-50 border border-slate-100 relative group">
                  <img
                    src="/kopi_sela.jpg"
                    alt="Kopi Sela"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-1">
                  <h4 className="text-[11px] font-bold text-[#202744] leading-tight">Kopi Sela</h4>
                  <p className="text-[9px] text-[#69718A]">Identitas visual · 2026</p>
                </div>
              </div>

              {/* Project 2: Ruang Bertemu */}
              <div>
                <div className="rounded-lg overflow-hidden h-24 sm:h-28 bg-[#9B82F6] p-2.5 flex flex-col justify-between text-white relative shadow-inner">
                  <div className="flex items-center justify-between text-[7px] font-bold tracking-wider text-white/90">
                    <span>PAMERAN KOLEKTIF</span>
                    <span>2026</span>
                  </div>
                  <div className="text-base sm:text-lg font-black leading-tight text-white">
                    Ruang<br />Bertemu.
                  </div>
                </div>
                <div className="mt-1">
                  <h4 className="text-[11px] font-bold text-[#202744] leading-tight">Ruang Bertemu</h4>
                  <p className="text-[9px] text-[#69718A]">Desain editorial · 2026</p>
                </div>
              </div>
            </div>

            {/* Bottom strip inside browser */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
              <span className="font-bold text-[#202744]">Punya ide? Kita obrolin.</span>
              <span className="inline-flex items-center gap-0.5 font-bold text-[#3B6BF5] hover:underline cursor-pointer text-[10px]">
                Hubungi Naya <ArrowUpRight className="h-2.5 w-2.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Small bullet point under mockup */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#5A627A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3B6BF5] shrink-0" />
          <span>Bukan harus jadi siapa-siapa. Cukup jadi dirimu, dengan karya yang kamu banggakan.</span>
        </div>
      </div>

      {/* Yellow Highlight Card at Bottom */}
      <div className="mt-6 rounded-2xl bg-[#FED843] p-4 sm:p-5 text-left border border-[#FDE047]/60 shadow-3xs">
        <h4 className="font-black text-sm sm:text-base text-[#202744]">
          Satu tautan. Banyak kemungkinan.
        </h4>
        <p className="text-xs text-[#202744]/80 font-medium mt-0.5">
          Bawa ke CV, proposal, atau bio media sosialmu.
        </p>
      </div>
    </div>
  );
};
