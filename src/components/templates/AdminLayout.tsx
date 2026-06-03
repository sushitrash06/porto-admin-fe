/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { useProfile } from '../../hooks/useProfile';
import type { User } from '../../types';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  currentUser: User;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser }) => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500 mr-2" />
        <span className="font-sans text-xs">Initializing admin session...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* SIDEBAR COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          <Sidebar currentUser={currentUser} profile={profile} />
        </div>

        {/* MAIN VIEW OUTLET COLUMN */}
        <div className="lg:col-span-9 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
