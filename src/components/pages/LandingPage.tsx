/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProjectType } from '../../types';
import type { Project } from '../../types';
import {
  Briefcase, FolderGit2, Search, Calendar, Github, GraduationCap,
  Sparkles, Code2, Globe, Loader2, ArrowRight,
  Check, User as UserIcon, Building2, Terminal,
  Copy, CheckCheck, MessageSquare, ChevronRight,
  Palette, Zap
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useMyProjects } from '../../hooks/useProjects';
import { getSessionPayload } from '../../lib/auth';
import { FlowRibbonPattern, DotGridPattern, SparkleAccent } from '../atoms/BrandPatterns';
import { Badge } from '../atoms/Badge';

export const LandingPage: React.FC = () => {
  // Check login state
  const session = getSessionPayload();
  const isLoggedIn = !!session;

  // Fetch queries for logged-in user
  const { data: profile, isLoading: isProfileLoading } = useProfile({
    enabled: isLoggedIn,
  });

  const { data: experiences = [], isLoading: isExperiencesLoading } = useMyExperiences({
    enabled: isLoggedIn,
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useMyProjects({
    enabled: isLoggedIn,
  });

  const [projectType, setProjectType] = useState<'all' | ProjectType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Landing Interactive Showcase State
  const [heroTab, setHeroTab] = useState<'personal' | 'business' | 'developer'>('personal');
  const [codeTab, setCodeTab] = useState<'curl' | 'js' | 'python'>('js');
  const [copiedCode, setCopiedCode] = useState(false);

  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');

  const isLoading = isLoggedIn && (isProfileLoading || isExperiencesLoading || isProjectsLoading);

  // Filter public items for logged-in user showcase
  const publicExperiences = useMemo(() => {
    return experiences.filter((exp) => exp.isPublic);
  }, [experiences]);

  const publicProjects = useMemo(() => {
    return projects.filter((p) => p.isPublic);
  }, [projects]);

  const filteredExperiences = useMemo(() => {
    return publicExperiences.filter((exp) => {
      const matchSearch =
        !searchQuery ||
        exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [publicExperiences, searchQuery]);

  const filteredProjects = useMemo(() => {
    return publicProjects.filter((proj) => {
      const matchType = projectType === 'all' || proj.type === projectType;
      const matchSearch =
        !searchQuery ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        proj.techStacks.some((stack) => stack.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [publicProjects, projectType, searchQuery]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    js: `// Fetch your public portfolio data in Next.js, Astro, or React
const res = await fetch('https://api.foliowalaweh.com/api/v1/portfolio/azka');
const { profile, experiences, projects } = await res.json();

console.log(\`Loaded \${projects.length} projects for \${profile.fullName}\`);`,
    curl: `# Query directly via terminal or curl
curl -X GET "https://api.foliowalaweh.com/api/v1/portfolio/azka" \\
  -H "Accept: application/json"`,
    python: `# Python data client
import requests

res = requests.get("https://api.foliowalaweh.com/api/v1/portfolio/azka")
data = res.json()
print("Welcome", data["profile"]["fullName"])`,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC VISITOR VIEW (!isLoggedIn)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#202744] font-sans selection:bg-[#8B6CF6] selection:text-white relative overflow-hidden">
        {/* Subtle dot grid pattern */}
        <DotGridPattern dotColor="#8B6CF6" spacing={28} />

        {/* ─── 1. HERO SECTION ─── */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
          {/* Flowing Ribbon Background */}
          <FlowRibbonPattern position="top-right" intensity="subtle" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Friendly Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/90 px-4 py-1.5 shadow-xs backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="flex h-2 w-2 rounded-full bg-[#8B6CF6] animate-pulse" />
              <span className="font-sans text-xs font-bold text-[#202744]">
                Foliowalaweh Platform
              </span>
              <span className="text-[#8B6CF6]">•</span>
              <span className="font-sans text-xs font-semibold text-[#69718A]">
                Personal Portfolios, Business Profiles & Headless API
              </span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#202744] max-w-4xl mx-auto leading-[1.08] mb-6">
              Your work.{' '}
              <span className="relative inline-block text-[#8B6CF6]">
                Your story.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#FFC45B]"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C50 3 150 3 197 9"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              Your way.
            </h1>

            {/* Subtitle Value Proposition */}
            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl font-normal text-[#69718A] leading-relaxed mb-10">
              Build a portfolio that feels like you. Showcase your projects, share your professional story, grow your business, or power your own website with our headless portfolio API.
            </p>

            {/* High Impact Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#8B6CF6] hover:bg-[#7A56F4] px-8 py-3.5 font-sans text-sm sm:text-base font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#FFC45B]" />
                <span>Create your portfolio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#templates"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] px-7 py-3.5 font-sans text-sm sm:text-base font-semibold text-[#202744] transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Explore templates</span>
                <ChevronRight className="h-4 w-4 text-[#69718A]" />
              </a>
            </div>

            {/* 4 Brand Pillars (Pills Aligned with Official Visual Brand Guide) */}
            <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#EAE5DD] bg-white/80 backdrop-blur-sm p-3 shadow-3xs transition hover:border-[#8B6CF6]/40 hover:bg-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="font-sans text-xs font-bold text-[#202744]">Personal Portfolio</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#EAE5DD] bg-white/80 backdrop-blur-sm p-3 shadow-3xs transition hover:border-[#4697F5]/40 hover:bg-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7F2FF] text-[#4697F5]">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-sans text-xs font-bold text-[#202744]">Business Profile</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#EAE5DD] bg-white/80 backdrop-blur-sm p-3 shadow-3xs transition hover:border-[#8B6CF6]/40 hover:bg-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4EFFF] text-[#8B6CF6]">
                  <Terminal className="h-4 w-4" />
                </div>
                <span className="font-sans text-xs font-bold text-[#202744]">Developer API</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#EAE5DD] bg-white/80 backdrop-blur-sm p-3 shadow-3xs transition hover:border-[#FFC45B]/50 hover:bg-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF6E3] text-[#A66E00]">
                  <Sparkles className="h-4 w-4 text-[#FFC45B]" />
                </div>
                <span className="font-sans text-xs font-bold text-[#202744]">Theme Studio</span>
              </div>
            </div>

            {/* ─── INTERACTIVE SHOWCASE CONTAINER ─── */}
            <div className="mx-auto max-w-5xl rounded-3xl border border-[#EAE5DD] bg-white shadow-xl overflow-hidden text-left">
              {/* Tab Selector Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#EAE5DD] bg-[#FAF8F5] px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1.5 mr-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="hidden sm:inline font-sans text-xs font-semibold text-[#69718A]">
                    Interactive Live Demonstrator
                  </span>
                </div>

                {/* Mode Switcher Buttons */}
                <div className="flex rounded-xl bg-white p-1 border border-[#E5E1DA] shadow-3xs">
                  <button
                    onClick={() => setHeroTab('personal')}
                    className={`rounded-lg px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                      heroTab === 'personal'
                        ? 'bg-[#8B6CF6] text-white shadow-xs'
                        : 'text-[#69718A] hover:text-[#202744]'
                    }`}
                  >
                    Personal Portfolio
                  </button>
                  <button
                    onClick={() => setHeroTab('business')}
                    className={`rounded-lg px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                      heroTab === 'business'
                        ? 'bg-[#4697F5] text-white shadow-xs'
                        : 'text-[#69718A] hover:text-[#202744]'
                    }`}
                  >
                    Business Showcase
                  </button>
                  <button
                    onClick={() => setHeroTab('developer')}
                    className={`rounded-lg px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                      heroTab === 'developer'
                        ? 'bg-[#202744] text-white shadow-xs'
                        : 'text-[#69718A] hover:text-[#202744]'
                    }`}
                  >
                    Headless API
                  </button>
                </div>
              </div>

              {/* Showcase Body */}
              <div className="p-6 sm:p-8">
                {heroTab === 'personal' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE3] pb-6">
                      <div className="flex items-center gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                          alt="Alex Rivera"
                          className="h-16 w-16 rounded-2xl object-cover ring-4 ring-[#E8E0FF]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans text-xl font-bold text-[#202744]">Alex Rivera</h3>
                            <Badge variant="violet" dot>Available for hire</Badge>
                          </div>
                          <p className="font-sans text-xs font-semibold text-[#8B6CF6]">
                            Staff Frontend & Design Systems Architect
                          </p>
                          <p className="font-sans text-xs text-[#69718A]">San Francisco, CA • 8+ years exp</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/register"
                          className="rounded-full bg-[#8B6CF6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7A56F4] transition shadow-xs"
                        >
                          Customize This Theme
                        </Link>
                      </div>
                    </div>

                    {/* Featured Case Studies Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A]">
                          Featured Project Showcase
                        </span>
                        <span className="font-mono text-[10px] text-[#8B6CF6] font-semibold">Live Interactive Blueprint</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[#EAE5DD] p-4 bg-[#FAF8F5]/60 hover:bg-white hover:border-[#8B6CF6]/40 transition shadow-3xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#8B6CF6] uppercase">Open Source</span>
                            <span className="text-[10px] font-mono text-[#69718A]">★ 1.4k GitHub</span>
                          </div>
                          <h4 className="font-sans text-sm font-bold text-[#202744] mb-1">
                            Aura Design Engine & Component Tokens
                          </h4>
                          <p className="font-sans text-xs text-[#69718A] line-clamp-2 mb-3">
                            Production-grade web design tokens and accessible React primitives powering 40+ client applications.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <span className="rounded-md bg-white border border-[#E5E1DA] px-2 py-0.5 text-[10px] font-mono text-[#202744]">React 19</span>
                            <span className="rounded-md bg-white border border-[#E5E1DA] px-2 py-0.5 text-[10px] font-mono text-[#202744]">Tailwind v4</span>
                            <span className="rounded-md bg-white border border-[#E5E1DA] px-2 py-0.5 text-[10px] font-mono text-[#202744]">TypeScript</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#EAE5DD] p-4 bg-[#FAF8F5]/60 hover:bg-white hover:border-[#8B6CF6]/40 transition shadow-3xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#4697F5] uppercase">Commercial Client</span>
                            <span className="text-[10px] font-mono text-emerald-600 font-bold">100k+ MAU</span>
                          </div>
                          <h4 className="font-sans text-sm font-bold text-[#202744] mb-1">
                            Finflow — AI-Powered Capital Intelligence
                          </h4>
                          <p className="font-sans text-xs text-[#69718A] line-clamp-2 mb-3">
                            Real-time streaming ledger and analytical dashboard designed for venture portfolios and private equity.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <span className="rounded-md bg-white border border-[#E5E1DA] px-2 py-0.5 text-[10px] font-mono text-[#202744]">Next.js</span>
                            <span className="rounded-md bg-white border border-[#E5E1DA] px-2 py-0.5 text-[10px] font-mono text-[#202744]">Chart.js</span>
                            <span className="rounded-md bg-white border border-[#E5E1DA] px-2 py-0.5 text-[10px] font-mono text-[#202744]">WebSockets</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {heroTab === 'business' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE3] pb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#202744] text-white font-black text-xl shadow-sm">
                          DU
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans text-xl font-bold text-[#202744]">D-Untitled Studio</h3>
                            <Badge variant="blue" dot>Verified Agency</Badge>
                          </div>
                          <p className="font-sans text-xs font-semibold text-[#4697F5]">
                            Architecture & Digital Product Design Studio
                          </p>
                          <p className="font-sans text-xs text-[#69718A]">Jakarta & Singapore • 40+ Delivered Projects</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Direct WA Inquiries Active</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A]">
                          Commercial Service Packages
                        </span>
                        <span className="font-mono text-[10px] text-[#4697F5] font-semibold">Ready for Client Booking</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[#EAE5DD] p-4 bg-white shadow-3xs hover:border-[#4697F5] transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-sans text-sm font-bold text-[#202744]">Complete Brand Identity & Guidelines</h4>
                            <span className="font-mono text-xs font-bold text-[#4697F5]">Rp 15.000.000</span>
                          </div>
                          <p className="font-sans text-xs text-[#69718A] mb-3">
                            Full typography scale, color harmony tokens, stationery, social kit, and exportable vector master kit.
                          </p>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            ✓ 2 Weeks Delivery
                          </span>
                        </div>

                        <div className="rounded-2xl border border-[#EAE5DD] p-4 bg-white shadow-3xs hover:border-[#4697F5] transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-sans text-sm font-bold text-[#202744]">High-Converting Product Website</h4>
                            <span className="font-mono text-xs font-bold text-[#4697F5]">Rp 25.000.000</span>
                          </div>
                          <p className="font-sans text-xs text-[#69718A] mb-3">
                            Custom design system, interactive micro-animations, multi-page layout, and SEO-optimized deployment.
                          </p>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            ✓ Direct WhatsApp Integration
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {heroTab === 'developer' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4">
                      <div>
                        <h4 className="font-sans text-sm font-bold text-[#202744]">
                          Zero-Backend Headless Portfolio Engine
                        </h4>
                        <p className="font-sans text-xs text-[#69718A]">
                          Build your custom Astro, Next.js, or Vite frontend while Foliowalaweh handles database, auth & images.
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E5E1DA]">
                        <button
                          onClick={() => setCodeTab('js')}
                          className={`px-2.5 py-1 font-mono text-[11px] font-bold rounded-md transition ${
                            codeTab === 'js' ? 'bg-white text-[#8B6CF6] shadow-3xs' : 'text-[#69718A]'
                          }`}
                        >
                          TypeScript
                        </button>
                        <button
                          onClick={() => setCodeTab('curl')}
                          className={`px-2.5 py-1 font-mono text-[11px] font-bold rounded-md transition ${
                            codeTab === 'curl' ? 'bg-white text-[#8B6CF6] shadow-3xs' : 'text-[#69718A]'
                          }`}
                        >
                          cURL
                        </button>
                        <button
                          onClick={() => setCodeTab('python')}
                          className={`px-2.5 py-1 font-mono text-[11px] font-bold rounded-md transition ${
                            codeTab === 'python' ? 'bg-white text-[#8B6CF6] shadow-3xs' : 'text-[#69718A]'
                          }`}
                        >
                          Python
                        </button>
                      </div>
                    </div>

                    <div className="relative rounded-2xl bg-[#151928] p-4 text-white font-mono text-xs overflow-x-auto shadow-inner">
                      <button
                        onClick={() => handleCopyCode(codeSnippets[codeTab])}
                        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-sans font-bold text-white transition cursor-pointer"
                      >
                        {copiedCode ? <CheckCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy Snippet'}</span>
                      </button>
                      <pre className="text-slate-300 leading-relaxed">
                        <code>{codeSnippets[codeTab]}</code>
                      </pre>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-[#69718A] pt-1">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-[#FFC45B]" />
                        <span>Sub-40ms response latency on global Edge CDN</span>
                      </span>
                      <a href="#developer-api" className="font-bold text-[#8B6CF6] hover:underline flex items-center gap-1">
                        <span>Read complete API reference</span>
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. CORE FEATURES & ADVANTAGES ─── */}
        <section id="features" className="py-20 md:py-28 bg-white border-y border-[#EAE5DD] relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="violet" dot className="mb-3">Everything You Need</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] tracking-tight mb-4">
                Designed to make your work shine effortlessly
              </h2>
              <p className="text-base text-[#69718A] leading-relaxed">
                Whether you want an instant portfolio with dynamic templates, a commercial catalog for client services, or raw data via JSON API, Foliowalaweh does it all seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-[#EAE5DD] bg-[#FAF8F5]/50 p-8 hover:bg-white hover:border-[#8B6CF6]/40 transition-all hover:shadow-lg duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8E0FF] text-[#8B6CF6] mb-6">
                  <Palette className="h-6 w-6" />
                </div>
                <h3 className="font-sans text-lg font-bold text-[#202744] mb-2">
                  Creative Theme Studio
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#69718A] leading-relaxed mb-4">
                  Select hand-crafted templates, customize primary accents, adjust layout blocks via drag-and-drop, and preview in real-time across Desktop, Tablet, and Mobile.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#8B6CF6]">
                  <span>Zero coding required</span>
                  <SparkleAccent size={14} />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-[#EAE5DD] bg-[#FAF8F5]/50 p-8 hover:bg-white hover:border-[#4697F5]/40 transition-all hover:shadow-lg duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F2FF] text-[#4697F5] mb-6">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="font-sans text-lg font-bold text-[#202744] mb-2">
                  Commercial Business Hub
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#69718A] leading-relaxed mb-4">
                  Turn your portfolio into a revenue driver. Create structured service catalogs with clear pricing packages, client case studies, and instant WhatsApp inquiry routing.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#4697F5]">
                  <span>Direct client leads</span>
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-[#EAE5DD] bg-[#FAF8F5]/50 p-8 hover:bg-white hover:border-[#202744]/40 transition-all hover:shadow-lg duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EFFF] text-[#8B6CF6] mb-6">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="font-sans text-lg font-bold text-[#202744] mb-2">
                  Headless Developer API
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#69718A] leading-relaxed mb-4">
                  Developers love full creative freedom. Use Foliowalaweh as your free, managed portfolio CMS and query your work through our REST endpoints from any tech stack.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#202744]">
                  <span>Bring your own UI</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. SOLUTIONS FOR EVERY AUDIENCE ─── */}
        <section id="audiences" className="py-20 md:py-28 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="blue" dot className="mb-3">Built for Creators & Businesses</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] tracking-tight mb-4">
                One platform, tailored to your professional goals
              </h2>
              <p className="text-base text-[#69718A]">
                Choose how you want to present yourself to clients, recruiters, and the world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Audience 1 */}
              <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs flex flex-col justify-between hover:border-[#8B6CF6] transition">
                <div>
                  <div className="inline-flex rounded-xl bg-[#E8E0FF] px-3 py-1 font-sans text-xs font-bold text-[#5533CC] mb-4">
                    For Individual Professionals
                  </div>
                  <h3 className="text-xl font-bold text-[#202744] mb-3">
                    Engineers, Designers & Creators
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                    Stand out in competitive hiring. Group your achievements chronologically, showcase GitHub repositories and live app links, and control what is public with one click.
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#202744] mb-8 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E0FF] text-[#8B6CF6] text-[10px] font-bold">✓</span>
                      <span>Verified work experience milestones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E0FF] text-[#8B6CF6] text-[10px] font-bold">✓</span>
                      <span>Filterable project showcases with tech tags</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E0FF] text-[#8B6CF6] text-[10px] font-bold">✓</span>
                      <span>Instant public link: foliowalaweh.com/portfolio/:id</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#8B6CF6] hover:text-white py-2.5 text-xs font-bold text-[#202744] transition"
                >
                  <span>Build Personal Portfolio</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Audience 2 */}
              <div className="rounded-3xl border-2 border-[#8B6CF6] bg-white p-8 shadow-md relative flex flex-col justify-between">
                <span className="absolute -top-3.5 left-8 rounded-full bg-[#8B6CF6] text-white px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  Recommended for Businesses
                </span>
                <div>
                  <div className="inline-flex rounded-xl bg-[#E7F2FF] px-3 py-1 font-sans text-xs font-bold text-[#1E6FD6] mb-4">
                    For Studios & Agencies
                  </div>
                  <h3 className="text-xl font-bold text-[#202744] mb-3">
                    Agencies, Studios & Contractors
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                    Commercial portfolios that convert visitors into paying clients. Publish structured service pricing packages, upload company logos, and receive high-intent inquiries.
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#202744] mb-8 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#4697F5] text-[10px] font-bold">✓</span>
                      <span>Dedicated Commercial Business Profile</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#4697F5] text-[10px] font-bold">✓</span>
                      <span>Service package catalog with pricing tiers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2FF] text-[#4697F5] text-[10px] font-bold">✓</span>
                      <span>One-click WhatsApp inquiry flow</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] text-white py-2.5 text-xs font-bold transition shadow-xs"
                >
                  <span>Create Business Profile</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Audience 3 */}
              <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 shadow-xs flex flex-col justify-between hover:border-[#202744] transition">
                <div>
                  <div className="inline-flex rounded-xl bg-[#FAF8F5] border border-[#E5E1DA] px-3 py-1 font-sans text-xs font-bold text-[#202744] mb-4">
                    For Web Developers
                  </div>
                  <h3 className="text-xl font-bold text-[#202744] mb-3">
                    Headless Portfolio Architects
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6">
                    Why waste weeks setting up Postgres, Prisma, Auth, and S3 upload buckets just for a personal website? Foliowalaweh provides the backend so you can code the frontend you desire.
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#202744] mb-8 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[#202744] text-[10px] font-bold">✓</span>
                      <span>Clean REST JSON API endpoints</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[#202744] text-[10px] font-bold">✓</span>
                      <span>Integrated image hosting & CDN storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[#202744] text-[10px] font-bold">✓</span>
                      <span>Zero server management or maintenance</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="#developer-api"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] hover:bg-[#202744] hover:text-white py-2.5 text-xs font-bold text-[#202744] transition"
                >
                  <span>Explore Developer Docs</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. TEMPLATE GALLERY PREVIEW ─── */}
        <section id="templates" className="py-20 md:py-28 bg-white border-t border-[#EAE5DD]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <Badge variant="yellow" dot className="mb-2">Theme Studio Blueprints</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] tracking-tight">
                  Start with a template, make it uniquely yours
                </h2>
                <p className="text-sm text-[#69718A] mt-2 max-w-xl">
                  Each theme is crafted for readability, clean spacing, and modern typography. Customize fonts and accents with live device previews.
                </p>
              </div>

              {/* Template Category Filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'Minimal', 'Creative', 'Executive', 'Modern'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedTemplateCategory(cat.toLowerCase())}
                    className={`rounded-full px-4 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                      selectedTemplateCategory === cat.toLowerCase()
                        ? 'bg-[#8B6CF6] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-[#69718A] hover:text-[#202744] border border-[#E5E1DA]'
                    }`}
                  >
                    {cat === 'all' ? 'All Templates' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'minimal-aura',
                  name: 'Minimal Aura',
                  category: 'Minimal',
                  accent: '#8B6CF6',
                  desc: 'Clean typography, ample whitespace, and focused case study presentations for product thinkers.',
                  badge: 'Popular',
                },
                {
                  id: 'executive-bold',
                  name: 'Executive Studio',
                  category: 'Executive',
                  accent: '#4697F5',
                  desc: 'High-contrast editorial layout tailored for commercial agencies, consultants, and directors.',
                  badge: 'Agency Choice',
                },
                {
                  id: 'creative-canvas',
                  name: 'Creative Canvas',
                  category: 'Creative',
                  accent: '#FFC45B',
                  desc: 'Vibrant, expressive cards with generous visual framing for UI/UX designers and artists.',
                  badge: 'Expressive',
                },
                {
                  id: 'modern-bento',
                  name: 'Modern Bento Grid',
                  category: 'Modern',
                  accent: '#8B6CF6',
                  desc: 'Compact, high-density modular layout highlighting skills, current focus, and top repos.',
                  badge: 'Trending',
                },
                {
                  id: 'corp-trust',
                  name: 'Corporate Trust',
                  category: 'Executive',
                  accent: '#1E6FD6',
                  desc: 'Structured service tiers, client testimonials, and WhatsApp contact triggers.',
                  badge: 'Commercial',
                },
                {
                  id: 'mono-terminal',
                  name: 'Clean Monochrome',
                  category: 'Minimal',
                  accent: '#202744',
                  desc: 'Refined black & white minimalism with subtle slate touches and crisp sans-serif headings.',
                  badge: 'Classic',
                },
              ].map((template) => (
                <div
                  key={template.id}
                  className="group rounded-3xl border border-[#EAE5DD] bg-[#FAF8F5]/60 hover:bg-white p-5 transition-all duration-300 hover:shadow-lg hover:border-[#8B6CF6]/40 flex flex-col justify-between"
                >
                  <div>
                    {/* Simulated Template Preview Frame */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl bg-white border border-[#EAE5DD] p-3 overflow-hidden mb-4 shadow-3xs group-hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-2 mb-3">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#8B6CF6]">{template.category}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-2/3 rounded-md bg-slate-200/80" />
                        <div className="h-2.5 w-full rounded-md bg-slate-100" />
                        <div className="h-2.5 w-4/5 rounded-md bg-slate-100" />
                        <div className="pt-2 flex gap-1.5">
                          <div className="h-8 flex-1 rounded-lg border border-[#E5E1DA] bg-[#FAF8F5]" />
                          <div className="h-8 flex-1 rounded-lg border border-[#E5E1DA] bg-[#FAF8F5]" />
                        </div>
                      </div>
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-[#E8E0FF] text-[#5533CC] px-2 py-0.5 text-[9px] font-bold uppercase">
                        {template.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-sans text-base font-bold text-[#202744] group-hover:text-[#8B6CF6] transition-colors">
                        {template.name}
                      </h4>
                      <span
                        className="h-3 w-3 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: template.accent }}
                      />
                    </div>
                    <p className="font-sans text-xs text-[#69718A] leading-relaxed mb-4">
                      {template.desc}
                    </p>
                  </div>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E1DA] bg-white py-2 text-xs font-bold text-[#202744] hover:bg-[#8B6CF6] hover:text-white hover:border-[#8B6CF6] transition shadow-3xs"
                  >
                    <span>Use This Template</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. DEVELOPER API SECTION ─── */}
        <section id="developer-api" className="py-20 md:py-28 bg-[#202744] text-white relative overflow-hidden">
          {/* Subtle brand glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#8B6CF6]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#4697F5]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#8B6CF6]/20 border border-[#8B6CF6]/40 px-3.5 py-1 text-xs font-bold text-[#D5C6FF]">
                  <Code2 className="h-3.5 w-3.5 text-[#FFC45B]" />
                  <span>Strategic Advantage for Developers</span>
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Build your own frontend.{' '}
                  <span className="text-[#FFC45B]">Let Foliowalaweh handle your data.</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Want complete UI freedom? You don't have to build another database or admin panel. Use our authenticated dashboard to upload projects, experience milestones, and media — then query it via clean REST JSON endpoints.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                    <span className="font-mono text-xs font-bold text-[#FFC45B]">GET /portfolio/:userId</span>
                    <p className="text-xs text-slate-300 mt-1">
                      Fetches entire active layout, theme tokens, projects, and experiences in 1 query.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                    <span className="font-mono text-xs font-bold text-[#8B6CF6]">Zero Maintenance</span>
                    <p className="text-xs text-slate-300 mt-1">
                      Automatic CORS headers, CDN caching, and high-availability endpoints ready out of the box.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-[#8B6CF6] hover:bg-[#7A56F4] px-6 py-3 font-sans text-xs sm:text-sm font-bold text-white transition shadow-lg active:scale-95"
                  >
                    <span>Get Free API Access</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Developer Code Terminal */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl border border-white/15 bg-[#151928] shadow-2xl overflow-hidden text-left">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/30">
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-red-500/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <span className="h-3 w-3 rounded-full bg-green-500/80" />
                      <span className="font-mono text-xs text-slate-400 pl-2">portfolio-query.ts</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(codeSnippets.js)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-xs cursor-pointer"
                    >
                      {copiedCode ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
                    <pre>
                      <code>{codeSnippets.js}</code>
                    </pre>
                  </div>
                  <div className="border-t border-white/10 bg-black/20 px-5 py-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Response Payload: JSON</span>
                    <span className="text-emerald-400 font-bold">HTTP 200 OK • 32ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. HOW IT WORKS TIMELINE ─── */}
        <section id="how-it-works" className="py-20 md:py-28 bg-[#FAF8F5]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="violet" dot className="mb-3">Simple 3-Step Flow</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202744] tracking-tight mb-4">
              From zero to published in minutes
            </h2>
            <p className="text-base text-[#69718A] max-w-xl mx-auto mb-16">
              Spend less time wrestling with website builders and more time focusing on your actual work.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 relative shadow-3xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8E0FF] text-[#8B6CF6] font-bold text-sm mb-6">
                  1
                </span>
                <h3 className="text-lg font-bold text-[#202744] mb-2">Curate Your Work & Story</h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
                  Enter your career experience milestones, project case studies, and business services. Upload screenshots and project logos without compression loss.
                </p>
              </div>

              <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 relative shadow-3xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7F2FF] text-[#4697F5] font-bold text-sm mb-6">
                  2
                </span>
                <h3 className="text-lg font-bold text-[#202744] mb-2">Pick a Theme or Use the API</h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
                  Choose a high-converting layout in the Theme Studio, customize brand colors, or query the REST API directly into your custom web application.
                </p>
              </div>

              <div className="rounded-3xl border border-[#EAE5DD] bg-white p-8 relative shadow-3xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF6E3] text-[#A66E00] font-bold text-sm mb-6">
                  3
                </span>
                <h3 className="text-lg font-bold text-[#202744] mb-2">Share & Connect</h3>
                <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
                  Publish your public URL on resume links, LinkedIn, or send directly to prospective clients. Receive inquiries with zero friction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. FINAL CALL TO ACTION BANNER ─── */}
        <section className="py-20 bg-white border-t border-[#EAE5DD]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#8B6CF6] via-[#7A56F4] to-[#4697F5] p-10 sm:p-14 text-center text-white shadow-xl relative overflow-hidden">
              <FlowRibbonPattern position="full" intensity="vibrant" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <SparkleAccent size={14} color="#FFC45B" />
                  <span>Start Building Today</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Ready to show the world what you can do?
                </h2>

                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  Join professionals, creative studios, and software engineers who build their home on Foliowalaweh.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#202744] hover:bg-[#FAF8F5] px-8 py-3.5 text-sm font-bold transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    <span>Create your portfolio</span>
                    <ArrowRight className="h-4 w-4 text-[#8B6CF6]" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 px-7 py-3.5 text-sm font-semibold text-white transition cursor-pointer"
                  >
                    <span>Already have an account? Sign In</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGGED-IN CREATOR SHOWCASE PREVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#202744] font-sans selection:bg-[#8B6CF6] selection:text-white pb-24">
      {isLoading ? (
        <div className="flex h-96 flex-col items-center justify-center text-[#69718A]">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B6CF6] mb-2" />
          <p className="font-sans text-xs font-semibold">Loading your portfolio showcase...</p>
        </div>
      ) : (
        <div>
          {/* Top Banner Header */}
          <section className="border-b border-[#EAE5DD] bg-white py-10 shadow-3xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {profile ? (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-5">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.fullName}
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[#E8E0FF] shadow-sm"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E8E0FF] font-sans text-xl font-bold text-[#8B6CF6] shadow-sm">
                        {profile.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h1 className="font-sans text-2xl font-bold text-[#202744]">
                          {profile.fullName}
                        </h1>
                        <Badge variant="violet" dot>Creator Preview</Badge>
                      </div>
                      <p className="font-sans text-sm font-semibold text-[#8B6CF6] mb-1">
                        {profile.headline || 'Professional Creator & Engineer'}
                      </p>
                      {profile.bio && (
                        <p className="font-sans text-xs text-[#69718A] max-w-xl line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/admin/profile"
                      className="rounded-full border border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] px-4 py-2 text-xs font-bold text-[#202744] transition shadow-3xs"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to={`/portfolio/${session?.sub}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#8B6CF6] hover:bg-[#7A56F4] px-5 py-2 text-xs font-bold text-white transition shadow-sm"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>View Live Public Site</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5E1DA] bg-[#FAF8F5] p-6 text-center text-[#69718A]">
                  <p className="text-xs mb-2">No active creator profile configured yet.</p>
                  <Link to="/admin/profile" className="text-xs font-bold text-[#8B6CF6] hover:underline">
                    Complete your personal profile now →
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Filter Suite */}
          <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-[#EAE5DD] bg-white p-4 shadow-3xs">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                  <input
                    id="landing-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search milestones, projects, or technologies..."
                    className="w-full rounded-xl border border-[#E5E1DA] bg-[#FAF8F5] py-2.5 pr-4 pl-10 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden transition-all text-[#202744] placeholder:text-[#69718A]"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex rounded-xl border border-[#E5E1DA] bg-[#FAF8F5] p-1">
                  <button
                    onClick={() => setProjectType('all')}
                    className={`rounded-lg px-3 py-1.5 font-sans text-[11px] font-bold transition-all cursor-pointer ${
                      projectType === 'all'
                        ? 'bg-white text-[#202744] shadow-xs'
                        : 'text-[#69718A] hover:text-[#202744]'
                    }`}
                  >
                    All Projects
                  </button>
                  <button
                    onClick={() => setProjectType(ProjectType.WORK)}
                    className={`rounded-lg px-3 py-1.5 font-sans text-[11px] font-bold transition-all cursor-pointer ${
                      projectType === ProjectType.WORK
                        ? 'bg-white text-[#202744] shadow-xs'
                        : 'text-[#69718A] hover:text-[#202744]'
                    }`}
                  >
                    Work Assignments
                  </button>
                  <button
                    onClick={() => setProjectType(ProjectType.PERSONAL)}
                    className={`rounded-lg px-3 py-1.5 font-sans text-[11px] font-bold transition-all cursor-pointer ${
                      projectType === ProjectType.PERSONAL
                        ? 'bg-white text-[#202744] shadow-xs'
                        : 'text-[#69718A] hover:text-[#202744]'
                    }`}
                  >
                    Personal Works
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Dual Split Visualizer */}
          <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* LEFT COLUMN: Career Milestones */}
              <div className="lg:col-span-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A] flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-[#8B6CF6]" />
                    <span>Career Milestones</span>
                  </h2>
                  <Link to="/admin/experiences" className="text-[11px] font-bold text-[#8B6CF6] hover:underline">
                    Manage
                  </Link>
                </div>

                {filteredExperiences.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E5E1DA] bg-white p-8 text-center text-[#69718A]">
                    <GraduationCap className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="font-sans text-xs">No career milestones published on this profile.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-[#E8E0FF] pl-5 ml-2.5 space-y-5">
                    {filteredExperiences.map((exp) => (
                      <div key={exp.id} className="relative group/timeline">
                        <span className="absolute -left-[27px] top-1.5 flex h-3 w-3 rounded-full bg-white border-2 border-[#8B6CF6] group-hover/timeline:bg-[#8B6CF6] transition-colors" />

                        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 transition hover:border-[#8B6CF6]/50 shadow-3xs">
                          <div className="flex items-center space-x-3 mb-2.5">
                            {exp.companyLogo ? (
                              <img
                                src={exp.companyLogo}
                                alt={exp.company}
                                referrerPolicy="no-referrer"
                                className="h-9 w-9 rounded-xl object-cover bg-slate-50 border border-[#E5E1DA]"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] font-mono text-[10px] font-bold text-[#202744] border border-[#E5E1DA]">
                                {exp.company.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-sans text-sm font-bold text-[#202744] leading-tight">
                                {exp.position}
                              </h4>
                              <p className="font-sans text-xs text-[#69718A] font-medium">{exp.company}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold text-[#69718A] uppercase mb-2">
                            <Calendar className="h-3 w-3 text-[#8B6CF6]" />
                            <span>{exp.startDate}</span>
                            <span>—</span>
                            <span className={!exp.endDate ? 'text-emerald-600 font-semibold' : ''}>
                              {exp.endDate || 'Present'}
                            </span>
                          </div>

                          {exp.description && (
                            <p className="font-sans text-xs text-[#69718A] leading-relaxed whitespace-pre-wrap">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Projects Showroom */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A] flex items-center space-x-2">
                    <FolderGit2 className="h-4 w-4 text-[#8B6CF6]" />
                    <span>Project Showcases</span>
                  </h2>
                  <Link to="/admin/projects" className="text-[11px] font-bold text-[#8B6CF6] hover:underline">
                    Manage
                  </Link>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E5E1DA] bg-white p-12 text-center text-[#69718A]">
                    <Code2 className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                    <p className="font-sans text-xs">No public projects discoverable under your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {filteredProjects.map((proj) => {
                      const linkedExp = experiences.find((e) => e.id === proj.experienceId);

                      return (
                        <div
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white transition hover:-translate-y-1 hover:border-[#8B6CF6]/50 shadow-3xs hover:shadow-md"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-[#EAE5DD]">
                            {proj.thumbnail ? (
                              <img
                                src={proj.thumbnail}
                                alt={proj.title}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                <FolderGit2 className="h-8 w-8 stroke-1" />
                              </div>
                            )}
                            <span className="absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 font-sans text-[10px] font-bold tracking-wide uppercase border border-[#E5E1DA] text-[#202744] bg-white/95 shadow-xs backdrop-blur-md">
                              {proj.type === ProjectType.WORK ? 'Work' : 'Personal'}
                            </span>
                          </div>

                          <div className="flex flex-1 flex-col justify-between p-4.5">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#69718A] uppercase mb-1">
                                <span>Showcase</span>
                                {linkedExp && (
                                  <span className="text-[#8B6CF6] truncate max-w-[120px]" title={`At ${linkedExp.company}`}>
                                    @{linkedExp.company}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-sans text-sm font-bold text-[#202744] group-hover:text-[#8B6CF6] transition-colors leading-snug">
                                {proj.title}
                              </h3>

                              {proj.description && (
                                <p className="mt-1.5 line-clamp-2 font-sans text-xs text-[#69718A] leading-relaxed">
                                  {proj.description}
                                </p>
                              )}
                            </div>

                            {/* Tech Stacks */}
                            <div className="mt-4 border-t border-[#F0EBE3] pt-3">
                              <div className="flex flex-wrap gap-1">
                                {proj.techStacks.slice(0, 3).map((badge, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-md bg-[#FAF8F5] border border-[#E5E1DA] px-2 py-0.5 font-mono text-[9px] font-bold text-[#202744]"
                                  >
                                    {badge}
                                  </span>
                                ))}
                                {proj.techStacks.length > 3 && (
                                  <span className="rounded-md bg-[#FAF8F5] border border-[#E5E1DA] px-1.5 py-0.5 font-mono text-[9px] text-[#69718A]">
                                    +{proj.techStacks.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Modal for exploring a single project */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#EAE5DD] bg-white text-[#202744] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative aspect-video w-full bg-slate-100">
              {selectedProject.thumbnail ? (
                <img
                  src={selectedProject.thumbnail}
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <FolderGit2 className="h-12 w-12" />
                </div>
              )}
              <button
                id="close-modal-btn"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#202744] hover:bg-white active:scale-95 cursor-pointer text-lg font-bold border border-[#E5E1DA] shadow-xs"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 border-b border-[#F0EBE3] pb-3">
                <div className="flex items-center space-x-2">
                  <Badge variant={selectedProject.type === ProjectType.WORK ? 'blue' : 'violet'}>
                    {selectedProject.type === ProjectType.WORK ? 'Work Assignment' : 'Personal Project'}
                  </Badge>
                  {selectedProject.role && (
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#69718A]">
                      Role: {selectedProject.role}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {selectedProject.projectUrl && (
                    <a
                      href={selectedProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-[#8B6CF6] hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Live Site</span>
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-[#202744] hover:text-[#8B6CF6]"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Source Code</span>
                    </a>
                  )}
                </div>
              </div>

              <h3 className="font-sans text-xl font-bold text-[#202744] mb-2">
                {selectedProject.title}
              </h3>

              <p className="font-sans text-xs sm:text-sm text-[#69718A] leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedProject.description || 'No descriptive context provided.'}
              </p>

              <div>
                <h4 className="font-mono text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-2">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.techStacks.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-[#FAF8F5] border border-[#E5E1DA] px-2.5 py-1 font-mono text-[10px] font-bold text-[#202744]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#F0EBE3] bg-[#FAF8F5] px-6 py-4 flex items-center justify-between text-xs">
              <span className="font-sans text-[#69718A]">
                Published by <strong className="text-[#202744] font-bold">{profile?.fullName || 'Platform Creator'}</strong>
              </span>
              <button
                id="close-project-modal-bottom-btn"
                onClick={() => setSelectedProject(null)}
                className="rounded-full bg-[#202744] hover:bg-[#151928] px-4 py-1.5 font-sans text-xs font-bold text-white transition active:scale-95 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
