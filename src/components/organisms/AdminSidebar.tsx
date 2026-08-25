/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import {
    LayoutDashboard, Users, Briefcase, FolderGit2,
    Shield, Settings, LogOut, ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { clearAccessToken } from '../../lib/auth';

interface AdminSidebarProps {
    currentUser: User;
}

const navItems = [
    {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'User Management',
        path: '/admin/users',
        icon: Users,
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
    {
        label: 'System Diagnostics',
        path: '/admin/diagnostics',
        icon: Shield,
    },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAccessToken();
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="flex h-full flex-col bg-[#27273f] text-slate-300 admin-sidebar overflow-y-auto">
            {/* User Profile Header (Optional, but let's keep a brand header) */}
            <div className="px-6 py-8">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                        <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <span className="font-sans text-lg font-bold text-white tracking-wide">
                        PortoAdmin
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-3 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin/dashboard'}
                        className={({ isActive }) =>
                            `group relative flex items-center space-x-3 rounded-lg px-4 py-3 font-sans text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white"></div>
                                )}
                                
                                <item.icon className={`h-[18px] w-[18px] transition-colors ${
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                                }`} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Info / Logout at Bottom */}
            <div className="p-4 mb-4">
                <div className="flex items-center space-x-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <span className="font-sans text-xs font-bold text-white uppercase">
                            {currentUser.email.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs font-semibold text-white truncate">
                            {currentUser.email.split('@')[0]}
                        </p>
                        <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                            v4.0.0
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-red-400 transition cursor-pointer"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
