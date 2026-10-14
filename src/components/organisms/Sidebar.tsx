/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import type { User, Profile, BusinessProfile } from '../../types';
import { Role } from '../../types';
import {
  Briefcase, FolderGit2, Shield, LayoutDashboard,
  Palette, UserCheck, MessageSquare, ChevronRight
} from 'lucide-react';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useMyProjects } from '../../hooks/useProjects';
import { useBusinessServices } from '../../hooks/useBusinessServices';

interface SidebarProps {
  currentUser: User;
  profile?: Profile;
  businessProfile?: BusinessProfile;
  isProfileIncomplete?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  profile,
  businessProfile,
  isProfileIncomplete,
}) => {
  const isSuper = currentUser.role === Role.ADMIN;
  const isBusiness = !!businessProfile;

  const { data: experiences = [] } = useMyExperiences({ enabled: true });
  const { data: projects = [] } = useMyProjects({ enabled: true });
  const { data: services = [] } = useBusinessServices({ enabled: true });

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-semibold transition-all ${
      isActive
        ? 'bg-[#E8E0FF] text-[#5533CC] font-bold shadow-3xs'
        : 'text-[#69718A] hover:bg-white hover:text-[#202744] hover:shadow-3xs'
    }`;

  const disabledLinkStyle =
    'flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-medium transition-all opacity-40 pointer-events-none text-slate-300';

  // Resolve metadata for identity
  const displayName = isBusiness
    ? businessProfile?.businessName || profile?.fullName || 'Creator Studio'
    : profile?.fullName || 'Creator Profile';

  const headline = isBusiness
    ? businessProfile?.description?.slice(0, 36) || 'Agency & Digital Product Studio...'
    : profile?.bio?.slice(0, 36) || 'Portfolio creator & maker...';

  const initial = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 text-[#202744] font-sans">
      {/* ─── Active Workspace Identity ─── */}
      <div className="rounded-2xl border border-[#EAE5DD] bg-white p-4.5 space-y-3 shadow-3xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A]">
            ACTIVE WORKSPACE
          </span>
          <span className="flex items-center space-x-1.5 font-mono text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8E0FF] border border-[#D5C6FF] font-sans text-xs font-bold text-[#8B6CF6] shadow-xs">
            {initial}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-[#202744] truncate">
              {displayName}
            </h4>
            <p className="text-[10px] text-[#69718A] truncate">
              {headline}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Navigation Groups ─── */}
      <nav className="space-y-5" aria-label="Sidebar Menu">
        {/* OVERVIEW */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
            OVERVIEW
          </span>
          <NavLink
            to={isBusiness ? '/admin/business/dashboard' : '/admin/dashboard'}
            end
            className={linkStyle}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </NavLink>
        </div>

        {/* PORTFOLIO */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
            PORTFOLIO
          </span>
          <div className="space-y-1">
            <NavLink
              id="tab-experiences-btn-user"
              to="/admin/experiences"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-2.5">
                <Briefcase className="h-4 w-4" />
                <span>Experiences & Milestones</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-[#69718A]">
                {experiences.length || 0}
              </span>
            </NavLink>

            <NavLink
              id="tab-projects-btn-user"
              to="/admin/projects"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-2.5">
                <FolderGit2 className="h-4 w-4" />
                <span>Projects & Case Studies</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-[#69718A]">
                {projects.length || 0}
              </span>
            </NavLink>
          </div>
        </div>

        {/* BUSINESS HUB */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
            COMMERCIAL HUB
          </span>
          <div className="space-y-1">
            <NavLink
              id="tab-business-services-btn"
              to="/admin/business/services"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-2.5">
                <Briefcase className="h-4 w-4" />
                <span>Services & Pricing</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-[#69718A]">
                {services.length || 0}
              </span>
            </NavLink>

            <NavLink
              id="tab-business-dashboard-btn"
              to="/admin/business/dashboard"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="h-4 w-4" />
                <span>Client Inquiries</span>
              </div>
              <span className="rounded-full bg-[#E7F2FF] border border-[#BFDEFF] px-2 py-0.5 font-mono text-[9px] font-bold text-[#1E6FD6]">
                WhatsApp
              </span>
            </NavLink>
          </div>
        </div>

        {/* CUSTOMIZATION */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
            CUSTOMIZATION
          </span>
          <NavLink
            id="tab-theme-studio-btn-user"
            to={isBusiness ? '/admin/business/theme-studio' : '/admin/theme-studio'}
            className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
          >
            <div className="flex items-center space-x-2.5">
              <Palette className="h-4 w-4 text-[#8B6CF6]" />
              <span>Theme Studio & Styles</span>
            </div>
          </NavLink>
        </div>

        {/* SETTINGS */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
            SETTINGS
          </span>
          <NavLink
            id="tab-profile-btn-user"
            to={isBusiness ? '/admin/business/profile' : '/admin/profile'}
            className={linkStyle}
          >
            <div className="flex items-center space-x-2.5">
              <UserCheck className="h-4 w-4" />
              <span>Profile & Brand Identity</span>
            </div>
          </NavLink>
        </div>

        {/* Superadmin shortcut link if user has admin role */}
        {isSuper && (
          <div className="pt-2">
            <NavLink
              to="/admin/dashboard"
              className="flex items-center justify-between rounded-xl border border-[#D5C6FF] bg-[#E8E0FF]/50 px-3.5 py-2.5 text-xs font-bold text-[#5533CC] hover:bg-[#E8E0FF] transition shadow-3xs"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-[#8B6CF6]" />
                <span>Superadmin Console</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5" />
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
};
