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
    Users, Briefcase, FolderGit2, TrendingUp,
    ArrowRight, UserPlus, Clock, Shield, Activity,
    ChevronRight
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
    const navigate = useNavigate();

    // Fetch aggregate data
    const { data: usersData, isLoading: isUsersLoading } = useUsers({ page: 1, limit: 1 });
    const { data: experiencesData, isLoading: isExpsLoading } = useAdminExperiences({ limit: 1000 }, { enabled: true });
    const { data: projectsData, isLoading: isProjectsLoading } = useAdminProjects({ limit: 1000 }, { enabled: true });

    // Fetch recent users
    const { data: recentUsersData } = useUsers({ page: 1, limit: 5 });

    const totalUsers = usersData?.meta?.total || 0;
    const totalExperiences = experiencesData?.length || 0;
    const totalProjects = projectsData?.length || 0;

    const recentUsers = recentUsersData?.data || [];

    // Count by role
    const { data: allUsersData } = useUsers({ page: 1, limit: 100 });
    const allUsers = allUsersData?.data || [];
    const adminCount = allUsers.filter(u => u.role === Role.ADMIN).length;
    const userCount = allUsers.filter(u => u.role === Role.USER).length;

    const stats = [
        {
            label: 'Total Users',
            value: isUsersLoading ? '—' : totalUsers,
            icon: Users,
            gradient: 'stat-card-users',
            subtitle: `${adminCount} admin · ${userCount} user`,
        },
        {
            label: 'Experiences',
            value: isExpsLoading ? '—' : totalExperiences,
            icon: Briefcase,
            gradient: 'stat-card-experiences',
            subtitle: 'All user career entries',
        },
        {
            label: 'Projects',
            value: isProjectsLoading ? '—' : totalProjects,
            icon: FolderGit2,
            gradient: 'stat-card-projects',
            subtitle: 'Portfolio projects system-wide',
        },
        {
            label: 'Platform Health',
            value: '●',
            icon: Activity,
            gradient: 'stat-card-services',
            subtitle: 'All systems operational',
        },
    ];

    return (
        <div className="space-y-10 admin-page-enter">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700">Live Overview</span>
                    </div>
                    <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900">
                        Dashboard Overview
                    </h1>
                    <p className="font-sans text-sm text-neutral-500 mt-1 max-w-xl">
                        Welcome back to your command center. Monitor platform metrics, manage active sessions, and oversee user portfolios.
                    </p>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`${stat.gradient} hover-lift relative overflow-hidden rounded-2xl p-6 text-white cursor-pointer`}
                    >
                        {/* Decorative background elements */}
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                        <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
                                    <stat.icon className="h-5 w-5 text-white/90" />
                                </div>
                                <TrendingUp className="h-4 w-4 text-white/50" />
                            </div>
                            <div className="mt-5">
                                <p className={`font-sans text-4xl font-black tracking-tight ${stat.label === 'Platform Health' ? 'text-emerald-300 text-3xl' : ''}`}>
                                    {stat.value}
                                </p>
                                <p className="font-sans text-sm font-semibold text-white/90 mt-1">
                                    {stat.label}
                                </p>
                                <p className="font-sans text-[11px] text-white/60 mt-1">
                                    {stat.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout: Recent Users + Quick Actions */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* Recent Users */}
                <div className="lg:col-span-2 rounded-2xl border border-neutral-200/60 glass-panel-light p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            <h3 className="font-sans text-sm font-bold text-neutral-900 uppercase tracking-wide">
                                Recent Registrations
                            </h3>
                        </div>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="group flex items-center space-x-1.5 rounded-full bg-white px-3 py-1.5 font-sans text-xs font-semibold text-neutral-600 shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-50 hover:text-indigo-600 cursor-pointer"
                        >
                            <span>View all</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50">
                                <Users className="h-8 w-8 text-neutral-300 mb-3" />
                                <p className="text-neutral-500 font-medium text-sm">No users found</p>
                            </div>
                        ) : (
                            recentUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="group flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-5 py-4 transition hover-lift cursor-pointer"
                                    onClick={() => navigate('/admin/users')}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img
                                                src={user.profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                                alt={user.profile?.fullName || user.email}
                                                className="h-11 w-11 rounded-full object-cover ring-2 ring-neutral-100 shadow-sm transition group-hover:ring-indigo-100"
                                            />
                                            {user.role === Role.ADMIN && (
                                                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 ring-2 ring-white">
                                                    <Shield className="h-2.5 w-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-sans text-sm font-bold text-neutral-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                {user.profile?.fullName || 'Anonymous User'}
                                            </p>
                                            <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${user.role === Role.ADMIN ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/50' : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/50'}`}>
                                            <span>{user.role}</span>
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="rounded-2xl border border-neutral-200/60 glass-panel-light p-6 lg:p-8">
                    <h3 className="font-sans text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6">
                        Quick Actions
                    </h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center space-x-4 rounded-xl border border-transparent bg-white p-4 text-left transition hover-lift shadow-sm ring-1 ring-neutral-200 hover:ring-indigo-300 cursor-pointer group"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-sans text-sm font-bold text-neutral-900 group-hover:text-indigo-700 transition-colors">Manage Directory</p>
                                <p className="font-sans text-[11px] text-neutral-500 mt-0.5">Create, edit, or remove accounts</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/experiences')}
                            className="w-full flex items-center space-x-4 rounded-xl border border-transparent bg-white p-4 text-left transition hover-lift shadow-sm ring-1 ring-neutral-200 hover:ring-cyan-300 cursor-pointer group"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-sans text-sm font-bold text-neutral-900 group-hover:text-cyan-700 transition-colors">Audit Experiences</p>
                                <p className="font-sans text-[11px] text-neutral-500 mt-0.5">Review career data globally</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/projects')}
                            className="w-full flex items-center space-x-4 rounded-xl border border-transparent bg-white p-4 text-left transition hover-lift shadow-sm ring-1 ring-neutral-200 hover:ring-amber-300 cursor-pointer group"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                <FolderGit2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-sans text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">Audit Projects</p>
                                <p className="font-sans text-[11px] text-neutral-500 mt-0.5">Browse all user portfolios</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/diagnostics')}
                            className="w-full flex items-center space-x-4 rounded-xl border border-transparent bg-white p-4 text-left transition hover-lift shadow-sm ring-1 ring-neutral-200 hover:ring-purple-300 cursor-pointer group"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-sans text-sm font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">System Diagnostics</p>
                                <p className="font-sans text-[11px] text-neutral-500 mt-0.5">Run API & server health checks</p>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
