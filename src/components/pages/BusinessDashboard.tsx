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
import { useDashboardAnalytics } from '../../hooks/useAnalytics';
import {
  Briefcase, FolderGit2, Loader2,
  Eye, MessageSquare, Plus, Palette,
  ChevronRight, Building2
} from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

export const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Load queries
  const { isLoading: isProfileLoading, data: businessProfile } = useBusinessProfile();
  const { data: services = [], isLoading: isServicesLoading } = useBusinessServices();
  const { data: businessProjects = [], isLoading: isProjectsLoading } = useBusinessProjects();
  const { data: experiences = [] } = useMyExperiences({ enabled: true });
  const { data: myProjects = [] } = useMyProjects({ enabled: true });
  const { data: analytics } = useDashboardAnalytics(30);

  const totalViews = analytics?.summary?.totalProfileViews ?? 0;
  const uniqueVisitors = analytics?.summary?.uniqueVisitors ?? 0;

  const isDataLoading = isProfileLoading || isServicesLoading || isProjectsLoading;

  // Inbound client leads
  const inquiries = [
    {
      id: '1',
      client: 'PT Nusantara Cipta Karya',
      time: 'Hari ini, 09:30',
      isNew: true,
      message:
        'Kami ingin mendigitalkan katalog 60+ produk furniture kami ke platform modern yang bisa langsung direct WA.',
      package: 'Interactive Digital Catalog & Showcase',
      budget: 'Rp 10.000.000 - Rp 15.000.000',
      phone: '6281234567890',
    },
    {
      id: '2',
      client: 'Reza Fahlevi (Founder Finflow)',
      time: 'Kemarin, 16:45',
      isNew: false,
      message:
        'Perlu bantuan pembangunan dashboard MVP financial planner kami, deadline bulan depan untuk demo investor.',
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
      package: 'UI/UX Design Sprint & Design System',
      budget: 'Rp 8.000.000',
      phone: '6281122334455',
    },
  ];

  const handleOpenWhatsApp = (phone: string, client: string) => {
    const text = encodeURIComponent(
      `Halo ${client}, terima kasih telah menghubungi kami via Foliowalaweh portfolio.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#69718A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CF6] mb-3" />
        <p className="font-sans text-xs font-semibold">Loading commercial dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Portfolio & Catalog Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      iconBg: 'bg-[#E7F2FF] text-[#4697F5]',
      changeBadge: `${uniqueVisitors} unique`,
      subtitle: `${uniqueVisitors} unique visitors past 30 days`,
    },
    {
      label: 'Showcase Projects',
      value: (businessProjects.length || myProjects.length || 0).toString(),
      icon: FolderGit2,
      iconBg: 'bg-[#E8E0FF] text-[#8B6CF6]',
      subtitle: 'Published case studies',
      subBadge: `${businessProjects.length} active`,
    },
    {
      label: 'Career Milestones',
      value: (experiences.length || 0).toString(),
      icon: Briefcase,
      iconBg: 'bg-[#FFF6E3] text-[#A66E00]',
      subtitle: 'Proven track records',
      statusTag: 'Active Now',
    },
    {
      label: 'Client Inquiries',
      value: '3',
      icon: MessageSquare,
      iconBg: 'bg-emerald-50 text-emerald-600',
      subtitle: 'From catalog WhatsApp quote CTA',
      statusTag: '2 active',
    },
  ];

  return (
    <div className="space-y-8 text-[#202744] font-sans admin-page-enter">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0EBE3] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#202744]">
              {businessProfile?.businessName || 'Business Studio'}
            </h2>
            <Badge variant="blue" dot>Commercial Hub</Badge>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#69718A]">
            Oversee commercial service catalogs, inbound WhatsApp client inquiries, and live portfolios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/business/services')}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Service
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/business/theme-studio')}
            leftIcon={<Palette className="h-3.5 w-3.5" />}
          >
            Studio Theme
          </Button>
        </div>
      </div>

      {/* ─── 4 Stat Cards Row ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-[#8B6CF6]/40 transition shadow-3xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-xs font-semibold text-[#69718A]">
                {card.label}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.iconBg}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
                {card.value}
              </span>
              {card.changeBadge && (
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {card.changeBadge}
                </span>
              )}
              {card.subBadge && (
                <span className="font-mono text-[10px] text-[#69718A]">
                  {card.subBadge}
                </span>
              )}
            </div>

            <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Content Grid: Leads vs Quick Actions ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Leads & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Inbound Inquiries */}
          <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-5 shadow-3xs">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-[#4697F5]" />
                  <h3 className="font-sans text-sm font-bold text-[#202744]">
                    Recent Inbound Inquiries & Catalog Leads
                  </h3>
                </div>
                <p className="font-sans text-xs text-[#69718A] mt-1">
                  Prospective clients reaching out directly through your WhatsApp service CTA.
                </p>
              </div>

              <span className="rounded-full bg-[#E7F2FF] border border-[#BFDEFF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#1E6FD6]">
                3 Inquiries
              </span>
            </div>

            {/* Inquiries List */}
            <div className="space-y-3.5">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/70 p-4.5 space-y-2.5 hover:bg-white hover:border-[#4697F5]/50 transition shadow-3xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-sans text-xs font-bold text-[#202744]">
                        {inq.client}
                      </span>
                      <span className="text-slate-300 font-mono text-xs">•</span>
                      <span className="font-sans text-[11px] text-[#69718A]">
                        {inq.time}
                      </span>
                      {inq.isNew && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-700 uppercase">
                          NEW
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(inq.phone, inq.client)}
                      className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-sans text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition active:scale-95 cursor-pointer shadow-3xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Reply on WhatsApp</span>
                    </button>
                  </div>

                  <p className="font-sans text-xs text-[#202744] leading-relaxed">
                    "{inq.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-sans text-[#69718A] border-t border-[#EAE5DD]/60">
                    <span>
                      Package: <strong className="text-[#202744] font-semibold">{inq.package}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      Budget: <strong className="text-[#4697F5] font-semibold">{inq.budget}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Commercial Services Quick Preview */}
          <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-4 shadow-3xs">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-[#8B6CF6]" />
                <h3 className="font-sans text-sm font-bold text-[#202744]">
                  Published Service Offerings ({services.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/business/services')}
                className="flex items-center space-x-1 font-sans text-xs font-bold text-[#8B6CF6] hover:underline cursor-pointer"
              >
                <span>Manage Catalog</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E5E1DA] bg-[#FAF8F5] p-6 text-center text-[#69718A]">
                <p className="text-xs mb-2">No commercial services published yet.</p>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => navigate('/admin/business/services')}
                >
                  Create First Service
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {services.slice(0, 4).map((svc) => (
                  <div
                    key={svc.id}
                    className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-sans text-xs font-bold text-[#202744] truncate">
                          {svc.name}
                        </h4>
                        <Badge variant="blue" size="xs">
                          {svc.isPublic ? 'Public' : 'Hidden'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#69718A] line-clamp-2 mb-2">
                        {svc.description || 'No description entered.'}
                      </p>
                    </div>
                    {svc.priceStartFrom && (
                      <span className="font-mono text-xs font-bold text-[#4697F5]">
                        From Rp {svc.priceStartFrom.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 space-y-3.5 shadow-3xs">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A] mb-3">
              Commercial Shortcuts
            </h3>

            <button
              onClick={() => navigate('/admin/business/services')}
              className="w-full flex items-center justify-between rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5 text-left transition hover:border-[#8B6CF6]/40 hover:bg-white cursor-pointer shadow-3xs"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Add New Service</h4>
                  <p className="text-[10px] text-[#69718A]">Publish pricing & delivery SLA</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#69718A]" />
            </button>

            <button
              onClick={() => navigate('/admin/business/projects')}
              className="w-full flex items-center justify-between rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5 text-left transition hover:border-[#4697F5]/40 hover:bg-white cursor-pointer shadow-3xs"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7F2FF] text-[#4697F5]">
                  <FolderGit2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Business Case Studies</h4>
                  <p className="text-[10px] text-[#69718A]">Manage client showcase work</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#69718A]" />
            </button>

            <button
              onClick={() => navigate('/admin/business/theme-studio')}
              className="w-full flex items-center justify-between rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5 text-left transition hover:border-[#FFC45B]/50 hover:bg-white cursor-pointer shadow-3xs"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF6E3] text-[#A66E00]">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Agency Theme Studio</h4>
                  <p className="text-[10px] text-[#69718A]">Customize commercial styling</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#69718A]" />
            </button>

            <button
              onClick={() => navigate('/admin/business/profile')}
              className="w-full flex items-center justify-between rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5 text-left transition hover:border-[#8B6CF6]/40 hover:bg-white cursor-pointer shadow-3xs"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[#202744]">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Brand & Logo Settings</h4>
                  <p className="text-[10px] text-[#69718A]">Update agency branding</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#69718A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
