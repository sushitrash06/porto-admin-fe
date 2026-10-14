/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import {
  LayoutDashboard, Users, Briefcase, FolderGit2,
  Shield, Settings, LogOut, Palette
} from 'lucide-react';
import { clearAccessToken } from '../../lib/auth';
import { useUsers } from '../../hooks/useUsers';
import { BrandLogo } from '../atoms/BrandLogo';

interface AdminSidebarProps {
  currentUser: User;
}

const navItems = [
  {
    label: 'Dashboard Overview',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    showUserCount: true,
  },
  {
    label: 'Theme Templates',
    path: '/admin/templates',
    icon: Palette,
  },
  {
    label: 'System Diagnostics',
    path: '/admin/diagnostics',
    icon: Shield,
  },
  {
    label: 'Experiences',
    path: '/admin/experiences',
    icon: Briefcase,
  },
  {
    label: 'Projects',
    path: '/admin/projects',
    icon: FolderGit2,
  },
  {
    label: 'My Profile',
    path: '/admin/profile',
    icon: Settings,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const { data: usersData } = useUsers({ page: 1, limit: 1 });
  const totalUsers = usersData?.meta?.total ?? 6;

  const handleLogout = () => {
    clearAccessToken();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="flex h-full flex-col bg-white text-[#202744] border-r border-[#EAE5DD] overflow-y-auto font-sans shadow-xs">
      {/* Superadmin Console Brand Header */}
      <div className="px-5 py-5 border-b border-[#F0EBE3]">
        <div className="flex flex-col space-y-2">
          <BrandLogo size="sm" to="/" showTagline={false} />
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#E8E0FF] border border-[#D5C6FF] px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#5533CC]">
            <Shield className="h-3 w-3 text-[#8B6CF6]" />
            <span>Superadmin Console</span>
          </div>
        </div>
      </div>

      {/* Core Administration Section */}
      <div className="px-5 pt-5 pb-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A]">
          CORE MANAGEMENT
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin/dashboard'}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#E8E0FF] text-[#5533CC] font-bold shadow-3xs'
                  : 'text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#8B6CF6]' : 'text-[#69718A] group-hover:text-[#202744]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.showUserCount && (
                  <span className="rounded-full bg-[#FAF8F5] border border-[#E5E1DA] px-2 py-0.5 font-mono text-[10px] font-bold text-[#69718A]">
                    {totalUsers}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info / Logout at Bottom */}
      <div className="p-4 border-t border-[#F0EBE3]">
        <div className="flex items-center space-x-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E1DA] p-3 shadow-3xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6] font-bold text-xs shadow-xs">
            {currentUser.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-xs font-bold text-[#202744] truncate">
              {currentUser.email.split('@')[0]}
            </p>
            <p className="font-mono text-[9px] text-[#69718A] uppercase tracking-wider">
              Superadmin
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#69718A] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
