/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { AdminSidebar } from '../organisms/AdminSidebar';
import { useProfile } from '../../hooks/useProfile';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import type { User } from '../../types';
import { Role } from '../../types';
import { Loader2, Globe, Search, Shield } from 'lucide-react';
import { WorkspaceSwitcher } from '../organisms/WorkspaceSwitcher';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  currentUser: User;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBusiness = location.pathname.includes('/business');
  const isSuper = currentUser.role === Role.ADMIN;

  const [searchVal, setSearchVal] = useState<string>('');

  // Conditionally fetch profile, and load businessProfile in background for switcher
  const { data: profile, isLoading: isLoadingProfile } = useProfile({ enabled: !isBusiness });
  const { data: businessProfile, isLoading: isLoadingBusiness } = useBusinessProfile();

  const isLoading = isBusiness ? isLoadingBusiness : isLoadingProfile;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mr-2" />
        <span className="font-sans text-xs">Initializing admin session...</span>
      </div>
    );
  }

  // Determine if active workspace profile is incomplete
  const isProfileIncomplete = isSuper ? false : isBusiness 
    ? (!businessProfile || !businessProfile.businessName)
    : (!profile || !profile.fullName);

  // Determine the correct profile path
  const targetProfilePath = isBusiness ? '/admin/business/profile' : '/admin/profile';

  // Force redirect if incomplete and not already on the profile page
  if (isProfileIncomplete && location.pathname !== targetProfilePath) {
     return <Navigate to={targetProfilePath} replace />;
  }

  // Builder Studio & User Theme Studio use their own full-screen studio layout
  if (location.pathname.startsWith('/admin/templates/builder') || location.pathname.includes('/theme-studio')) {
    return <Outlet />;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUPER_ADMIN (When on superadmin routes or overview)
  // ═══════════════════════════════════════════════════════════════════
  if (isSuper && !location.pathname.includes('/business')) {
    return (
      <div className="flex h-screen w-full bg-[#08090d] text-white font-sans overflow-hidden">
        {/* Fixed Dark Sidebar (Screenshot 4) */}
        <aside className="hidden lg:flex w-[260px] shrink-0">
          <AdminSidebar currentUser={currentUser} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#08090d] relative p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // USER & BUSINESS WORKSPACE (Screenshot 5)
  // ═══════════════════════════════════════════════════════════════════
  const publicPortfolioUrl = `/portfolio/${currentUser.id}`;

  return (
    <div className="min-h-screen bg-[#08090d] text-white font-sans flex flex-col">
      {/* ─── Top Workspace Bar (Screenshot 5) ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c0d12]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          
          {/* Left/Center: Workspace Switcher Dropdown */}
          <WorkspaceSwitcher
            currentUser={{
              name: profile?.fullName || businessProfile?.businessName || currentUser.email,
              email: currentUser.email,
              hasProfile: !!profile,
              hasBusinessProfile: !!currentUser.businessProfile || !!businessProfile || localStorage.getItem('has_business_profile') === 'true',
            }}
            currentWorkspace={isBusiness ? 'BUSINESS' : 'PERSONAL'}
          />

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Quick Find Search */}
            <div className="relative hidden md:block">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Quick Find... ⌘K"
                className="rounded-lg border border-zinc-800 bg-[#12141a] py-1.5 pr-3 pl-8 font-sans text-xs text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-hidden"
              />
            </div>

            {/* Superadmin shortcut button if admin */}
            {isSuper && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-1 rounded-full border border-purple-700/50 bg-purple-950/40 px-3 py-1 font-mono text-xs font-bold text-purple-300 hover:bg-purple-900/40 transition cursor-pointer"
                title="Open Superadmin Console"
              >
                <Shield className="h-3 w-3" />
                <span>Superadmin</span>
              </button>
            )}

            {/* View Live Site */}
            <a
              href={publicPortfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 rounded-full bg-white hover:bg-zinc-200 px-3.5 py-1.5 font-sans text-xs font-bold text-zinc-950 transition active:scale-95 shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>View Live Site</span>
            </a>

            {/* Exit Link */}
            <button
              onClick={() => navigate('/')}
              className="font-sans text-xs font-semibold text-zinc-400 hover:text-white transition px-2 py-1 cursor-pointer"
            >
              Exit
            </button>
          </div>

        </div>
      </header>

      {/* ─── Main Workspace Grid ─── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* SIDEBAR COLUMN */}
          <div className="lg:col-span-3 space-y-6">
            <Sidebar
              currentUser={currentUser}
              profile={profile || undefined}
              businessProfile={businessProfile || undefined}
              isProfileIncomplete={isProfileIncomplete}
            />
          </div>

          {/* MAIN VIEW OUTLET COLUMN */}
          <div className="lg:col-span-9 rounded-2xl border border-zinc-800/80 bg-[#0c0d12] p-6 lg:p-8 shadow-xl min-h-[550px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
