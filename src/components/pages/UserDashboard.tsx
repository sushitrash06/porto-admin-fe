/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '../../types';
import { useProfile } from '../../hooks/useProfile';
import { useMyProjects } from '../../hooks/useProjects';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useDashboardAnalytics } from '../../hooks/useAnalytics';
import { analyticsService, type DailyTrendPoint } from '../../services/analytics.service';
import {
  Eye, FolderGit2, Share2, Briefcase,
  ExternalLink, Palette, Loader2,
  TrendingUp, Github, Mail, Phone,
  FileText, MessageCircle, Clock,
  Sparkles, Copy, Check
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface UserDashboardProps {
  currentUser: User;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    label: string;
    profileViews: number;
    projectViews: number;
    socialClicks: number;
  } | null>(null);

  // Queries
  const { data: profile } = useProfile();
  const { data: myProjects = [] } = useMyProjects({ enabled: true });
  const { data: experiences = [] } = useMyExperiences({ enabled: true });
  const { data: analytics, isLoading: isAnalyticsLoading } = useDashboardAnalytics(selectedDays);

  const publicPortfolioUrl = `/portfolio/${currentUser.id}`;

  const summary = analytics?.summary || {
    totalProfileViews: 0,
    uniqueVisitors: 0,
    totalProjectViews: 0,
    totalSocialClicks: 0,
    days: selectedDays,
  };

  const trendData = analytics?.viewsTrend || [];
  const topProjects = analytics?.topProjects || [];
  const socialBreakdown = analytics?.socialClicksBreakdown || [];
  const recentActivity = analytics?.recentActivity || [];

  // Calculate scaling for chart with friendly default floor of 5
  const rawMax = Math.max(
    ...trendData.map((d) => Math.max(d.profileViews, d.projectViews, d.socialClicks)),
    0
  );
  const maxViewVal = rawMax === 0 ? 5 : Math.max(rawMax + 1, 5);
  const midViewVal = Math.round(maxViewVal / 2);
  const isZeroData = summary.totalProfileViews === 0 && summary.totalProjectViews === 0 && summary.totalSocialClicks === 0;

  const handleCopyLink = async () => {
    try {
      const fullUrl = `${window.location.origin}/portfolio/${currentUser.id}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSimulateTest = async () => {
    setIsTesting(true);
    try {
      // 1. Track profile view
      await analyticsService.trackEvent({
        userId: currentUser.id,
        eventType: 'PROFILE_VIEW',
        referrer: 'Live Dashboard Simulation',
      });

      // 2. Track project view if any project exists
      if (myProjects.length > 0) {
        await analyticsService.trackEvent({
          userId: currentUser.id,
          eventType: 'PROJECT_VIEW',
          targetId: myProjects[0].id,
          targetTitle: myProjects[0].title,
        });
      }

      // 3. Track social click
      await analyticsService.trackEvent({
        userId: currentUser.id,
        eventType: 'SOCIAL_CLICK',
        targetId: 'whatsapp',
        targetTitle: 'WhatsApp Direct',
      });

      // Invalidate cache to immediately show updated metrics and bars
      await queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    } catch (err) {
      console.error('Test simulation error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const formatAxisLabel = (point: DailyTrendPoint, index: number, total: number) => {
    const parts = point.date.split('-');
    if (parts.length !== 3) return point.label;
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = months[month - 1] || '';

    // Last element is always "Hari Ini"
    if (index === total - 1) {
      return 'Hari Ini';
    }

    if (total <= 7) {
      return `${day} ${monthName}`;
    }

    if (total <= 14) {
      return index % 2 === 0 ? `${day} ${monthName}` : '';
    }

    // 30 days: show spaced milestone ticks
    const step = Math.floor(total / 5);
    if (index === 0 || index % step === 0) {
      return `${day} ${monthName}`;
    }
    return '';
  };

  const formatFullDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('whatsapp') || p.includes('wa')) return <MessageCircle className="h-4 w-4 text-emerald-500" />;
    if (p.includes('github') || p.includes('git')) return <Github className="h-4 w-4 text-slate-700" />;
    if (p.includes('email') || p.includes('mail')) return <Mail className="h-4 w-4 text-blue-500" />;
    if (p.includes('phone') || p.includes('call') || p.includes('tel')) return <Phone className="h-4 w-4 text-purple-500" />;
    if (p.includes('cv') || p.includes('resume')) return <FileText className="h-4 w-4 text-amber-500" />;
    return <Share2 className="h-4 w-4 text-[#8B6CF6]" />;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes}m lalu`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}j lalu`;
      return `${Math.floor(diffHours / 24)}h lalu`;
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="space-y-8 text-[#202744] font-sans admin-page-enter">
      {/* ─── Top Header & Controls ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EBE3] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202744]">
              {profile?.fullName ? `Halo, ${profile.fullName.split(' ')[0]}!` : 'Creator Portfolio Analytics'}
            </h1>
            <Badge variant="violet" dot>
              Live Metrics
            </Badge>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#69718A]">
            Pantau statistik kunjungan portfolio, ketertarikan showcase project, dan interaksi link sosmed kamu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-[#FAF8F5] border border-[#EAE5DD] rounded-xl p-1 text-xs font-semibold shadow-3xs">
            <button
              type="button"
              onClick={() => setSelectedDays(7)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDays === 7
                  ? 'bg-white text-[#8B6CF6] shadow-3xs font-bold'
                  : 'text-[#69718A] hover:text-[#202744]'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays(14)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDays === 14
                  ? 'bg-white text-[#8B6CF6] shadow-3xs font-bold'
                  : 'text-[#69718A] hover:text-[#202744]'
              }`}
            >
              14 Hari
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays(30)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDays === 30
                  ? 'bg-white text-[#8B6CF6] shadow-3xs font-bold'
                  : 'text-[#69718A] hover:text-[#202744]'
              }`}
            >
              30 Hari
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/theme-studio')}
            leftIcon={<Palette className="h-3.5 w-3.5 text-[#8B6CF6]" />}
          >
            Tema Studio
          </Button>

          <a
            href={publicPortfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] px-4 py-2 font-sans text-xs font-bold text-white transition active:scale-95 shadow-xs"
          >
            <span>Buka Portfolio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ─── 4 Summary Metric Cards ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Profile Visitors */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-[#4697F5]/50 transition shadow-3xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs font-semibold text-[#69718A]">
              Kunjungan Profil
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F2FF] text-[#4697F5]">
              <Eye className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {isAnalyticsLoading ? <Loader2 className="h-7 w-7 animate-spin text-[#69718A]" /> : summary.totalProfileViews}
            </span>
            <span className="font-sans text-[11px] font-bold text-[#1E6FD6] bg-[#E7F2FF] border border-[#BFDEFF] px-2 py-0.5 rounded-full">
              {summary.uniqueVisitors} unik
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            Traffic {selectedDays} hari terakhir
          </p>
        </div>

        {/* Card 2: Project Views */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-[#8B6CF6]/50 transition shadow-3xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs font-semibold text-[#69718A]">
              Showcase Dilihat
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
              <FolderGit2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {isAnalyticsLoading ? <Loader2 className="h-7 w-7 animate-spin text-[#69718A]" /> : summary.totalProjectViews}
            </span>
            <span className="font-sans text-[11px] text-[#69718A] bg-[#FAF8F5] border border-[#EAE5DD] px-2 py-0.5 rounded-full">
              {myProjects.length} proyek aktif
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            Klik preview & case study proyek
          </p>
        </div>

        {/* Card 3: Social & Outbound Links */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-emerald-400 transition shadow-3xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs font-semibold text-[#69718A]">
              Klik Kontak & Sosmed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Share2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {isAnalyticsLoading ? <Loader2 className="h-7 w-7 animate-spin text-[#69718A]" /> : summary.totalSocialClicks}
            </span>
            <span className="font-sans text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Inbound Leads
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            WhatsApp, GitHub, LinkedIn & CV
          </p>
        </div>

        {/* Card 4: Portfolio Content Items */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-amber-400 transition shadow-3xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs font-semibold text-[#69718A]">
              Pengalaman Terbit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF6E3] text-[#A66E00]">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {experiences.length}
            </span>
            <span className="font-sans text-[11px] text-[#69718A] bg-[#FAF8F5] border border-[#EAE5DD] px-2 py-0.5 rounded-full">
              Karier & Edukasi
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            Ditampilkan di timeline portfolio
          </p>
        </div>
      </div>

      {/* ─── Visitor & Engagement Interactive Trend Chart ─── */}
      <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-6 shadow-3xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE3] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-[#8B6CF6]" />
              <h2 className="font-sans text-base font-bold text-[#202744]">
                Visitor & Interaction Timeline
              </h2>
            </div>
            <p className="font-sans text-xs text-[#69718A] mt-1">
              Perbandingan harian kunjungan profil, interaksi project, dan klik sosial media.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B6CF6]" />
              <span className="text-[#202744]">Profile Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4697F5]" />
              <span className="text-[#202744]">Project Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-[#202744]">Social Clicks</span>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="relative pt-2">
          {/* Floating Tooltip Box */}
          {hoveredPoint && (
            <div className="absolute top-0 right-4 z-20 bg-[#202744] text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 border border-slate-700 animate-in fade-in pointer-events-none">
              <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-1 font-bold text-slate-300">
                <span>{formatFullDate(hoveredPoint.date)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-violet-300">
                <span>Profile Views:</span>
                <span className="font-bold text-white">{hoveredPoint.profileViews}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-blue-300">
                <span>Project Views:</span>
                <span className="font-bold text-white">{hoveredPoint.projectViews}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-emerald-300">
                <span>Social Clicks:</span>
                <span className="font-bold text-white">{hoveredPoint.socialClicks}</span>
              </div>
            </div>
          )}

          {/* Zero Data Empty State Overlay */}
          {isZeroData && (
            <div className="absolute inset-x-0 top-12 flex justify-center z-10 px-4 pointer-events-auto">
              <div className="max-w-md w-full bg-white/95 backdrop-blur-sm border border-[#EAE5DD] rounded-2xl p-5 shadow-sm text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EEFF] text-[#8B6CF6] text-xs font-bold mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Siap Merekam Visitor Real-Time</span>
                </div>
                <p className="text-xs font-bold text-[#202744]">
                  Belum ada kunjungan tercatat dalam {selectedDays} hari terakhir
                </p>
                <p className="text-[11px] text-[#69718A] mt-1 mb-3.5 leading-relaxed">
                  Bagikan link portfolio kamu untuk mulai mencatat pengunjung dan engagement kontak.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] hover:bg-white text-xs font-bold text-[#202744] transition shadow-3xs cursor-pointer active:scale-95"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#69718A]" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateTest}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] text-xs font-bold text-white transition shadow-3xs cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>Tes Simulasi Traffic</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chart Graphic Area with Y-Axis and Gridlines */}
          <div className="relative h-60 w-full flex">
            {/* Y-Axis Column */}
            <div className="w-8 flex flex-col justify-between text-right pr-2 pb-7 text-[10px] font-semibold text-[#A09A90] select-none">
              <span>{maxViewVal}</span>
              <span>{midViewVal}</span>
              <span>0</span>
            </div>

            {/* Grid & Bars Container */}
            <div className="relative flex-1 h-full flex flex-col">
              {/* Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                <div className="w-full border-t border-dashed border-[#EAE5DD]" />
                <div className="w-full border-t border-dashed border-[#F0EBE3]" />
                <div className="w-full border-t border-[#EAE5DD]" />
              </div>

              {/* Bars Columns */}
              <div className="relative z-1 flex-1 flex items-end gap-1 sm:gap-2 pb-7 pt-4 px-1">
                {trendData.map((point) => {
                  const pHeight = point.profileViews > 0 ? Math.max((point.profileViews / maxViewVal) * 140, 6) : 0;
                  const projHeight = point.projectViews > 0 ? Math.max((point.projectViews / maxViewVal) * 140, 6) : 0;
                  const sHeight = point.socialClicks > 0 ? Math.max((point.socialClicks / maxViewVal) * 140, 6) : 0;
                  const hasActivity = point.profileViews > 0 || point.projectViews > 0 || point.socialClicks > 0;

                  return (
                    <div
                      key={point.date}
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="flex-1 min-w-[12px] h-full flex flex-col justify-end items-center group cursor-pointer transition-all rounded-lg p-0.5 hover:bg-[#F3EEFF]/60"
                    >
                      <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                        {hasActivity ? (
                          <>
                            {/* Profile Views Bar */}
                            <div
                              style={{ height: `${pHeight}px` }}
                              className={`w-full max-w-[8px] rounded-t-sm transition-all duration-300 ${
                                point.profileViews > 0 ? 'bg-[#8B6CF6] group-hover:brightness-110' : 'h-0'
                              }`}
                            />
                            {/* Project Views Bar */}
                            <div
                              style={{ height: `${projHeight}px` }}
                              className={`w-full max-w-[8px] rounded-t-sm transition-all duration-300 ${
                                point.projectViews > 0 ? 'bg-[#4697F5] group-hover:brightness-110' : 'h-0'
                              }`}
                            />
                            {/* Social Clicks Bar */}
                            <div
                              style={{ height: `${sHeight}px` }}
                              className={`w-full max-w-[8px] rounded-t-sm transition-all duration-300 ${
                                point.socialClicks > 0 ? 'bg-[#10B981] group-hover:brightness-110' : 'h-0'
                              }`}
                            />
                          </>
                        ) : (
                          /* Resting baseline tick */
                          <div className="w-full max-w-[12px] h-[3px] rounded-full bg-[#EAE5DD] group-hover:bg-[#8B6CF6]/40 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Labels Row */}
              <div className="h-6 flex items-center gap-1 sm:gap-2 px-1">
                {trendData.map((point, idx) => {
                  const label = formatAxisLabel(point, idx, trendData.length);
                  return (
                    <div key={point.date} className="flex-1 flex justify-center items-center">
                      {label ? (
                        <span className="font-sans text-[10px] font-bold text-[#69718A] whitespace-nowrap">
                          {label}
                        </span>
                      ) : (
                        <span className="text-[#D8D2C7] text-[10px] select-none">·</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Breakdown Columns: Top Projects vs Social Conversion ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Top Viewed Projects */}
        <div className="lg:col-span-7 rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-5 shadow-3xs">
          <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-[#8B6CF6]" />
                <h3 className="font-sans text-sm font-bold text-[#202744]">
                  Top Viewed Projects Leaderboard
                </h3>
              </div>
              <p className="font-sans text-xs text-[#69718A] mt-0.5">
                Which projects attract the most visitor attention and clicks.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/projects')}
              className="text-xs font-bold text-[#8B6CF6] hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {topProjects.length > 0 ? (
              topProjects.map((proj, idx) => {
                const totalProjViews = summary.totalProjectViews || 1;
                const percentage = Math.round((proj.views / totalProjViews) * 100);

                return (
                  <div
                    key={proj.projectId}
                    className="p-3.5 rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/80 hover:bg-white hover:border-[#8B6CF6]/40 transition space-y-2 shadow-3xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#E8E0FF] text-[#8B6CF6] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#202744] truncate">
                          {proj.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-[#202744]">
                          {proj.views} views
                        </span>
                        <span className="text-[10px] font-semibold text-[#8B6CF6] bg-[#E8E0FF] px-1.5 py-0.5 rounded">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#8B6CF6] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#69718A]">
                <FolderGit2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>Belum ada rekaman klik proyek pada periode ini.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Pengunjung yang mengklik case study proyek akan terdata di sini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Social Channels & Contact Links */}
        <div className="lg:col-span-5 rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-5 shadow-3xs">
          <div className="border-b border-[#F0EBE3] pb-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-emerald-600" />
              <h3 className="font-sans text-sm font-bold text-[#202744]">
                Social & Contact Engagement
              </h3>
            </div>
            <p className="font-sans text-xs text-[#69718A] mt-0.5">
              Distribusi channel kontak yang diklik oleh visitor.
            </p>
          </div>

          <div className="space-y-3">
            {socialBreakdown.length > 0 ? (
              socialBreakdown.map((item) => (
                <div
                  key={item.platform}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5]/80 hover:bg-white transition shadow-3xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE5DD] flex items-center justify-center shadow-3xs">
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs capitalize text-[#202744]">
                        {item.platform}
                      </h4>
                      <p className="text-[10px] text-[#69718A]">Outbound Click</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#202744]">
                    {item.clicks} clicks
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#69718A]">
                <Share2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>Belum ada klik kontak sosmed tercatat.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Saat visitor mengklik WhatsApp, GitHub, LinkedIn, atau Email, angkanya akan tampil di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Recent Inbound Activity Feed ─── */}
      <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-4 shadow-3xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#8B6CF6]" />
            <h3 className="font-sans text-sm font-bold text-[#202744]">
              Aktivitas Visitor Terbaru
            </h3>
          </div>
          <Badge variant="success" size="xs">
            Live Stream
          </Badge>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-[#F3EFEA]">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="py-3 px-2 flex items-center justify-between gap-4 text-xs rounded-xl hover:bg-[#8B6CF6]/[0.025] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] flex items-center justify-center text-[#8B6CF6] shrink-0 shadow-3xs">
                    {act.eventType === 'PROFILE_VIEW' ? (
                      <Eye className="h-3.5 w-3.5 text-[#4697F5]" />
                    ) : act.eventType === 'PROJECT_VIEW' ? (
                      <FolderGit2 className="h-3.5 w-3.5 text-[#8B6CF6]" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#202744] truncate">
                      {act.eventType === 'PROFILE_VIEW'
                        ? 'Pengunjung membuka portfolio publik kamu'
                        : act.eventType === 'PROJECT_VIEW'
                        ? `Pengunjung melihat proyek: "${act.targetTitle || 'Showcase Project'}"`
                        : `Pengunjung mengklik kontak: ${act.targetTitle || act.targetId || 'Channel'}`}
                    </p>
                    {act.referrer && (
                      <p className="text-[10px] text-[#69718A] truncate mt-0.5">
                        Sumber: {act.referrer}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-sans text-[11px] text-[#69718A] shrink-0">
                  {formatRelativeTime(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#69718A]">
            Belum ada aktivitas interaksi tercatat.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
