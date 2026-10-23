/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import type { User, Profile, BusinessProfile } from '../../types';
import { Role } from '../../types';
import {
  LayoutGrid, LayoutDashboard, User as UserIcon, Briefcase, Folder,
  FolderGit2, Palette, Code2, Sliders, HelpCircle, Sparkles,
  ChevronsUpDown, Check, LogOut, Shield, Users, Plus
} from 'lucide-react';
import { BrandIcon } from '../atoms/BrandLogo';
import { clearAccessToken } from '../../lib/auth';
import { useUsers } from '../../hooks/useUsers';

interface SidebarProps {
  currentUser: User;
  profile?: Profile;
  businessProfile?: BusinessProfile;
  isProfileIncomplete?: boolean;
}

type WorkspaceMode = 'SUPERADMIN' | 'PERSONAL' | 'BUSINESS';

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  profile,
  businessProfile,
  isProfileIncomplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSuper = currentUser.role === Role.ADMIN;
  const hasBusiness = !!businessProfile;

  // Determine active workspace mode based on route
  const currentPath = location.pathname;
  let activeMode: WorkspaceMode = 'PERSONAL';

  if (currentPath.startsWith('/admin/business')) {
    activeMode = 'BUSINESS';
  } else if (
    isSuper &&
    (currentPath === '/admin/users' ||
      currentPath.startsWith('/admin/templates') ||
      currentPath === '/admin/diagnostics' ||
      (currentPath === '/admin/dashboard' && isSuper))
  ) {
    activeMode = 'SUPERADMIN';
  } else {
    activeMode = 'PERSONAL';
  }

  // Live user count for superadmin badge
  const { data: usersData } = useUsers(isSuper ? { page: 1, limit: 1 } : { page: 1, limit: 0 });
  const totalUsers = usersData?.meta?.total ?? 0;

  // Close workspace dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    if (isWorkspaceMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWorkspaceMenuOpen]);

  const handleLogout = () => {
    clearAccessToken();
    navigate('/login');
  };

  const handleSwitchWorkspace = (mode: WorkspaceMode) => {
    setIsWorkspaceMenuOpen(false);
    if (mode === 'SUPERADMIN') {
      navigate('/admin/dashboard');
    } else if (mode === 'PERSONAL') {
      navigate('/admin/projects');
    } else {
      if (hasBusiness) {
        navigate('/admin/business/dashboard');
      } else {
        navigate('/admin/business/activate');
      }
    }
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs transition-all duration-150 ${
      isActive
        ? 'bg-[#E8E0FF] text-[#5533CC] font-bold shadow-3xs'
        : 'text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] font-medium'
    }`;

  const disabledLinkStyle =
    'flex items-center space-x-3 rounded-xl px-3.5 py-2.5 font-sans text-xs font-medium transition-all opacity-40 pointer-events-none text-slate-300';

  const displayName =
    activeMode === 'BUSINESS'
      ? businessProfile?.businessName || profile?.fullName || 'Creator Studio'
      : profile?.fullName || currentUser.email.split('@')[0] || 'Personal';

  const userAvatar = profile?.profileImage || currentUser.profile?.profileImage;

  return (
    <aside className="w-[260px] shrink-0 h-full border-r border-[#EAE5DD] bg-white flex flex-col justify-between select-none">
      {/* ─── Top Brand & Navigation Section ─── */}
      <div className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin scrollbar-thumb-[#EAE5DD]">
        {/* Brand Logo Header */}
        <div className="px-3 pb-5 flex items-center space-x-2.5">
          <BrandIcon size={30} />
          <span className="font-sans font-extrabold text-base tracking-tight text-[#202744]">
            foliowalaweh
          </span>
        </div>

        {/* ─── Workspace Dropdown ─── */}
        <div className="px-1 mb-5" ref={dropdownRef}>
          <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-[#8A90A2] mb-1.5">
            YOUR WORKSPACE
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F4F0FF] border border-[#E0D5FF] text-[#202744] hover:bg-[#ECE3FF] transition text-xs font-semibold cursor-pointer shadow-3xs"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-[#8B6CF6] text-white flex items-center justify-center shrink-0">
                  {activeMode === 'SUPERADMIN' ? (
                    <Shield className="w-3 h-3" />
                  ) : activeMode === 'BUSINESS' ? (
                    <Briefcase className="w-3 h-3" />
                  ) : (
                    <UserIcon className="w-3 h-3" />
                  )}
                </div>
                <span className="truncate">
                  {activeMode === 'SUPERADMIN'
                    ? 'Superadmin Console'
                    : activeMode === 'BUSINESS'
                    ? 'Business Studio'
                    : 'Personal Portfolio'}
                </span>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#8B6CF6] shrink-0" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#EAE5DD] rounded-xl shadow-lg p-1.5 space-y-1">
                {/* Superadmin Workspace Option */}
                {isSuper && (
                  <button
                    type="button"
                    onClick={() => handleSwitchWorkspace('SUPERADMIN')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      activeMode === 'SUPERADMIN'
                        ? 'bg-[#E8E0FF] text-[#5533CC] font-bold'
                        : 'text-[#202744] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="w-3.5 h-3.5 text-[#8B6CF6]" />
                      <span>Superadmin Console</span>
                    </div>
                    {activeMode === 'SUPERADMIN' && <Check className="w-3.5 h-3.5 text-[#8B6CF6]" />}
                  </button>
                )}

                {/* Personal Workspace Option */}
                <button
                  type="button"
                  onClick={() => handleSwitchWorkspace('PERSONAL')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    activeMode === 'PERSONAL'
                      ? 'bg-[#E8E0FF] text-[#5533CC] font-bold'
                      : 'text-[#202744] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Personal workspace</span>
                  </div>
                  {activeMode === 'PERSONAL' && <Check className="w-3.5 h-3.5 text-[#8B6CF6]" />}
                </button>

                {/* Business Workspace Option */}
                <button
                  type="button"
                  onClick={() => handleSwitchWorkspace('BUSINESS')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    activeMode === 'BUSINESS'
                      ? 'bg-[#E8E0FF] text-[#5533CC] font-bold'
                      : 'text-[#202744] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{hasBusiness ? 'Business workspace' : '+ Activate Business'}</span>
                  </div>
                  {activeMode === 'BUSINESS' && <Check className="w-3.5 h-3.5 text-[#8B6CF6]" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Visual Workspace Mode Indicator for Admins ─── */}
        {isSuper && activeMode === 'SUPERADMIN' && (
          <div className="px-1 mb-3">
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#202744] to-[#2B3556] text-white flex items-center justify-between text-[11px] font-bold shadow-3xs border border-[#3E4A74]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FFC45B]" />
                <span>Superadmin Mode</span>
              </div>
              <span className="text-[9px] font-mono uppercase bg-[#8B6CF6] text-white px-1.5 py-0.5 rounded font-bold">
                Console
              </span>
            </div>
          </div>
        )}

        {isSuper && activeMode === 'PERSONAL' && (
          <div className="px-1 mb-3">
            <div className="px-3 py-1.5 rounded-xl bg-[#F4F0FF] text-[#5533CC] border border-[#D5C6FF] flex items-center justify-between text-[11px] font-bold shadow-3xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <UserIcon className="w-3.5 h-3.5 text-[#8B6CF6] shrink-0" />
                <span className="truncate">Personal Portfolio</span>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchWorkspace('SUPERADMIN')}
                className="text-[10px] font-bold text-[#8B6CF6] hover:text-[#5533CC] transition underline shrink-0 cursor-pointer"
              >
                Admin ↗
              </button>
            </div>
          </div>
        )}

        {/* ─── Mode 1: SUPERADMIN NAVIGATION MENU ─── */}
        {activeMode === 'SUPERADMIN' && (
          <div className="space-y-1 px-1">
            <div className="px-2 pt-2 pb-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A]">
                SUPER ADMIN PANEL
              </span>
            </div>

            <NavLink to="/admin/dashboard" end className={linkStyle}>
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                <span>Dashboard Overview</span>
              </div>
            </NavLink>

            <NavLink to="/admin/users" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                <span>User Management</span>
              </div>
              {totalUsers > 0 && (
                <span className="rounded-full bg-[#FAF8F5] border border-[#E5E1DA] px-2 py-0.5 font-mono text-[10px] font-bold text-[#69718A]">
                  {totalUsers}
                </span>
              )}
            </NavLink>

            {/* Theme Templates with "+ New" quick action button and sub-navigation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <NavLink
                  to="/admin/templates"
                  className={({ isActive }) =>
                    `flex-1 flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs transition-all duration-150 ${
                      isActive || location.pathname.startsWith('/admin/templates')
                        ? 'bg-[#E8E0FF] text-[#5533CC] font-bold shadow-3xs'
                        : 'text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] font-medium'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Palette className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                    <span>Theme Templates</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/templates/builder"
                  title="Create New Template"
                  className="px-2 py-2 rounded-xl bg-[#8B6CF6] hover:bg-[#7857ED] text-white transition active:scale-95 shadow-3xs cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </NavLink>
              </div>

              {/* Sub-menu when in Templates area */}
              {location.pathname.startsWith('/admin/templates') && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  <NavLink
                    to="/admin/templates"
                    end
                    className={({ isActive }) =>
                      `block px-3 py-1.5 rounded-lg text-[11px] font-sans transition ${
                        isActive
                          ? 'bg-[#F4F0FF] text-[#5533CC] font-bold'
                          : 'text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5]'
                      }`
                    }
                  >
                    • Catalog & Blueprints
                  </NavLink>
                  <NavLink
                    to="/admin/templates/builder"
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-sans transition ${
                        isActive
                          ? 'bg-[#8B6CF6] text-white font-bold'
                          : 'text-[#8B6CF6] hover:bg-[#F4F0FF] font-semibold'
                      }`
                    }
                  >
                    <span>+ New Template Builder</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/20">Studio</span>
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/admin/experiences" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                <span>Experiences Watch</span>
              </div>
            </NavLink>

            <NavLink to="/admin/projects" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <FolderGit2 className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                <span>Projects Watch</span>
              </div>
            </NavLink>

            <NavLink to="/admin/diagnostics" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                <span>System Diagnostics</span>
              </div>
            </NavLink>

            <NavLink to="/admin/profile" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Sliders className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                <span>Admin Profile</span>
              </div>
            </NavLink>
          </div>
        )}

        {/* ─── Mode 2: BUSINESS NAVIGATION MENU ─── */}
        {activeMode === 'BUSINESS' && (
          <div className="space-y-1 px-1">
            <div className="px-2 pt-2 pb-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A]">
                BUSINESS WORKSPACE
              </span>
            </div>

            <NavLink to="/admin/business/dashboard" end className={linkStyle}>
              <div className="flex items-center space-x-3">
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span>Business Overview</span>
              </div>
            </NavLink>

            <NavLink to="/admin/business/profile" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>Company Profile</span>
              </div>
            </NavLink>

            <NavLink to="/admin/business/services" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Commercial Services</span>
              </div>
            </NavLink>

            <NavLink to="/admin/business/projects" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <FolderGit2 className="h-4 w-4 shrink-0" />
                <span>Case Studies</span>
              </div>
            </NavLink>

            <NavLink to="/admin/business/theme-studio" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <Palette className="h-4 w-4 shrink-0" />
                <span>Business Theme</span>
              </div>
            </NavLink>
          </div>
        )}

        {/* ─── Mode 3: PERSONAL NAVIGATION MENU ─── */}
        {activeMode === 'PERSONAL' && (
          <div className="space-y-1 px-1">
            <div className="px-2 pt-2 pb-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A]">
                PERSONAL WORKSPACE
              </span>
            </div>

            <NavLink to="/admin/dashboard" end className={linkStyle}>
              <div className="flex items-center space-x-3">
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span>Overview & Analytics</span>
              </div>
            </NavLink>

            <NavLink id="tab-profile-btn-user" to="/admin/profile" className={linkStyle}>
              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 shrink-0" />
                <span>My Profile & CV</span>
              </div>
            </NavLink>

            <NavLink
              id="tab-experiences-btn-user"
              to="/admin/experiences"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>Experiences</span>
              </div>
            </NavLink>

            <NavLink
              id="tab-projects-btn-user"
              to="/admin/projects"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-3">
                <Folder className="h-4 w-4 shrink-0" />
                <span>Projects</span>
              </div>
            </NavLink>

            <NavLink
              id="tab-theme-studio-btn-user"
              to="/admin/theme-studio"
              className={isProfileIncomplete ? disabledLinkStyle : linkStyle}
            >
              <div className="flex items-center space-x-3">
                <Palette className="h-4 w-4 shrink-0" />
                <span>Theme Studio {isSuper ? '(Personal)' : ''}</span>
              </div>
            </NavLink>
          </div>
        )}

        {/* ─── BUILD & CONNECT Section (Personal / Business) ─── */}
        {activeMode !== 'SUPERADMIN' && (
          <div className="mt-6 px-1">
            <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-[#8A90A2] mb-1.5">
              BUILD & CONNECT
            </span>
            <div className="space-y-1">
              <NavLink to="/admin/profile#api" className={linkStyle}>
                <div className="flex items-center space-x-3">
                  <Code2 className="h-4 w-4 shrink-0" />
                  <span>Developer API</span>
                </div>
              </NavLink>

              <NavLink
                to={activeMode === 'BUSINESS' ? '/admin/business/profile' : '/admin/profile'}
                className={linkStyle}
              >
                <div className="flex items-center space-x-3">
                  <Sliders className="h-4 w-4 shrink-0" />
                  <span>Settings & Security</span>
                </div>
              </NavLink>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 rounded-xl px-3.5 py-2.5 font-sans text-xs font-medium text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] transition-all"
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span>Help & inspiration</span>
              </a>
            </div>
          </div>
        )}

        {/* ─── Promo Card ("Make room for your next big idea.") ─── */}
        {activeMode !== 'SUPERADMIN' && (
          <div className="mt-6 mx-1 rounded-2xl p-4 bg-gradient-to-b from-[#F2EDFF] to-[#EAE0FF] border border-[#E0D5FF] space-y-1.5 shadow-3xs">
            <span className="block text-[10px] font-bold text-[#8B6CF6] tracking-wide">
              A little more possibility
            </span>
            <h4 className="text-xs font-bold text-[#202744] leading-snug">
              Make room for your next big idea.
            </h4>
            <p className="text-[11px] text-[#69718A] leading-relaxed">
              Custom domains, more projects, and a story that's truly yours.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(activeMode === 'BUSINESS' ? '/admin/business/profile' : '/admin/profile')
              }
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7857ED] text-white py-2 px-3 text-xs font-bold transition shadow-xs mt-2.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Pro</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Bottom User Profile Tile ─── */}
      <div className="p-3 border-t border-[#EAE5DD] bg-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full object-cover border border-[#EAE5DD] shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#E8E0FF] text-[#8B6CF6] font-bold text-xs flex items-center justify-center border border-[#D5C6FF] shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-sans text-xs font-bold text-[#202744] truncate">
              {displayName}
            </p>
            <p className="font-sans text-[10px] text-[#8A90A2] truncate">
              {activeMode === 'SUPERADMIN'
                ? 'Superadmin Console'
                : activeMode === 'BUSINESS'
                ? 'Business workspace'
                : 'Personal workspace'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 text-[#8A90A2] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
