/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { AdminSidebar } from '../organisms/AdminSidebar';
import { useProfile } from '../../hooks/useProfile';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import type { User } from '../../types';
import { Role } from '../../types';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  currentUser: User;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser }) => {
  const location = useLocation();
  const isBusiness = !!currentUser.businessProfile;
  const isSuper = currentUser.role === Role.ADMIN;

  // Conditionally fetch based on role to save bandwidth
  const { data: profile, isLoading: isLoadingProfile } = useProfile({ enabled: !isBusiness });
  const { data: businessProfile, isLoading: isLoadingBusiness } = useBusinessProfile({ enabled: isBusiness });

  const isLoading = isBusiness ? isLoadingBusiness : isLoadingProfile;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500 mr-2" />
        <span className="font-sans text-xs">Initializing admin session...</span>
      </div>
    );
  }

  // Determine if profile is incomplete
  const isProfileIncomplete = isSuper ? false : isBusiness 
    ? (!businessProfile || !businessProfile.businessName)
    : (!profile || !profile.fullName);

  // Determine the correct profile path
  const targetProfilePath = isBusiness ? '/admin/business/profile' : '/admin/profile';

  // Force redirect if incomplete and not already on the profile page
  if (isProfileIncomplete && location.pathname !== targetProfilePath) {
     return <Navigate to={targetProfilePath} replace />;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUPER_ADMIN: Floating Card Layout
  // ═══════════════════════════════════════════════════════════════════
  if (isSuper) {
    return (
      <div className="flex h-screen w-full">
        {/* Fixed Dark Sidebar */}
        <aside className="hidden lg:flex w-[260px] shrink-0">
          <AdminSidebar currentUser={currentUser} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white relative">
          <div className="mx-auto max-w-7xl px-8 py-8 lg:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // USER & BUSINESS: Original sidebar card layout (unchanged)
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* SIDEBAR COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          <Sidebar currentUser={currentUser} profile={profile || undefined} businessProfile={businessProfile || undefined} isProfileIncomplete={isProfileIncomplete} />
        </div>

        {/* MAIN VIEW OUTLET COLUMN */}
        <div className="lg:col-span-9 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
