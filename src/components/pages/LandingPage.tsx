/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Globe,
  Palette,
  CheckCircle2,
  Copy,
  CheckCheck,
  ChevronRight,
  ChevronDown,
  Send,
  Store,
} from 'lucide-react';
import { getSessionPayload } from '../../lib/auth';
import { usePublishedTemplates } from '../../hooks/useTemplates';
import type { TemplateCategory } from '../../types/theme';

type LandingCategory = 'ALL' | TemplateCategory;

const CATEGORY_TABS: Array<{ id: LandingCategory; label: string }> = [
  { id: 'ALL', label: 'Semua' },
  { id: 'DEVELOPER', label: 'Engineering' },
  { id: 'DESIGNER', label: 'Desain' },
  { id: 'BUSINESS', label: 'Agensi & Bisnis' },
  { id: 'MINIMAL', label: 'Minimalis' },
];

interface TemplateItem {
  id: string;
  slug?: string;
  name: string;
  category: string;
  accent: string;
  desc: string;
  thumbnail?: string | null;
  isDarkMode?: boolean;
}

const FALLBACK_TEMPLATES: TemplateItem[] = [
  {
    id: 'studio-minimal',
    slug: 'studio-minimal',
    name: 'Studio Minimal',
    category: 'DESIGNER',
    accent: '#8B6CF6',
    desc: 'Clean, typography-first showcase tailored for modern product & brand designers.',
    isDarkMode: false,
  },
  {
    id: 'developer-mono',
    slug: 'developer-mono',
    name: 'Developer Monospace',
    category: 'DEVELOPER',
    accent: '#4697F5',
    desc: 'Technical, code-centric layout with GitHub activity and repo insights.',
    isDarkMode: true,
  },
  {
    id: 'craft-editorial',
    slug: 'craft-editorial',
    name: 'Craft & Editorial',
    category: 'DESIGNER',
    accent: '#FFC45B',
    desc: 'Magazine-style aesthetic with rich storytelling and generous whitespace.',
    isDarkMode: false,
  },
  {
    id: 'product-showcase',
    slug: 'product-showcase',
    name: 'Product Showcase',
    category: 'DESIGNER',
    accent: '#8B6CF6',
    desc: 'Feature-driven layout highlighting case studies, metrics, and outcomes.',
    isDarkMode: false,
  },
  {
    id: 'creative-collective',
    slug: 'creative-collective',
    name: 'Creative Collective',
    category: 'BUSINESS',
    accent: '#4697F5',
    desc: 'Multi-disciplinary studio template for teams, client rosters, and services.',
    isDarkMode: true,
  },
  {
    id: 'clean-executive',
    slug: 'clean-executive',
    name: 'Clean Executive',
    category: 'MINIMAL',
    accent: '#202744',
    desc: 'Distinguished, understated profile for advisors, leads, and founders.',
    isDarkMode: false,
  },
];

export const LandingPage: React.FC = () => {
  const session = getSessionPayload();
  const isLoggedIn = !!session;

  const [selectedCategory, setSelectedCategory] = useState<LandingCategory>('ALL');
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fetch published templates live from backend API
  const queryCategory = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const { data: publishedTemplates, isLoading: isLoadingTemplates } = usePublishedTemplates(queryCategory);

  // Map backend templates to display model, falling back to static templates if DB is empty or unseeded
  const displayTemplates = useMemo<TemplateItem[]>(() => {
    if (publishedTemplates && publishedTemplates.length > 0) {
      return publishedTemplates.map((tpl) => ({
        id: tpl.id,
        slug: tpl.slug,
        name: tpl.name,
        category: tpl.category,
        accent: tpl.layoutConfig?.theme?.primaryColor || '#3B6BF5',
        desc: tpl.description || 'Template modern siap pakai untuk portofolio dan profil bisnismu.',
        thumbnail: tpl.thumbnail,
        isDarkMode: !!tpl.layoutConfig?.theme?.darkMode,
      }));
    }

    // Fallback when backend data is unavailable or empty
    if (selectedCategory === 'ALL') return FALLBACK_TEMPLATES;
    return FALLBACK_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [publishedTemplates, selectedCategory]);

  const terminalCode = `// Fetch your public portfolio data in Next.js, Astro, or React
const res = await fetch('https://api.foliowalaweh.com/api/v1/portfolio/azka');
const { profile, experiences, projects } = await res.json();

console.log(\`Loaded \${projects.length} projects for \${profile.fullName}\`);`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(terminalCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202744] font-sans selection:bg-[#3B6BF5] selection:text-white relative overflow-hidden">
      {/* Ambient background glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-[#E8E0FF]/50 rounded-full blur-[120px]" />
        <div className="absolute top-[-50px] right-1/4 w-[450px] h-[450px] bg-[#E7F2FF]/50 rounded-full blur-[120px]" />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (Redesigned to match exact Indonesian showcase)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative pt-8 pb-12 md:pt-14 md:pb-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Eyebrow, Main Headline, Bio & CTAs */}
            <div className="lg:col-span-6 text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center rounded-md bg-[#FEF3C7] px-3 py-1 mb-6 shadow-3xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#92400E]">
                  DARI KARYA, JADI CERITA.
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] font-extrabold tracking-tight text-[#202744] leading-[1.08] mb-6">
                Karyamu bagus.<br />Biar dunia<br />lihat juga.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#5A627A] font-normal leading-relaxed mb-8 max-w-lg">
                Bikin portofolio dan profil bisnis yang terasa kamu banget. Pilih tema, isi karya, lalu bagikan—tanpa ribet ngurus website.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-6">
                <Link
                  id="hero-create-btn"
                  to={isLoggedIn ? '/admin/dashboard' : '/register'}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3B6BF5] hover:bg-[#2F56D2] px-7 py-3.5 text-sm sm:text-base font-semibold text-white transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                >
                  <span>Bikin portofoliomu</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  id="hero-see-themes-btn"
                  href="#pilihan-tema"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E2DCF0] bg-white hover:bg-[#FAF8F5] px-7 py-3.5 text-sm sm:text-base font-semibold text-[#202744] transition-all hover:border-slate-300 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <span>Lihat pilihan tema</span>
                </a>
              </div>

              {/* Checkmark Note */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#69718A]">
                <CheckCircle2 className="h-4 w-4 text-[#3B6BF5] shrink-0" />
                <span>Nggak harus bisa coding. Nggak harus mulai dari nol.</span>
              </div>
            </div>

            {/* Right Column: Hero Mockup with Lavender Card & Sticky Note */}
            <div className="lg:col-span-6">
              <div className="relative max-w-lg mx-auto lg:max-w-none">
                {/* Organic purple petal / blob accent behind the card */}
                <div className="absolute -bottom-4 -right-4 w-44 h-44 sm:w-52 sm:h-52 bg-[#9B80F6] rounded-[48px] rotate-12 -z-10 opacity-90 pointer-events-none" />

                {/* Lavender card container */}
                <div className="rounded-[32px] sm:rounded-[36px] bg-[#EBE7FF] p-5 sm:p-7 relative shadow-[0_20px_50px_rgba(32,39,68,0.06)]">
                  
                  {/* Browser Mockup Window */}
                  <div className="rounded-2xl bg-white border border-white/80 shadow-[0_12px_36px_rgba(32,39,68,0.08)] overflow-hidden text-left">
                    {/* Browser top bar */}
                    <div className="flex items-center justify-between border-b border-[#F0EBE3] px-4 py-2.5 bg-[#FAF9F7]/90">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#CBD5E1]" />
                        <span className="h-2 w-2 rounded-full bg-[#FBBF24]" />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-[#69718A]">
                        <span>nayaputri.foliowalaweh.com</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </div>

                    {/* Browser Interior / Portfolio Content */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Internal Navbar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-base font-black text-[#202744] tracking-tight">naya.</span>
                        <div className="flex items-center space-x-3 text-[11px] font-medium text-[#69718A]">
                          <span className="hover:text-[#202744] cursor-pointer">Karya</span>
                          <span className="hover:text-[#202744] cursor-pointer">Tentang</span>
                          <span className="hover:text-[#202744] cursor-pointer inline-flex items-center gap-0.5">
                            Kontak <ArrowUpRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>

                      {/* Status & Headline */}
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>TERBUKA UNTUK KOLABORASI</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#202744] leading-tight">
                          Ide yang dekat,<br />
                          desain yang melekat.
                        </h2>
                        <p className="text-[11px] sm:text-xs text-[#69718A] leading-relaxed mt-1">
                          Naya Putri — Desainer grafis di Bandung.<br />
                          Merangkai identitas untuk usaha dan cerita yang berarti.
                        </p>
                      </div>

                      {/* 2 Project Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* Project 1: Kopi Sela */}
                        <div>
                          <div className="rounded-lg overflow-hidden h-28 sm:h-32 bg-amber-50 border border-slate-100 relative group">
                            <img
                              src="/kopi_sela.jpg"
                              alt="Kopi Sela - Desain Kemasan Kopi"
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="mt-1.5">
                            <h3 className="text-xs font-bold text-[#202744] leading-tight">Kopi Sela</h3>
                            <p className="text-[10px] text-[#69718A]">Identitas visual · 2026</p>
                          </div>
                        </div>

                        {/* Project 2: Ruang Bertemu */}
                        <div>
                          <div className="rounded-lg overflow-hidden h-28 sm:h-32 bg-[#9B82F6] p-3 flex flex-col justify-between text-white relative shadow-inner">
                            <div className="flex items-center justify-between text-[8px] font-bold tracking-wider text-white/90">
                              <span>PAMERAN KOLEKTIF</span>
                              <span>2026</span>
                            </div>
                            <div className="text-lg sm:text-xl font-black leading-tight text-white">
                              Ruang<br />Bertemu.
                            </div>
                          </div>
                          <div className="mt-1.5">
                            <h3 className="text-xs font-bold text-[#202744] leading-tight">Ruang Bertemu</h3>
                            <p className="text-[10px] text-[#69718A]">Desain editorial · 2026</p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom strip inside browser */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className="font-bold text-[#202744]">Punya ide? Kita obrolin.</span>
                        <span className="inline-flex items-center gap-0.5 font-bold text-[#3B6BF5] hover:underline cursor-pointer text-[11px]">
                          Hubungi Naya <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Yellow Sticky Note Overlay */}
                  <div className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 bg-[#FED843] text-[#202744] p-4 sm:p-5 rounded-2xl shadow-[0_12px_28px_rgba(250,204,21,0.38)] rotate-[-4deg] border border-[#FDE047]/60 max-w-[185px] sm:max-w-[205px]">
                    <p className="font-black text-sm sm:text-base leading-tight tracking-tight">
                      Ini karya gue,<br />
                      ini cerita gue.
                    </p>
                  </div>

                  {/* Under Mockup Caption */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#4B3EC4]">
                    <Send className="h-3.5 w-3.5" />
                    <span>Contoh portofolio · Tema Kanvas</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM HIGHLIGHT STRIP (3 Columns: Satu tautan, Rapi tanpa kehilangan...)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="bg-[#FEF7EE] border-y border-[#F3E8D7] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
          {/* Feature 1 */}
          <div className="flex items-start gap-3.5">
            <Store className="h-6 w-6 stroke-[1.8] text-[#202744] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#202744] text-base leading-snug">
                Satu tautan, utuh ceritamu.
              </h3>
              <p className="text-xs sm:text-sm text-[#69718A] mt-0.5 leading-relaxed">
                Profil, proyek, dan kontak dalam satu tempat.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3.5">
            <Palette className="h-6 w-6 stroke-[1.8] text-[#202744] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#202744] text-base leading-snug">
                Rapi tanpa kehilangan karakter.
              </h3>
              <p className="text-xs sm:text-sm text-[#69718A] mt-0.5 leading-relaxed">
                Tema yang bisa kamu sesuaikan sendiri.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3.5">
            <Send className="h-6 w-6 stroke-[1.8] text-[#202744] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#202744] text-base leading-snug">
                Siap dibagikan ke mana saja.
              </h3>
              <p className="text-xs sm:text-sm text-[#69718A] mt-0.5 leading-relaxed">
                Untuk calon klien, rekruter, atau kolaborator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. KENAPA FOLIOWALAWEH SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="kenapa-foliowalaweh" className="py-20 bg-white border-y border-[#EAE5DD]">
        <div id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3B6BF5] block mb-2">
              KENAPA FOLIOWALAWEH?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] mb-4">
              Dirancang agar setiap karyamu bersinar dengan mudah
            </h2>
            <p className="text-sm sm:text-base text-[#69718A] leading-relaxed">
              Mulai dari Theme Studio kustom, domain pribadi, hingga API developer—semua yang kamu butuhkan untuk memamerkan portofolio dengan caramu sendiri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/40 p-8 hover:bg-white hover:border-[#3B6BF5]/40 hover:shadow-sm transition duration-200 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8E0FF] text-[#8B6CF6] mb-6">
                  <Palette className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#202744] mb-2.5">
                  Theme Studio Kustom
                </h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                  Sesuaikan tipografi, palet warna aksen, radius sudut, dan tata letak portofolio secara visual dengan pratinjau langsung.
                </p>
              </div>
              <Link
                to="/admin/theme-studio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B6BF5] hover:text-[#2F56D2] transition"
              >
                <span>Jelajahi Theme Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/40 p-8 hover:bg-white hover:border-[#4697F5]/40 hover:shadow-sm transition duration-200 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F2FF] text-[#4697F5] mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#202744] mb-2.5">
                  Domain & Subdomain Pribadi
                </h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                  Hubungkan domain kustom pribadimu (.com, .id) atau klaim tautan unik namamu.foliowalaweh.com dalam satu klik.
                </p>
              </div>
              <a
                href="#untuk-siapa"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4697F5] hover:text-[#327edb] transition"
              >
                <span>Pelajari pilihan domain</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/40 p-8 hover:bg-white hover:border-[#3B6BF5]/40 hover:shadow-sm transition duration-200 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8E0FF] text-[#8B6CF6] mb-6">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#202744] mb-2.5">
                  Developer API Fleksibel
                </h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                  Tarik data portofolio melalui REST API publik headless untuk website frontend kustom buatanmu sendiri di Next.js atau Astro.
                </p>
              </div>
              <a
                href="#developer-api"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B6BF5] hover:text-[#2F56D2] transition"
              >
                <span>Lihat dokumentasi API</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. AUDIENCE / PERSONAS SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="untuk-siapa" className="py-20 md:py-28">
        <div id="audiences" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3B6BF5] block mb-2">
              UNTUK SIAPA SAJA?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] mb-4">
              Satu platform, disesuaikan untuk tujuan profesionalmu
            </h2>
            <p className="text-sm sm:text-base text-[#69718A] leading-relaxed">
              Baik untuk desainer visual, freelancer, agensi kreatif, hingga developer software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Persona 1: Designers */}
            <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs flex flex-col justify-between hover:border-[#3B6BF5]/50 transition">
              <div>
                <span className="inline-block rounded-full bg-[#E8E0FF] px-3 py-1 text-xs font-bold text-[#5533CC] mb-5">
                  Desain Produk & Brand
                </span>
                <h3 className="text-xl font-bold text-[#202744] mb-3">
                  Desainer & Kreator
                </h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                  Tampilkan studi kasus visual yang memukau dengan galeri gambar resolusi tinggi, tautan prototipe interaktif, dan tipografi elegan.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-[#202744] mb-8 font-medium">
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E0FF] text-[#5533CC] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Tampilan mockup perangkat interaktif</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E0FF] text-[#5533CC] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Galeri media kaya & tautan prototipe</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E0FF] text-[#5533CC] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Pilihan warna aksen dan tipografi khas</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAE5DD] hover:bg-[#FAF8F5] py-2.5 text-xs font-bold text-[#202744] transition"
              >
                <span>Bikin portofolio desainer</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#69718A]" />
              </Link>
            </div>

            {/* Persona 2: Agencies (Highlighted) */}
            <div className="rounded-3xl border-2 border-[#3B6BF5] bg-white p-8 shadow-[0_8px_30px_rgba(59,107,245,0.12)] relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#3B6BF5] text-white px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Agensi & Studio
              </span>
              <div>
                <span className="inline-block rounded-full bg-[#E7F2FF] px-3 py-1 text-xs font-bold text-[#3B6BF5] mb-5 mt-1">
                  Agensi & Studio Kreatif
                </span>
                <h3 className="text-xl font-bold text-[#202744] mb-3">
                  Agensi, Studio & Kontraktor
                </h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                  Pamerkan portofolio tim, daftar klien ternama, paket layanan jasa komersial, dan tombol penawaran proyek dalam satu ruang bisnis.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-[#202744] mb-8 font-medium">
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#3B6BF5] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Dual profil: Personal & Bisnis komersial</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#3B6BF5] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Katalog paket jasa & studi kasus klien</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#3B6BF5] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Domain kustom & branding profesional</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B6BF5] hover:bg-[#2F56D2] text-white py-2.5 text-xs font-bold transition shadow-xs"
              >
                <span>Mulai workspace agensi</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Persona 3: Developers */}
            <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs flex flex-col justify-between hover:border-[#4697F5]/50 transition">
              <div>
                <span className="inline-block rounded-full bg-[#E7F2FF] px-3 py-1 text-xs font-bold text-[#4697F5] mb-5">
                  Software & Rekayasa Web
                </span>
                <h3 className="text-xl font-bold text-[#202744] mb-3">
                  Developer & Engineer
                </h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                  Sorot repositori GitHub, tech stack bahasa pemrograman, arsitektur sistem, dan kemudahan integrasi Headless API.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-[#202744] mb-8 font-medium">
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#4697F5] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Kartu repositori GitHub otomatis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#4697F5] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Endpoint REST API siap pakai</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#4697F5] text-[11px] font-bold">
                      ✓
                    </span>
                    <span>Dukungan dokumentasi Markdown</span>
                  </li>
                </ul>
              </div>
              <a
                href="#developer-api"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAE5DD] hover:bg-[#FAF8F5] py-2.5 text-xs font-bold text-[#202744] transition"
              >
                <span>Jelajahi fitur developer</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#69718A]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. TEMPLATE GALLERY SECTION (PILIHAN TEMA)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="pilihan-tema" className="py-20 bg-white border-t border-[#EAE5DD]">
        <div id="templates" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A66E00] block mb-2">
                PILIHAN TEMA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] mb-2">
                Mulai dari tema pilihan, buat jadi milikmu seutuhnya
              </h2>
              <p className="text-sm text-[#69718A] max-w-xl">
                Pilih dari koleksi tema siap pakai yang dirancang khusus untuk berbagai karakter dan industri kreatif.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#3B6BF5] text-white shadow-xs'
                      : 'border border-[#EAE5DD] bg-white text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid or Loading / Empty */}
          {isLoadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/40 p-5 animate-pulse flex flex-col justify-between h-[360px]"
                >
                  <div>
                    <div className="rounded-xl border border-[#EAE5DD] bg-white p-3.5 mb-4 h-44 flex flex-col justify-between">
                      <div className="h-3 w-1/3 bg-slate-200 rounded" />
                      <div className="space-y-2">
                        <div className="h-3 w-1/2 bg-slate-200 rounded" />
                        <div className="h-2 w-3/4 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-100 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="h-9 w-full bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : displayTemplates.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-[#EAE5DD] bg-[#FAF8F5]/50 p-8">
              <p className="text-sm font-semibold text-[#69718A] mb-3">
                Belum ada tema yang dipublikasikan untuk kategori ini.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B6BF5] hover:underline cursor-pointer"
              >
                <span>Tampilkan semua tema</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTemplates.map((template) => {
                const targetUrl = isLoggedIn
                  ? template.category === 'BUSINESS'
                    ? `/admin/business/theme-studio?template=${template.slug || template.id}`
                    : `/admin/theme-studio?template=${template.slug || template.id}`
                  : `/register?template=${template.slug || template.id}`;

                return (
                  <div
                    key={template.id}
                    className="group rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/40 p-5 hover:bg-white hover:border-[#3B6BF5]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail or Miniature Mockup */}
                      {template.thumbnail ? (
                        <div className="rounded-xl border border-[#EAE5DD] overflow-hidden bg-white mb-4 aspect-video relative group-hover:border-[#3B6BF5]/40 transition">
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div
                          className={`rounded-xl border p-3.5 shadow-3xs mb-4 transition ${
                            template.isDarkMode
                              ? 'bg-[#181E35] border-[#2A3454] text-white'
                              : 'bg-white border-[#EAE5DD] text-[#202744]'
                          }`}
                        >
                          {/* Traffic dots and mini header */}
                          <div
                            className={`flex items-center justify-between border-b pb-2 mb-3 ${
                              template.isDarkMode ? 'border-[#2A3454]' : 'border-[#F5F2EB]'
                            }`}
                          >
                            <div className="flex space-x-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            </div>
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider"
                              style={{ color: template.accent || '#3B6BF5' }}
                            >
                              {template.category}
                            </span>
                          </div>

                          {/* Wireframe skeleton blocks */}
                          <div className="space-y-2">
                            <div
                              className={`h-3 w-1/3 rounded-sm ${
                                template.isDarkMode ? 'bg-slate-700' : 'bg-slate-200/80'
                              }`}
                            />
                            <div
                              className={`h-2 w-2/3 rounded-sm ${
                                template.isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                              }`}
                            />
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <div
                                className={`h-14 rounded-md border p-2 flex flex-col justify-end ${
                                  template.isDarkMode
                                    ? 'border-[#2A3454] bg-[#111626]'
                                    : 'border-[#EAE5DD] bg-[#FAF8F5]'
                                }`}
                              >
                                <div
                                  className={`h-1.5 w-1/2 rounded-xs ${
                                    template.isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                                  }`}
                                />
                              </div>
                              <div
                                className={`h-14 rounded-md border p-2 flex flex-col justify-end ${
                                  template.isDarkMode
                                    ? 'border-[#2A3454] bg-[#111626]'
                                    : 'border-[#EAE5DD] bg-[#FAF8F5]'
                                }`}
                              >
                                <div
                                  className={`h-1.5 w-1/2 rounded-xs ${
                                    template.isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Template Meta */}
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-sm font-bold text-[#202744] group-hover:text-[#3B6BF5] transition-colors">
                          {template.name}
                        </h3>
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: template.accent }}
                          title={`Warna Aksen: ${template.accent}`}
                        />
                      </div>
                      <p className="text-xs text-[#69718A] leading-relaxed mb-5 line-clamp-2">
                        {template.desc}
                      </p>
                    </div>

                    <Link
                      to={targetUrl}
                      onClick={() => {
                        if (template.slug || template.id) {
                          sessionStorage.setItem('selected_template_slug', template.slug || template.id);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#EAE5DD] bg-white hover:bg-[#3B6BF5] hover:text-white hover:border-[#3B6BF5] py-2 text-xs font-semibold text-[#202744] transition shadow-3xs cursor-pointer"
                    >
                      <span>{isLoggedIn ? 'Buka di Studio' : 'Pakai tema ini'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. DEVELOPER & HEADLESS SHOWCASE SECTION (DARK NAVY)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="developer-api" className="py-20 md:py-28 bg-[#182035] text-white relative overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-[#8B6CF6]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#4697F5]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8B6CF6]/20 border border-[#8B6CF6]/40 px-3.5 py-1 text-xs font-bold text-[#D5C6FF]">
                <Code2 className="h-3.5 w-3.5 text-[#FFC45B]" />
                <span>HEADLESS PORTFOLIO ENGINE</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Bangun frontend sesukamu.{' '}
                <span className="text-[#FFC45B]">Biar Foliowalaweh yang simpan datanya.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Kami menyediakan RESTful API andal yang langsung mengirimkan data portofoliomu—proyek, riwayat karier, sertifikasi, hingga tautan sosial—langsung ke aplikasi Next.js, Astro, atau React buatanmu.
              </p>

              {/* 2 Stat Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-xs">
                  <span className="text-sm font-bold text-[#FFC45B] block mb-1">99.9% Uptime</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Endpoint edge cepat dengan sistem caching terdistribusi.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-xs">
                  <span className="text-sm font-bold text-[#8B6CF6] block mb-1">Tanpa Setup Database</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tinggal panggil endpoint publik JSON, langsung siap pakai.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#3B6BF5] hover:bg-[#2F56D2] px-6 py-3 text-xs sm:text-sm font-bold text-white transition shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Coba Developer API</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Terminal Window */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-white/15 bg-[#0F1424] shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#161B2E] px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                    <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
                    <span className="ml-3 text-[11px] text-slate-400 font-sans">
                      portfolio-fetch.ts
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-300 transition cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCheck className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Salin kode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code Body */}
                <div className="p-5 sm:p-6 overflow-x-auto text-slate-300 leading-relaxed">
                  <div className="text-slate-500">// Ambil data portofolio publik di Next.js, Astro, atau React</div>
                  <div className="mt-2">
                    <span className="text-[#8B6CF6]">const</span> res = <span className="text-[#8B6CF6]">await</span> <span className="text-[#4697F5]">fetch</span>(
                    <span className="text-emerald-400">'https://api.foliowalaweh.com/api/v1/portfolio/naya'</span>
                    );
                  </div>
                  <div>
                    <span className="text-[#8B6CF6]">const</span> &#123; profile, experiences, projects &#125; = <span className="text-[#8B6CF6]">await</span> res.<span className="text-[#4697F5]">json</span>();
                  </div>
                  <div className="mt-4">
                    console.<span className="text-[#4697F5]">log</span>(
                    <span className="text-[#FFC45B]">&#96;Berhasil memuat $&#123;projects.length&#125; proyek untuk $&#123;profile.fullName&#125;&#96;</span>
                    );
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. PROCESS STEPS SECTION ("Dari nol sampai tayang")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="cara-kerja" className="py-20 md:py-28">
        <div id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3B6BF5] block mb-2">
              CARA KERJA
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] mb-4">
              Dari nol sampai tayang dalam hitungan menit
            </h2>
            <p className="text-sm sm:text-base text-[#69718A] leading-relaxed">
              Tanpa konfigurasi rumit. Cukup alat intuitif yang membantumu mempublikasikan karya dengan percaya diri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs hover:border-[#3B6BF5]/40 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8E0FF] text-[#5533CC] font-bold text-sm mb-6">
                1
              </span>
              <h3 className="text-lg font-bold text-[#202744] mb-2">
                Isi Profil & Unggah Karya
              </h3>
              <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
                Tulis bio, pengalaman kerja, proyek unggulan, dan keahlianmu dengan formulir yang rapi dan mudah.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs hover:border-[#4697F5]/40 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7F2FF] text-[#4697F5] font-bold text-sm mb-6">
                2
              </span>
              <h3 className="text-lg font-bold text-[#202744] mb-2">
                Pilih Tema atau Pakai API
              </h3>
              <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
                Sesuaikan tampilan visual melalui Theme Studio atau ambil data JSON mentah untuk website kustommu.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs hover:border-[#FFC45B]/60 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF6E3] text-[#A66E00] font-bold text-sm mb-6">
                3
              </span>
              <h3 className="text-lg font-bold text-[#202744] mb-2">
                Bagikan & Jalin Relasi
              </h3>
              <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
                Tayang dalam satu klik dengan domain kustom atau bagikan tautan portofoliomu ke rekruter dan klien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. TANYA JAWAB (FAQ SECTION)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="tanya-jawab" className="py-20 bg-white border-t border-[#EAE5DD]">
        <div id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3B6BF5] block mb-2">
              TANYA JAWAB
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] mb-4">
              Pertanyaan yang Sering Ditanyakan
            </h2>
            <p className="text-sm sm:text-base text-[#69718A] leading-relaxed">
              Semua hal yang perlu kamu ketahui tentang membuat portofolio di Foliowalaweh.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Apakah Foliowalaweh gratis?',
                a: 'Ya! Kamu bisa mulai mendaftar, memilih tema, mengunggah portofolio karya, dan membagikan tautan portofoliomu secara gratis tanpa biaya dan tanpa perlu kartu kredit.'
              },
              {
                q: 'Apakah saya harus bisa coding untuk bikin portofolio?',
                a: 'Sama sekali tidak! Foliowalaweh dibuat dengan konsep no-code. Semua tata letak sudah siap pakai, rapi, dan otomatis responsif di HP maupun laptop. Cukup pilih tema dan masukkan ceritamu.'
              },
              {
                q: 'Bisa pakai nama domain sendiri (misal: namasaya.com)?',
                a: 'Bisa banget! Selain kamu mendapatkan subdomain gratis seperti namamu.foliowalaweh.com, kamu juga bisa menghubungkan domain pribadi (.com, .id, .design, dll) langsung ke profilmu.'
              },
              {
                q: 'Apa bedanya profil personal dan profil bisnis/agensi?',
                a: 'Profil personal dirancang khusus untuk portofolio individu, riwayat kerja, dan pameran proyek kreatif. Sedangkan profil bisnis dirancang untuk agensi, studio, atau freelancer yang memiliki katalog daftar layanan jasa, portofolio tim, dan formulir penawaran proyek.'
              },
              {
                q: 'Saya seorang programmer, bisakah saya pakai data dari Foliowalaweh untuk web saya sendiri?',
                a: 'Tentu saja! Kami menyediakan Headless Developer API (REST) publik. Kamu bisa mengambil data profil, riwayat kerja, dan proyek secara instan untuk dirender di Next.js, Astro, atau framework buatanmu sendiri.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/50 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer hover:bg-white transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#202744] pr-4">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#EAE5DD] transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#3B6BF5] text-white border-[#3B6BF5]' : 'text-[#69718A]'}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#69718A] leading-relaxed border-t border-[#F0EBE3] bg-white pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. BOTTOM BIG CTA BANNER CARD (Indonesian)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#3B6BF5] via-[#4F46E5] to-[#7B59F5] p-10 sm:p-14 text-center text-white shadow-xl relative overflow-hidden">
            {/* Subtle background glow rings */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#FFC45B]/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                <span>✦</span>
                <span>MULAI SEKARANG JUGA</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Siap pamerkan karyamu ke seluruh dunia?
              </h2>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                Gabung bersama ribuan kreator, desainer, dan developer Indonesia yang sudah mempercayakan portofolionya di Foliowalaweh.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to={isLoggedIn ? '/admin/dashboard' : '/register'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#202744] hover:bg-[#FAF8F5] px-8 py-3.5 text-sm font-bold transition shadow-lg active:scale-95 cursor-pointer"
                >
                  <span>{isLoggedIn ? 'Buka Dashboard Kamu' : 'Mulai Bikin Portofolio Gratis'}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to={isLoggedIn ? '/admin/business/dashboard' : '/register'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-sm font-semibold text-white transition active:scale-95 cursor-pointer"
                >
                  <span>Coba Workspace Agensi</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
