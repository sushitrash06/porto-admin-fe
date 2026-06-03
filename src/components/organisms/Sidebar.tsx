/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import type { User, Profile } from '../../types';
import { Role } from '../../types';
import { Users, Briefcase, FolderGit2, ShieldCheck, UserCheck, Shield } from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  profile?: Profile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, profile }) => {
  const isSuper = currentUser.role === Role.SUPER_ADMIN;

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-neutral-900 text-white shadow-sm font-bold'
        : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
    }`;

  return (
    <div className="space-y-6">
      {/* Account Identity Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col items-center text-center">
          <img
            src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={profile?.fullName || currentUser.email}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-neutral-100 shadow-xs"
          />
          <h3 className="mt-3 font-sans text-sm font-bold text-neutral-900 leading-none">
            {profile?.fullName || 'Sandbox Member'}
          </h3>
          <p className="mt-1 font-sans text-xs text-neutral-400">
            {currentUser.email}
          </p>

          <div className="mt-3.5 inline-flex items-center space-x-1 rounded-full bg-neutral-900 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
            <ShieldCheck className="h-3 w-3" />
            <span>{currentUser.role} Control</span>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-4 text-xs">
          {profile?.location && (
            <p className="flex items-center justify-between text-neutral-500 py-1 font-sans">
              <span className="font-medium">Station:</span>
              <span className="font-semibold text-neutral-800">{profile.location}</span>
            </p>
          )}

          <p className="flex items-center justify-between text-neutral-500 py-1 font-sans">
            <span className="font-medium">Privilege:</span>
            <span className="font-semibold text-neutral-800 text-right">
              {isSuper ? 'Management & Audit' : 'Read/Write CRUD'}
            </span>
          </p>
        </div>
      </div>

      {/* Sidebar Menu Toggles */}
      <nav className="space-y-1.5" aria-label="Sidebar Menu">
        {isSuper ? (
          /* Superadmin options */
          <>
            <NavLink id="tab-users-btn" to="/admin/users" className={linkStyle}>
              <Users className="h-4 w-4" />
              <span>User Management (CRUD)</span>
            </NavLink>

            <NavLink id="tab-experiences-btn" to="/admin/experiences" className={linkStyle}>
              <Briefcase className="h-4 w-4" />
              <span>Experiences (Audit only)</span>
            </NavLink>

            <NavLink id="tab-projects-btn" to="/admin/projects" className={linkStyle}>
              <FolderGit2 className="h-4 w-4" />
              <span>Projects (Audit only)</span>
            </NavLink>

            <NavLink id="tab-profile-btn" to="/admin/profile" className={linkStyle}>
              <UserCheck className="h-4 w-4" />
              <span>My Profile Settings</span>
            </NavLink>

            <NavLink id="tab-diagnostics-btn" to="/admin/diagnostics" className={linkStyle}>
              <Shield className="h-4 w-4" />
              <span>System Diagnostics</span>
            </NavLink>
          </>
        ) : (
          /* Standard User options */
          <>
            <NavLink id="tab-experiences-btn-user" to="/admin/experiences" className={linkStyle}>
              <Briefcase className="h-4 w-4" />
              <span>My Experiences (CRUD)</span>
            </NavLink>

            <NavLink id="tab-projects-btn-user" to="/admin/projects" className={linkStyle}>
              <FolderGit2 className="h-4 w-4" />
              <span>My Projects (CRUD)</span>
            </NavLink>
            
            <NavLink id="tab-profile-btn-user" to="/admin/profile" className={linkStyle}>
              <UserCheck className="h-4 w-4" />
              <span>My Profile Settings</span>
            </NavLink>

            <NavLink id="tab-diagnostics-btn-user" to="/admin/diagnostics" className={linkStyle}>
              <Shield className="h-4 w-4" />
              <span>System Diagnostics</span>
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};
