/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { useProfile } from '../../hooks/useProfile';
import { useMyProjects } from '../../hooks/useProjects';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useDashboardAnalytics } from '../../hooks/useAnalytics';
import {
  Eye, FolderGit2, Share2, Briefcase,
  ExternalLink, Palette, Loader2,
  TrendingUp, Github, Mail, Phone,
  FileText, MessageCircle, Clock
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface UserDashboardProps {
  currentUser: User;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState<number>(30);
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

  // Calculate max views for SVG chart scaling
  const maxViewVal = Math.max(
    ...trendData.map((d) => Math.max(d.profileViews, d.projectViews, d.socialClicks)),
    5
  );

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
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-8 text-[#202744] font-sans admin-page-enter">
      {/* ─── Top Header & Controls ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EBE3] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202744]">
              {profile?.fullName ? `Welcome back, ${profile.fullName.split(' ')[0]}!` : 'Creator Portfolio Analytics'}
            </h1>
            <Badge variant="violet" dot>
              Live Metrics
            </Badge>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#69718A]">
            Monitor how many people view your portfolio, explore your showcase projects, and engage with your social links.
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
              7 Days
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
              30 Days
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/theme-studio')}
            leftIcon={<Palette className="h-3.5 w-3.5 text-[#8B6CF6]" />}
          >
            Customize Theme
          </Button>

          <a
            href={publicPortfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] px-4 py-2 font-sans text-xs font-bold text-white transition active:scale-95 shadow-xs"
          >
            <span>Live Portfolio</span>
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
              Profile Pageviews
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F2FF] text-[#4697F5]">
              <Eye className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {isAnalyticsLoading ? <Loader2 className="h-7 w-7 animate-spin text-[#69718A]" /> : summary.totalProfileViews}
            </span>
            <span className="font-mono text-[10px] font-bold text-[#1E6FD6] bg-[#E7F2FF] border border-[#BFDEFF] px-2 py-0.5 rounded-full">
              {summary.uniqueVisitors} unique
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            Past {selectedDays} days profile traffic
          </p>
        </div>

        {/* Card 2: Project Views */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-[#8B6CF6]/50 transition shadow-3xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs font-semibold text-[#69718A]">
              Project Showcases Viewed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
              <FolderGit2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {isAnalyticsLoading ? <Loader2 className="h-7 w-7 animate-spin text-[#69718A]" /> : summary.totalProjectViews}
            </span>
            <span className="font-mono text-[10px] text-[#69718A]">
              {myProjects.length} projects
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            Clicks on project demos & repos
          </p>
        </div>

        {/* Card 3: Social & Outbound Links */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 hover:border-emerald-400 transition shadow-3xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-xs font-semibold text-[#69718A]">
              Social & Contact Clicks
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Share2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {isAnalyticsLoading ? <Loader2 className="h-7 w-7 animate-spin text-[#69718A]" /> : summary.totalSocialClicks}
            </span>
            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
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
              Active Milestones
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF6E3] text-[#A66E00]">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-3xl font-black tracking-tight text-[#202744]">
              {experiences.length}
            </span>
            <span className="font-mono text-[10px] text-[#69718A]">
              Career items
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#69718A] mt-2 truncate">
            Published in timeline section
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
              Daily comparison of profile visitors, project clicks, and social links engagement.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B6CF6]" />
              <span className="text-[#202744]">Profile Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4697F5]" />
              <span className="text-[#202744]">Project Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span className="text-[#202744]">Social Clicks</span>
            </div>
          </div>
        </div>

        {/* Dynamic SVG / HTML Bar Chart */}
        {trendData.length > 0 ? (
          <div className="relative">
            {/* Hover Tooltip Box */}
            {hoveredPoint && (
              <div className="absolute top-0 right-4 z-10 bg-[#202744] text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 border border-slate-700 animate-in fade-in">
                <div className="flex items-center justify-between gap-4 border-b border-slate-600 pb-1 font-bold text-slate-300">
                  <span>{hoveredPoint.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">{hoveredPoint.date}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-violet-300">
                  <span>Profile Views:</span>
                  <span className="font-mono font-bold text-white">{hoveredPoint.profileViews}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-blue-300">
                  <span>Project Views:</span>
                  <span className="font-mono font-bold text-white">{hoveredPoint.projectViews}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-emerald-300">
                  <span>Social Clicks:</span>
                  <span className="font-mono font-bold text-white">{hoveredPoint.socialClicks}</span>
                </div>
              </div>
            )}

            {/* Bars Container */}
            <div className="h-56 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 px-2 overflow-x-auto">
              {trendData.map((point) => {
                const pHeight = Math.max((point.profileViews / maxViewVal) * 160, point.profileViews > 0 ? 8 : 2);
                const projHeight = Math.max((point.projectViews / maxViewVal) * 160, point.projectViews > 0 ? 8 : 2);
                const sHeight = Math.max((point.socialClicks / maxViewVal) * 160, point.socialClicks > 0 ? 8 : 2);

                return (
                  <div
                    key={point.date}
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full group cursor-pointer transition-all"
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1">
                      {/* Bar 1: Profile Views */}
                      <div
                        style={{ height: `${pHeight}px` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          point.profileViews > 0
                            ? 'bg-[#8B6CF6] group-hover:brightness-110'
                            : 'bg-slate-100'
                        }`}
                      />
                      {/* Bar 2: Project Views */}
                      <div
                        style={{ height: `${projHeight}px` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          point.projectViews > 0
                            ? 'bg-[#4697F5] group-hover:brightness-110'
                            : 'bg-slate-100'
                        }`}
                      />
                      {/* Bar 3: Social Clicks */}
                      <div
                        style={{ height: `${sHeight}px` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          point.socialClicks > 0
                            ? 'bg-[#059669] group-hover:brightness-110'
                            : 'bg-slate-100'
                        }`}
                      />
                    </div>
                    {/* Date label on axis */}
                    <span className="font-mono text-[9px] text-[#69718A] mt-2 transform -rotate-45 sm:rotate-0 truncate">
                      {point.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-[#69718A] text-xs">
            No visitor history recorded yet. Share your portfolio link to start tracking metrics!
          </div>
        )}
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
                        <span className="w-5 h-5 rounded-full bg-[#E8E0FF] text-[#8B6CF6] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#202744] truncate">
                          {proj.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-[#202744]">
                          {proj.views} views
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-[#8B6CF6] bg-[#E8E0FF] px-1.5 py-0.5 rounded">
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
                <p>No project views recorded yet in this time frame.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Visitors who click on your project case studies will be listed here.
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
              Breakdown of channels visitors click to get in touch.
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
                  <span className="font-mono text-sm font-bold text-[#202744]">
                    {item.clicks} clicks
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#69718A]">
                <Share2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>No contact or social clicks recorded yet.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  When visitors click your WhatsApp, GitHub, LinkedIn, or Email buttons, counts will show here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Recent Inbound Activity Feed ─── */}
      <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-7 space-y-4 shadow-3xs">
        <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#8B6CF6]" />
            <h3 className="font-sans text-sm font-bold text-[#202744]">
              Recent Live Visitor Engagements
            </h3>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
            Live Stream
          </span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-[#F0EBE3]">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] flex items-center justify-center text-[#8B6CF6] shrink-0">
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
                        ? 'Visitor opened your public portfolio'
                        : act.eventType === 'PROJECT_VIEW'
                        ? `Visitor viewed project: "${act.targetTitle || 'Showcase Project'}"`
                        : `Visitor clicked contact link: ${act.targetTitle || act.targetId || 'Channel'}`}
                    </p>
                    {act.referrer && (
                      <p className="text-[10px] text-[#69718A] truncate">
                        Source: {act.referrer}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#69718A] shrink-0">
                  {formatRelativeTime(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#69718A]">
            No recent visitor activities logged yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
