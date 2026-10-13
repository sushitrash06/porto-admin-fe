/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessServices } from '../../hooks/useBusinessServices';
import { useBusinessProjects } from '../../hooks/useBusinessProjects';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useMyProjects } from '../../hooks/useProjects';
import {
  Briefcase, FolderGit2, ArrowRight, Loader2,
  Eye, MessageSquare, Plus, Palette
} from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Load queries
  const { isLoading: isProfileLoading } = useBusinessProfile();
  const { data: services = [], isLoading: isServicesLoading } = useBusinessServices();
  const { data: businessProjects = [], isLoading: isProjectsLoading } = useBusinessProjects();
  const { data: experiences = [] } = useMyExperiences({ enabled: true });
  const { data: myProjects = [] } = useMyProjects({ enabled: true });

  const isDataLoading = isProfileLoading || isServicesLoading || isProjectsLoading;

  // Inquiries mock data aligned with Screenshot 5
  const inquiries = [
    {
      id: '1',
      client: 'PT Nusantara Cipta Karya',
      time: 'Hari ini, 09:30',
      isNew: true,
      message: 'Kami ingin mendigitalkan katalog 60+ produk furniture kami ke platform modern yang bisa langsung direct WA.',
      package: 'Interactive Digital Catalog & Show...',
      budget: 'Rp 10.000.000 - Rp 15.000.000',
      phone: '6281234567890',
    },
    {
      id: '2',
      client: 'Reza Fahlevi (Founder Finflow)',
      time: 'Kemarin, 16:45',
      isNew: false,
      message: 'Perlu bantuan pembangunan dashboard MVP financial planner kami, deadline bulan depan untuk demo investor.',
      package: 'MVP Fast-Track Web Application',
      budget: 'Rp 20.000.000+',
      phone: '6289876543210',
    },
    {
      id: '3',
      client: 'Studio Dua Arah',
      time: '3 hari yang lalu',
      isNew: false,
      message: 'Mau kolaborasi untuk overhaul website client agensi kami.',
      package: 'UI/UX Design Sprint & Design Sy...',
      budget: 'Rp 8.000.000',
      phone: '6281122334455',
    },
  ];

  const handleOpenWhatsApp = (phone: string, client: string) => {
    const text = encodeURIComponent(`Halo ${client}, terima kasih telah menghubungi kami via Foliowalaweh portfolio.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mb-3" />
        <p className="font-sans text-xs">Loading workspace dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Portfolio & Catalog Views',
      value: '14,820',
      icon: Eye,
      changeBadge: '+18.4%',
      subtitle: 'Unique visitors past 30 days',
    },
    {
      label: 'Showcase Projects',
      value: (businessProjects.length || myProjects.length || 4).toString(),
      icon: FolderGit2,
      subtitle: 'Featured case studies & code repos',
      subBadge: '8 draft',
    },
    {
      label: 'Career Milestones',
      value: (experiences.length || 4).toString(),
      icon: Briefcase,
      subtitle: '4+ years proven track record',
      statusTag: 'Active Now',
    },
    {
      label: 'Client Inquiries',
      value: '3',
      icon: MessageSquare,
      subtitle: 'From catalog & WhatsApp quote CTA',
      statusTag: '2 active',
    },
  ];

  return (
    <div className="space-y-7 text-white font-sans admin-page-enter">
      
      {/* ─── Header Subtitle (Screenshot 5) ─── */}
      <div>
        <p className="font-sans text-xs sm:text-sm text-zinc-400">
          Oversee your career timeline milestones, showcase projects, and real-time live portfolio preview.
        </p>
      </div>

      {/* ─── 4 Stat Cards Row (Screenshot 5) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-zinc-800/80 bg-[#101218] p-5 hover:border-zinc-700 transition"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="font-sans text-xs font-medium text-zinc-400">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-zinc-500" />
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="font-sans text-3xl font-black tracking-tight text-white">
                {card.value}
              </span>
              {card.changeBadge && (
                <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  {card.changeBadge}
                </span>
              )}
              {card.subBadge && (
                <span className="font-mono text-[10px] text-zinc-500">
                  {card.subBadge}
                </span>
              )}
              {card.statusTag && (
                <span className="font-mono text-[10px] font-semibold text-emerald-400">
                  {card.statusTag}
                </span>
              )}
            </div>

            <p className="font-sans text-[11px] text-zinc-500 mt-2 truncate">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Content Grid: Leads & Timeline vs Quick Actions & Rate Card ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">

        {/* ─── LEFT COLUMN (8 COLS) ─── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card 1: Recent Inbound Inquiries & Catalog Leads */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#101218] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <h3 className="font-sans text-sm font-bold text-white">
                    Recent Inbound Inquiries & Catalog Leads
                  </h3>
                </div>
                <p className="font-sans text-xs text-zinc-400 mt-1">
                  Potential clients reaching out directly from your portfolio & service catalog.
                </p>
              </div>

              <button
                type="button"
                className="flex items-center space-x-1 font-sans text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Inquiries List */}
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-xl border border-zinc-800/80 bg-[#14161e] p-4 space-y-2.5 hover:border-zinc-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-sans text-xs font-bold text-white">
                        {inq.client}
                      </span>
                      <span className="text-zinc-600 font-mono text-xs">·</span>
                      <span className="font-sans text-[11px] text-zinc-400">
                        {inq.time}
                      </span>
                      {inq.isNew && (
                        <span className="rounded bg-blue-950 border border-blue-700/50 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-300 uppercase">
                          NEW
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(inq.phone, inq.client)}
                      className="inline-flex items-center space-x-1.5 rounded-lg border border-emerald-600/50 bg-emerald-950/30 px-3 py-1 font-sans text-xs font-semibold text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300 transition cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                    {inq.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-sans text-zinc-400">
                    <span>
                      Package: <strong className="text-zinc-200 font-medium">{inq.package}</strong>
                    </span>
                    <span>
                      Budget: <strong className="text-zinc-200 font-medium">{inq.budget}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Active Career Experience Timeline */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#101218] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-zinc-400" />
                <h3 className="font-sans text-sm font-bold text-white">
                  Active Career Experience Timeline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/experiences')}
                className="flex items-center space-x-1 font-sans text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="font-sans text-xs text-zinc-500">
              Synchronized with your live portfolio experience section.
            </p>

            <div className="rounded-xl border border-zinc-800/80 bg-[#14161e] p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  LATEST ROLE · ACTIVE NOW
                </span>
                <h4 className="font-bold text-sm text-white">
                  Associate Application Developer (Frontend)
                </h4>
                <p className="text-xs text-zinc-400">
                  PT Metrodata Electronics Tbk · Nov 2024 – Present
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/experiences')}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>

        </div>

        {/* ─── RIGHT COLUMN (4 COLS) ─── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#101218] p-6 space-y-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Quick Actions
            </h3>

            <button
              onClick={() => navigate('/admin/experiences')}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-800/70 bg-[#14161e] p-3 text-left transition hover:border-zinc-700 hover:bg-[#181b24] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Briefcase className="h-4 w-4 text-zinc-400" />
                <span className="font-sans text-xs font-medium text-zinc-200">
                  Add Career Experience
                </span>
              </div>
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            <button
              onClick={() => navigate('/admin/projects')}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-800/70 bg-[#14161e] p-3 text-left transition hover:border-zinc-700 hover:bg-[#181b24] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <FolderGit2 className="h-4 w-4 text-zinc-400" />
                <span className="font-sans text-xs font-medium text-zinc-200">
                  Add Portfolio Project
                </span>
              </div>
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            <button
              onClick={() => navigate('/admin/business/services')}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-800/70 bg-[#14161e] p-3 text-left transition hover:border-zinc-700 hover:bg-[#181b24] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Briefcase className="h-4 w-4 text-zinc-400" />
                <span className="font-sans text-xs font-medium text-zinc-200">
                  Add Service Package
                </span>
              </div>
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            <button
              onClick={() => navigate('/admin/theme-studio')}
              className="w-full flex items-center justify-between rounded-xl border border-zinc-800/70 bg-[#14161e] p-3 text-left transition hover:border-zinc-700 hover:bg-[#181b24] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Palette className="h-4 w-4 text-indigo-400" />
                <span className="font-sans text-xs font-medium text-zinc-200">
                  Customize Theme Studio
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          </div>

          {/* Digital Services & Rate Card Panel */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#101218] p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-400">
                  BUSINESS & CATALOG MODE
                </span>
                <span className="font-mono text-[9px] text-zinc-500">
                  {services.length || 4} Packages
                </span>
              </div>
              <h3 className="font-sans text-sm font-bold text-white mt-1">
                Digital Services & Rate Card
              </h3>
              <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                Offer clients ready-to-book development packages with automatic WhatsApp inquiry routing.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-xl border border-zinc-800/70 bg-[#14161e] p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">
                    MVP Fast-Track Web Application
                  </p>
                  <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                    Rp 14.500.000
                  </p>
                </div>
                <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                  Active
                </span>
              </div>

              <div className="rounded-xl border border-zinc-800/70 bg-[#14161e] p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">
                    Interactive Digital Catalog & Showcase Website
                  </p>
                  <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                    Rp 8.000.000
                  </p>
                </div>
                <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                  Active
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/business/services')}
              className="w-full py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Manage Catalog Offerings
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
