/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { useProfile } from '../../hooks/useProfile';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import type { User } from '../../types';
import { Role } from '../../types';
import {
  Loader2, Search, Bell, ChevronDown,
  Shield, LogOut, Settings as SettingsIcon, ExternalLink
} from 'lucide-react';
import { clearAccessToken } from '../../lib/auth';

interface AdminLayoutProps {
  currentUser: User;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBusiness = location.pathname.includes('/business');
  const isSuper = currentUser.role === Role.ADMIN;

  const [searchVal, setSearchVal] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Conditionally fetch profile, and load businessProfile in background
  const { data: profile, isLoading: isLoadingProfile } = useProfile({ enabled: !isBusiness });
  const { data: businessProfile, isLoading: isLoadingBusiness } = useBusinessProfile();

  const isLoading = isBusiness ? isLoadingBusiness : isLoadingProfile;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-[#69718A] bg-[#FAF8F5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B6CF6] mb-2" />
        <span className="font-sans text-xs font-semibold">Initializing workspace session...</span>
      </div>
    );
  }

  // Determine if active workspace profile is incomplete
  const isActivatingBusiness = location.pathname === '/admin/business/activate';
  const isProfileIncomplete = isSuper
    ? false
    : isActivatingBusiness
    ? false
    : isBusiness
    ? !businessProfile || !businessProfile.businessName
    : !profile || !profile.fullName;

  // Determine the correct profile path
  const targetProfilePath = isBusiness ? '/admin/business/profile' : '/admin/profile';

  // Force redirect if incomplete and not already on the profile page
  if (isProfileIncomplete && location.pathname !== targetProfilePath && !isActivatingBusiness) {
    return <Navigate to={targetProfilePath} replace />;
  }

  // Builder Studio & User Theme Studio use their own full-screen studio layout
  if (
    location.pathname.startsWith('/admin/templates/builder') ||
    location.pathname.includes('/theme-studio')
  ) {
    return <Outlet />;
  }

  // Derive breadcrumbs based on pathname
  const getBreadcrumb = () => {
    const path = location.pathname;
    const isSuperAdminSection =
      isSuper &&
      (path.includes('/users') ||
        path.includes('/templates') ||
        path.includes('/diagnostics') ||
        (path === '/admin/dashboard' && isSuper));

    const workspacePrefix = isBusiness
      ? 'Business workspace'
      : isSuperAdminSection
      ? 'Superadmin Console'
      : 'Personal workspace';

    if (path.includes('/projects')) return `${workspacePrefix} / Projects`;
    if (path.includes('/experiences')) return `${workspacePrefix} / Experiences`;
    if (path.includes('/dashboard')) return `${workspacePrefix} / Overview`;
    if (path.includes('/profile')) return `${workspacePrefix} / My profile`;
    if (path.includes('/services')) return `${workspacePrefix} / Commercial Services`;
    if (path.includes('/templates')) return `${workspacePrefix} / Theme Templates`;
    if (path.includes('/users')) return `${workspacePrefix} / User Directory`;
    if (path.includes('/diagnostics')) return `${workspacePrefix} / System Diagnostics`;
    return `${workspacePrefix} / Dashboard`;
  };

  const publicPortfolioUrl = `/portfolio/${currentUser.id}`;
  const displayName = isBusiness
    ? businessProfile?.businessName || profile?.fullName || 'Creator'
    : profile?.fullName || currentUser.email.split('@')[0] || 'Personal';

  const userAvatar = profile?.profileImage || currentUser.profile?.profileImage;

  const handleLogout = () => {
    clearAccessToken();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#FAF8F5] text-[#202744] font-sans overflow-hidden">
      {/* ─── Fixed Left Sidebar ─── */}
      <Sidebar
        currentUser={currentUser}
        profile={profile || undefined}
        businessProfile={businessProfile || undefined}
        isProfileIncomplete={isProfileIncomplete}
      />

      {/* ─── Main Column: Top Navbar + Scrollable Content ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 border-b border-[#EAE5DD] bg-white px-6 sm:px-8 flex items-center justify-between z-20">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-[#69718A]">
            <span>{getBreadcrumb()}</span>
          </div>

          {/* Center: Search Bar with ⌘ K */}
          <div className="relative max-w-md lg:max-w-lg w-full mx-6 hidden md:block">
            <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8A90A2]" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search anything..."
              className="w-full rounded-2xl border border-[#EAE5DD] bg-white py-2 pl-9 pr-12 font-sans text-xs text-[#202744] placeholder:text-[#8A90A2] focus:border-[#8B6CF6] focus:outline-hidden transition-all shadow-3xs"
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[11px] text-[#8A90A2] select-none">
              ⌘ K
            </span>
          </div>

          {/* Right: Notification Bell & Profile Avatar */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 rounded-xl text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-1.5 rounded-full p-1 hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover border border-[#EAE5DD]"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#E8E0FF] text-[#8B6CF6] font-bold text-xs flex items-center justify-center border border-[#D5C6FF]">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#69718A] transition-transform ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EAE5DD] shadow-xl p-1.5 space-y-1 animate-in fade-in-50 zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-[#F3EFEA]">
                    <p className="font-sans font-bold text-xs text-[#202744] truncate">{displayName}</p>
                    <p className="font-sans text-[11px] text-[#8A90A2] truncate">{currentUser.email}</p>
                  </div>

                  <a
                    href={publicPortfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-[#202744] hover:bg-[#FAF8F5] rounded-xl transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#8B6CF6]" />
                    <span>View Public Portfolio</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate(isBusiness ? '/admin/business/profile' : '/admin/profile');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-[#202744] hover:bg-[#FAF8F5] rounded-xl transition text-left cursor-pointer"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 text-[#69718A]" />
                    <span>Profile Settings</span>
                  </button>

                  {isSuper && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/admin/dashboard');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#8B6CF6] hover:bg-[#F3EEFF] rounded-xl transition text-left cursor-pointer"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Superadmin Console</span>
                    </button>
                  )}

                  <div className="border-t border-[#F3EFEA] pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Scrollable Main Content View ─── */}
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5] p-6 lg:p-8">
          <div className="mx-auto max-w-[1340px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
