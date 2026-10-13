/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import {
    LayoutDashboard, Users, Briefcase, FolderGit2,
    Shield, Settings, LogOut, Palette, Layers
} from 'lucide-react';
import { clearAccessToken } from '../../lib/auth';
import { useUsers } from '../../hooks/useUsers';

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
        showUserCount: true,
    },
    {
        label: 'System Diagnostics',
        path: '/admin/diagnostics',
        icon: Shield,
    },
    {
        label: 'Theme Templates',
        path: '/admin/templates',
        icon: Palette,
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
        <div className="flex h-full flex-col bg-[#090a0f] text-zinc-300 admin-sidebar border-r border-zinc-800/80 overflow-y-auto">
            {/* Superadmin Console Brand Header */}
            <div className="px-5 py-6 border-b border-zinc-800/60">
                <div className="flex items-center space-x-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-inner">
                        <Layers className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="font-sans text-base font-bold text-white tracking-wide block leading-none">
                            Foliowalaweh
                        </span>
                        <span className="mt-1 inline-block font-mono text-[9px] font-bold text-purple-400 tracking-wider uppercase bg-purple-950/50 px-1.5 py-0.2 rounded border border-purple-800/30">
                            SUPERADMIN CONSOLE
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Administration Section */}
            <div className="px-5 pt-5 pb-2">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    CORE ADMINISTRATION
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
                            `group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs font-medium transition-all ${isActive
                                ? 'bg-[#1a1c24] text-white font-semibold shadow-xs'
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center space-x-3">
                                    <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {item.showUserCount && (
                                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-400">
                                        {totalUsers}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Info / Logout at Bottom */}
            <div className="p-4 border-t border-zinc-800/60">
                <div className="flex items-center space-x-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-bold text-xs">
                        {currentUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs font-semibold text-white truncate">
                            {currentUser.email.split('@')[0]}
                        </p>
                        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                            v4.0.0
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                        title="Logout"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
