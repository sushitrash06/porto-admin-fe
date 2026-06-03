/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { User, Experience, Project } from '../../types';
import { ProjectType, Role } from '../../types';
import { Briefcase, FolderGit2, Search, Calendar, Github, GraduationCap, Sparkles, Code2, Globe } from 'lucide-react';
import { getUsers, getExperiences, getProjects, initializeDB } from '../../utils/db';

export const LandingPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        initializeDB();
        setUsers(getUsers());
        setExperiences(getExperiences());
        setProjects(getProjects());
    }, []);

    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [projectType, setProjectType] = useState<'all' | ProjectType>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Filter out non-public details
    const publicUsers = useMemo(() => {
        // Only show active user profiles that are regular users or have existing public experiences/projects
        return users.filter(u => u.role !== Role.SUPER_ADMIN || u.id === 'user-admin');
    }, [users]);

    const publicExperiences = useMemo(() => {
        return experiences.filter(exp => exp.isPublic);
    }, [experiences]);

    const publicProjects = useMemo(() => {
        return projects.filter(p => p.isPublic);
    }, [projects]);


    // Filtered Lists
    const filteredExperiences = useMemo(() => {
        return publicExperiences.filter(exp => {
            const matchUser = selectedUser === 'all' || exp.userId === selectedUser;
            const matchSearch = !searchQuery ||
                exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchUser && matchSearch;
        });
    }, [publicExperiences, selectedUser, searchQuery]);

    const filteredProjects = useMemo(() => {
        return publicProjects.filter(proj => {
            const matchUser = selectedUser === 'all' || proj.userId === selectedUser;
            const matchType = projectType === 'all' || proj.type === projectType;
            const matchSearch = !searchQuery ||
                proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                proj.techStacks.some(stack => stack.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchUser && matchType && matchSearch;
        });
    }, [publicProjects, selectedUser, projectType, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">

            {/* Hero Header */}
            <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-75"></div>
                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="inline-flex items-center space-x-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5 text-slate-800" />
                        <span>Developer Sandbox Ecosystem</span>
                    </div>
                    <h1 className="mt-5 font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                        Sleek Portfolios Built <br />
                        <span className="text-black font-black">
                            With Pure Engineering Craft
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl font-sans text-sm text-slate-500">
                        A centralized platform for developers to host their professional experiences, open-source utilities, and commercial projects. Login to administer directories.
                    </p>
                </div>
            </section>

            {/* Developers Spotlight Panel */}
            <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-slate-400" />
                    <span>Our Featured Creators</span>
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {publicUsers.filter(u => u.role !== Role.SUPER_ADMIN).map(user => {
                        const userProjectsCount = publicProjects.filter(p => p.userId === user.id).length;
                        const userExpsCount = publicExperiences.filter(e => e.userId === user.id).length;
                        const isTarget = selectedUser === user.id;

                        return (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(isTarget ? 'all' : user.id)}
                                className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${isTarget
                                        ? 'border-black bg-white ring-2 ring-slate-950/5 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={user.profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                        alt={user.profile?.fullName || user.email}
                                        className="h-12 w-12 rounded-full object-cover border border-slate-200"
                                    />
                                    <div>
                                        <h3 className="font-sans text-sm font-bold text-slate-900 group-hover:text-black">
                                            {user.profile?.fullName || 'Full Account'}
                                        </h3>
                                        <p className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                            {user.profile?.location || 'Indonesian Developer'}
                                        </p>
                                        <p className="mt-2 line-clamp-2 font-sans text-xs text-slate-500 leading-relaxed">
                                            {user.profile?.bio || 'No personal biography configured yet.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                                    <div className="flex space-x-3 text-slate-400 font-medium">
                                        <span className="flex items-center space-x-1 font-mono">
                                            <Briefcase className="h-3 w-3" />
                                            <span>{userExpsCount} exps</span>
                                        </span>
                                        <span className="flex items-center space-x-1 font-mono">
                                            <FolderGit2 className="h-3 w-3" />
                                            <span>{userProjectsCount} projects</span>
                                        </span>
                                    </div>
                                    <span className={`font-sans font-bold uppercase tracking-wider text-[10px] ${isTarget ? 'text-black underline underline-offset-4' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                        {isTarget ? 'Filter Active' : 'Explore'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Main Filter Suite */}
            <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="landing-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by company, position, project title, or technologies..."
                                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Core Controls */}
                        <div className="flex flex-wrap items-center gap-2.5">

                            {/* Creator Pill indicator */}
                            {selectedUser !== 'all' && (
                                <button
                                    onClick={() => setSelectedUser('all')}
                                    className="inline-flex items-center space-x-1.5 rounded-md border border-slate-200 bg-black px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-colors"
                                >
                                    <span>Creator: {users.find(u => u.id === selectedUser)?.profile?.fullName}</span>
                                    <span className="font-bold">×</span>
                                </button>
                            )}

                            {/* Type toggle */}
                            <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
                                <button
                                    onClick={() => setProjectType('all')}
                                    className={`rounded-md px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${projectType === 'all' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-400 hover:text-slate-900'
                                        }`}
                                >
                                    All Projects
                                </button>
                                <button
                                    onClick={() => setProjectType(ProjectType.WORK)}
                                    className={`rounded-md px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${projectType === ProjectType.WORK ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-400 hover:text-slate-900'
                                        }`}
                                >
                                    Work Project
                                </button>
                                <button
                                    onClick={() => setProjectType(ProjectType.PERSONAL)}
                                    className={`rounded-md px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${projectType === ProjectType.PERSONAL ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-400 hover:text-slate-900'
                                        }`}
                                >
                                    Personal
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Split Portfolio Visualizer */}
            <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

                    {/* LEFT COLUMN: Career Timelines */}
                    <div className="lg:col-span-5">
                        <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span>Career Milestones</span>
                        </h2>

                        {filteredExperiences.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
                                <GraduationCap className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                <p className="font-sans text-xs">No career milestones published on this profile.</p>
                            </div>
                        ) : (
                            <div className="relative border-l border-slate-200 pl-5 ml-2.5 space-y-6">
                                {filteredExperiences.map(exp => {
                                    const owner = users.find(u => u.id === exp.userId);
                                    return (
                                        <div key={exp.id} className="relative group/timeline">
                                            {/* Timeline Node Circle */}
                                            <span className="absolute -left-[25px] top-1.5 flex h-2.5 w-2.5 rounded-full bg-white border border-slate-400 group-hover/timeline:bg-black transition-colors"></span>

                                            <div className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-3xs transition hover:border-slate-300">
                                                {/* Company Logo and Details */}
                                                <div className="flex items-center space-x-3 mb-2.5">
                                                    {exp.companyLogo ? (
                                                        <img
                                                            src={exp.companyLogo}
                                                            alt={exp.company}
                                                            referrerPolicy="no-referrer"
                                                            className="h-9 w-9 rounded-md object-cover bg-slate-50 border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-50 font-mono text-[10px] font-bold text-slate-400 border border-slate-100">
                                                            {exp.company.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-sans text-sm font-bold text-slate-900 leading-tight">{exp.position}</h4>
                                                        <p className="font-sans text-xs text-slate-500 font-medium">{exp.company}</p>
                                                    </div>
                                                </div>

                                                {/* Date badge */}
                                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase mb-3">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <span>{exp.startDate}</span>
                                                    <span>—</span>
                                                    <span className={!exp.endDate ? 'text-emerald-600 font-semibold text-[10px]' : ''}>
                                                        {exp.endDate || 'Active Now'}
                                                    </span>
                                                </div>

                                                {/* Description Text */}
                                                {exp.description && (
                                                    <p className="font-sans text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                        {exp.description}
                                                    </p>
                                                )}

                                                {/* Sync badge detailing who this represents */}
                                                <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[9px]">
                                                    <span className="font-mono text-slate-400 uppercase tracking-widest font-bold">Contributor</span>
                                                    <span className="font-sans font-bold uppercase text-[9px] text-slate-600">
                                                        {owner?.profile?.fullName || owner?.email.split('@')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Interactive Projects Showroom */}
                    <div className="lg:col-span-7">
                        <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
                            <FolderGit2 className="h-4 w-4 text-slate-400" />
                            <span>Project Showcases</span>
                        </h2>

                        {filteredProjects.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
                                <Code2 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                                <p className="font-sans text-xs">No public projects discoverable under your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {filteredProjects.map(proj => {
                                    const owner = users.find(u => u.id === proj.userId);
                                    const linkedExp = experiences.find(e => e.id === proj.experienceId);

                                    return (
                                        <div
                                            key={proj.id}
                                            onClick={() => setSelectedProject(proj)}
                                            className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-3xs transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-2xs"
                                        >
                                            {/* Image Thumbnail Header */}
                                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                                                {proj.thumbnail ? (
                                                    <img
                                                        src={proj.thumbnail}
                                                        alt={proj.title}
                                                        referrerPolicy="no-referrer"
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-900/5 text-slate-300">
                                                        <FolderGit2 className="h-8 w-8 stroke-1" />
                                                    </div>
                                                )}
                                                <span className={`absolute top-2.5 right-2.5 rounded-md px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase border border-slate-200 text-slate-500 bg-white shadow-3xs`}>
                                                    {proj.type === ProjectType.WORK ? '💼 Work' : '☕ Personal'}
                                                </span>
                                            </div>

                                            {/* Info Panel */}
                                            <div className="flex flex-1 flex-col justify-between p-4">
                                                <div>
                                                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                                                        <span>{owner?.profile?.fullName || 'Developer'}</span>
                                                        {linkedExp && (
                                                            <span className="text-slate-500 truncate max-w-[120px]" title={`At ${linkedExp.company}`}>
                                                                @{linkedExp.company}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="font-sans text-sm font-bold text-slate-900 group-hover:text-black leading-snug">
                                                        {proj.title}
                                                    </h3>

                                                    {proj.description && (
                                                        <p className="mt-2 line-clamp-2 font-sans text-xs text-slate-500 leading-relaxed">
                                                            {proj.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Tech Stacks list */}
                                                <div className="mt-4 border-t border-slate-100 pt-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {proj.techStacks.slice(0, 3).map((badge, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded-md bg-slate-50 border border-slate-200/50 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-500"
                                                            >
                                                                {badge}
                                                            </span>
                                                        ))}
                                                        {proj.techStacks.length > 3 && (
                                                            <span className="rounded-md bg-slate-50 border border-slate-200 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                                                                +{proj.techStacks.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* Detailed Slide-Over or Modal for exploring a single project */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition">
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">

                        {/* Header banner image */}
                        <div className="relative aspect-video w-full bg-slate-950">
                            {selectedProject.thumbnail ? (
                                <img
                                    src={selectedProject.thumbnail}
                                    alt={selectedProject.title}
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover opacity-90"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-500">
                                    <FolderGit2 className="h-12 w-12" />
                                </div>
                            )}
                            {/* Close Button */}
                            <button
                                id="close-modal-btn"
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white hover:bg-slate-900 active:scale-95 cursor-pointer text-lg font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Contents details */}
                        <div className="p-6">

                            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center space-x-2">
                                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider uppercase text-slate-600">
                                        {selectedProject.type === ProjectType.WORK ? 'Work Assignment' : 'Personal Project'}
                                    </span>
                                    {selectedProject.role && (
                                        <span className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 font-sans text-[10px] font-semibold text-slate-500">
                                            Role: {selectedProject.role}
                                        </span>
                                    )}
                                </div>

                                {/* External links */}
                                <div className="flex items-center space-x-3">
                                    {selectedProject.projectUrl && (
                                        <a
                                            href={selectedProject.projectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-slate-600 hover:text-black uppercase tracking-wider text-[10px]"
                                        >
                                            <Globe className="h-3.5 w-3.5" />
                                            <span>Live App</span>
                                        </a>
                                    )}
                                    {selectedProject.githubUrl && (
                                        <a
                                            href={selectedProject.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-slate-600 hover:text-black uppercase tracking-wider text-[10px]"
                                        >
                                            <Github className="h-3.5 w-3.5" />
                                            <span>Code Repository</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-sans text-lg font-bold text-slate-900 mb-2">
                                {selectedProject.title}
                            </h3>

                            <p className="font-sans text-xs text-slate-600 leading-relaxed mb-5 whitespace-pre-wrap">
                                {selectedProject.description || 'No descriptive context was provided.'}
                            </p>

                            {/* Technologies Tag Panel */}
                            <div>
                                <h4 className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Applied Tech Stack
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {selectedProject.techStacks.map((tech, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-500 cursor-default uppercase"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer containing quick author bio summary */}
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between text-xs">
                            <span className="font-sans text-slate-500 text-[11px]">
                                Posted by <strong className="text-slate-800 font-bold">{users.find(u => u.id === selectedProject.userId)?.profile?.fullName || 'Platform Creator'}</strong>
                            </span>
                            <button
                                id="close-project-modal-bottom-btn"
                                onClick={() => setSelectedProject(null)}
                                className="rounded-md bg-black px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                            >
                                Dismiss Details
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};
