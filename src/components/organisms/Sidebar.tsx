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
  Palette, UserCheck, MessageSquare
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

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, profile, businessProfile, isProfileIncomplete }) => {
  const isSuper = currentUser.role === Role.ADMIN;
  const isBusiness = !!businessProfile;

  const { data: experiences = [] } = useMyExperiences({ enabled: true });
  const { data: projects = [] } = useMyProjects({ enabled: true });
  const { data: services = [] } = useBusinessServices({ enabled: true });

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-medium transition-all ${isActive
      ? 'bg-[#1c1f26] text-white font-semibold shadow-xs'
      : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
    }`;
    
  const disabledLinkStyle = "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-medium transition-all opacity-40 pointer-events-none text-zinc-600";

  // Resolve metadata for identity
  const displayName = isBusiness
    ? (businessProfile?.businessName || profile?.fullName || 'Azkaxism')
    : (profile?.fullName || 'Azkaxism');

  const headline = isBusiness
    ? (businessProfile?.description?.slice(0, 36) || 'Agency & Digital Product Studio...')
    : (profile?.bio?.slice(0, 36) || 'Senior Frontend Engineer & Design Arc...');

  const initial = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 text-zinc-300 font-sans">
      
      {/* ─── Active Workspace Identity (Screenshot 5) ─── */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#101218] p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            ACTIVE WORKSPACE
          </span>
          <span className="flex items-center space-x-1.5 font-mono text-[9px] font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700/60 font-mono text-xs font-bold text-zinc-200">
            {initial}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-white truncate">
              {displayName}
            </h4>
            <p className="text-[10px] text-zinc-400 truncate">
              {headline}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Navigation Groups (Screenshot 5) ─── */}
      <nav className="space-y-5" aria-label="Sidebar Menu">
        
        {/* OVERVIEW */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
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
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
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
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                {experiences.length || 4}
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
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                {projects.length || 4}
              </span>
            </NavLink>
          </div>
        </div>

        {/* BUSINESS HUB */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
            BUSINESS HUB
          </span>
          <div className="space-y-1">
            <NavLink
              id="tab-business-services-btn"
              to="/admin/business/services"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-2.5">
                <Briefcase className="h-4 w-4" />
                <span>Business Catalog & Services</span>
              </div>
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                {services.length || 4}
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
              <span className="rounded-full bg-blue-950 border border-blue-700/50 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-300">
                1 new
              </span>
            </NavLink>
          </div>
        </div>

        {/* CUSTOMIZATION */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
            CUSTOMIZATION
          </span>
          <NavLink
            id="tab-theme-studio-btn-user"
            to={isBusiness ? '/admin/business/theme-studio' : '/admin/theme-studio'}
            className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
          >
            <div className="flex items-center space-x-2.5">
              <Palette className="h-4 w-4" />
              <span>Theme Studio & Live Simulator</span>
            </div>
          </NavLink>
        </div>

        {/* SETTINGS */}
        <div>
          <span className="block px-3 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
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
              className="flex items-center justify-between rounded-xl border border-purple-800/40 bg-purple-950/20 px-3.5 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-950/40 transition"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Superadmin Console</span>
              </div>
              <span className="text-[10px] font-mono">→</span>
            </NavLink>
          </div>
        )}

      </nav>
    </div>
  );
};
