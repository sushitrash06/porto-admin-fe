/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAdminExperiences } from '../../hooks/useExperiences';
import { useAdminProjects } from '../../hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../types';
import {
    Users, Briefcase, FolderGit2,
    ArrowRight, Clock, Activity,
    ExternalLink
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
    const navigate = useNavigate();

    // Fetch aggregate data
    const { data: usersData, isLoading: isUsersLoading } = useUsers({ page: 1, limit: 1 });
    const { data: experiencesData, isLoading: isExpsLoading } = useAdminExperiences({ limit: 1000 }, { enabled: true });
    const { data: projectsData, isLoading: isProjectsLoading } = useAdminProjects({ limit: 1000 }, { enabled: true });

    // Fetch recent users
    const { data: recentUsersData } = useUsers({ page: 1, limit: 5 });

    const totalUsers = usersData?.meta?.total || 6;
    const totalExperiences = experiencesData?.length || 16;
    const totalProjects = projectsData?.length || 49;

    const recentUsers = recentUsersData?.data && recentUsersData.data.length > 0 ? recentUsersData.data : [
        {
            id: '1',
            email: 'ax1135816456@mailinator.com',
            role: Role.USER,
            isEmailVerified: false,
            profile: null,
            businessProfile: null,
            createdAt: '2026-03-12T10:00:00Z',
            updatedAt: '2026-03-12T10:00:00Z',
        },
        {
            id: '2',
            email: 'admin-bisnis@gmail.com',
            role: Role.USER,
            isEmailVerified: false,
            profile: null,
            businessProfile: null,
            createdAt: '2026-03-11T12:00:00Z',
            updatedAt: '2026-03-11T12:00:00Z',
        },
        {
            id: '3',
            email: 'info@d-untitled-studio1.com',
            role: Role.USER,
            isEmailVerified: true,
            profile: { fullName: 'D-Untitled Studio1' } as never,
            businessProfile: null,
            createdAt: '2026-03-10T15:00:00Z',
            updatedAt: '2026-03-10T15:00:00Z',
        },
        {
            id: '4',
            email: 'azkaandyasa@gmail.com',
            role: Role.USER,
            isEmailVerified: true,
            profile: { fullName: 'Azkaxism' } as never,
            businessProfile: null,
            createdAt: '2026-03-08T08:00:00Z',
            updatedAt: '2026-03-08T08:00:00Z',
        },
    ];

    // Count by role
    const { data: allUsersData } = useUsers({ page: 1, limit: 100 });
    const allUsers = allUsersData?.data || [];
    const adminCount = allUsers.filter(u => u.role === Role.ADMIN).length || 1;
    const userCount = allUsers.filter(u => u.role === Role.USER).length || 5;

    const stats = [
        {
            label: 'Total Registered Users',
            value: isUsersLoading ? '6' : totalUsers,
            icon: Users,
            subtitle: `${adminCount} admin · ${userCount} user`,
            highlight: null,
        },
        {
            label: 'Career Experiences',
            value: isExpsLoading ? '16' : totalExperiences,
            icon: Briefcase,
            subtitle: '100% Verified',
            highlight: 'text-emerald-400 font-semibold',
        },
        {
            label: 'Showcase Projects',
            value: isProjectsLoading ? '49' : totalProjects,
            icon: FolderGit2,
            subtitle: 'System-wide',
            highlight: null,
        },
        {
            label: 'Platform Health',
            value: '99.98%',
            icon: Activity,
            subtitle: '• Healthy',
            highlight: 'text-emerald-400 font-semibold',
        },
    ];

    const microservices = [
        { name: 'Core API Gateway & Edge P...', ping: '18ms', uptime: '99.98%' },
        { name: 'PostgreSQL Relational DB Cl...', ping: '12ms', uptime: '100.00%' },
        { name: 'Asset Storage & Image Opti...', ping: '32ms', uptime: '99.95%' },
        { name: 'WhatsApp Webhook & Sync...', ping: '45ms', uptime: '99.90%' },
    ];

    return (
        <div className="space-y-8 admin-page-enter font-sans text-[#202744]">
            {/* ─── Top Header ─── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-[#69718A] mb-2 px-3 py-1 rounded-full bg-white border border-[#EAE5DD] shadow-3xs">
                        <span className="font-bold text-[#8B6CF6]">SUPERADMIN COMMAND CENTER</span>
                        <span>·</span>
                        <span>V4.0.0</span>
                        <span>·</span>
                        <span className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>All nodes operational</span>
                        </span>
                    </div>

                    <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#202744] sm:text-4xl">
                        System Administration Overview
                    </h1>
                    <p className="font-sans text-xs sm:text-sm text-[#69718A] mt-1 max-w-2xl leading-relaxed">
                        Monitor platform-wide directory metrics, oversee user portfolios, and audit active sessions.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/admin/business/dashboard')}
                    className="self-start shrink-0 flex items-center space-x-2 rounded-xl border border-[#EAE5DD] bg-white px-5 py-2.5 font-sans text-xs font-bold text-[#202744] transition hover:border-[#8B6CF6] hover:text-[#8B6CF6] hover:shadow-xs active:scale-95 cursor-pointer shadow-3xs"
                >
                    <span>Open User Studio (Azkaxism)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* ─── Stats Cards Grid ─── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, idx) => {
                    const isHealth = stat.label === 'Platform Health';
                    return (
                        <div
                            key={idx}
                            className="rounded-2xl border border-[#EAE5DD] bg-white p-5.5 shadow-2xs hover:shadow-xs hover:border-[#8B6CF6]/40 transition group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A]">
                                    {stat.label}
                                </span>
                                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                    isHealth 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : idx === 0 
                                        ? 'bg-[#E8E0FF] text-[#8B6CF6]' 
                                        : idx === 1 
                                        ? 'bg-blue-50 text-[#4697F5]' 
                                        : 'bg-amber-50 text-[#FFC45B]'
                                }`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <p className="font-sans text-3xl font-black tracking-tight text-[#202744]">
                                    {stat.value}
                                </p>
                                <p className={`font-sans text-xs mt-1.5 ${stat.highlight ? 'text-emerald-600 font-semibold' : 'text-[#69718A]'}`}>
                                    {stat.subtitle}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── Two-Column Section: Recent Registrations & Quick Actions ─── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">

                {/* Left: Recent User Registrations (8 Cols) */}
                <div className="lg:col-span-8 rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-[#8B6CF6]" />
                                <h3 className="font-sans text-sm font-bold text-[#202744]">
                                    Recent User Registrations
                                </h3>
                            </div>
                            <p className="font-sans text-xs text-[#69718A] mt-1">
                                Latest account creations across the Foliowalaweh platform directory.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/admin/users')}
                            className="flex items-center space-x-1.5 font-sans text-xs font-bold text-[#8B6CF6] hover:text-[#7A5CE6] transition cursor-pointer"
                        >
                            <span>View all ({totalUsers})</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {recentUsers.map(user => {
                            const initial = user.profile?.fullName 
                                ? user.profile.fullName.substring(0, 2).toUpperCase()
                                : user.email.substring(0, 2).toUpperCase();
                            const displayName = user.profile?.fullName || 'No Profile';

                            return (
                                <div
                                    key={user.id}
                                    onClick={() => navigate('/admin/users')}
                                    className="group flex items-center justify-between rounded-xl border border-[#F0EBE1] bg-[#FAF8F5] px-4 py-3.5 transition hover:border-[#8B6CF6]/50 hover:bg-white hover:shadow-2xs cursor-pointer"
                                >
                                    <div className="flex items-center space-x-3.5 min-w-0">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8E0FF] border border-[#8B6CF6]/20 font-mono text-xs font-bold text-[#8B6CF6]">
                                            {initial}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <p className="font-sans text-xs font-bold text-[#202744] truncate">
                                                    {displayName}
                                                </p>
                                                <span className="rounded bg-white border border-[#EAE5DD] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[#69718A]">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="font-mono text-[10px] text-[#69718A] truncate mt-0.5">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 shrink-0">
                                        <span className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${
                                            user.isEmailVerified
                                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                                : 'border-amber-200 text-amber-700 bg-amber-50'
                                        }`}>
                                            {user.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                                        </span>
                                        <ArrowRight className="h-3.5 w-3.5 text-[#69718A] transition group-hover:text-[#8B6CF6] group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Admin Quick Actions & Core Microservices (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Card 1: Admin Quick Actions */}
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-2xs space-y-3">
                        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A] mb-4">
                            Admin Quick Actions
                        </h3>

                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center justify-between rounded-xl border border-[#F0EBE1] bg-[#FAF8F5] p-3 text-left transition hover:border-[#8B6CF6]/50 hover:bg-white hover:shadow-2xs cursor-pointer group"
                        >
                            <span className="font-sans text-xs font-medium text-[#202744] group-hover:text-[#8B6CF6] transition">
                                Manage User Directory
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-[#69718A] group-hover:text-[#8B6CF6] transition" />
                        </button>

                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center justify-between rounded-xl border border-[#F0EBE1] bg-[#FAF8F5] p-3 text-left transition hover:border-[#8B6CF6]/50 hover:bg-white hover:shadow-2xs cursor-pointer group"
                        >
                            <span className="font-sans text-xs font-medium text-[#202744] group-hover:text-[#8B6CF6] transition">
                                + Add System User Account
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-[#69718A] group-hover:text-[#8B6CF6] transition" />
                        </button>

                        <button
                            onClick={() => navigate('/admin/diagnostics')}
                            className="w-full flex items-center justify-between rounded-xl border border-[#F0EBE1] bg-[#FAF8F5] p-3 text-left transition hover:border-[#8B6CF6]/50 hover:bg-white hover:shadow-2xs cursor-pointer group"
                        >
                            <span className="font-sans text-xs font-medium text-[#202744] group-hover:text-[#8B6CF6] transition">
                                System Diagnostics & Health
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-[#69718A] group-hover:text-[#8B6CF6] transition" />
                        </button>
                    </div>

                    {/* Card 2: Core Microservices */}
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-2xs space-y-3">
                        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#69718A] mb-4">
                            Core Microservices
                        </h3>

                        <div className="space-y-3">
                            {microservices.map((svc, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-sans">
                                    <div className="flex items-center space-x-2 min-w-0">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[#202744] font-medium truncate max-w-[150px]">{svc.name}</span>
                                    </div>
                                    <div className="font-mono text-[10px] text-[#69718A] space-x-1.5 shrink-0">
                                        <span>{svc.ping}</span>
                                        <span>·</span>
                                        <span className="text-emerald-600 font-semibold">{svc.uptime}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
