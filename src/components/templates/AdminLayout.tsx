/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
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
  const isBusiness = currentUser.role === Role.BUSINESS;

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
  const isProfileIncomplete = isBusiness 
    ? (!businessProfile || !businessProfile.businessName)
    : (!profile || !profile.fullName);

  // Determine the correct profile path
  const targetProfilePath = isBusiness ? '/admin/business/profile' : '/admin/profile';

  // Force redirect if incomplete and not already on the profile page
  if (isProfileIncomplete && location.pathname !== targetProfilePath) {
     return <Navigate to={targetProfilePath} replace />;
  }

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
