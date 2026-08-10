/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProjectType } from '../../types';
import type { Project } from '../../types';
import {
    Briefcase, FolderGit2, Search, Calendar, Github, GraduationCap,
    Sparkles, Code2, Globe, Loader2, Play, Check, Star, User, FileText
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useMyProjects } from '../../hooks/useProjects';
import { getSessionPayload } from '../../lib/auth';
import heroMockup from '../../assets/hero_mockup.png';

export const LandingPage: React.FC = () => {
    // Check login state
    const session = getSessionPayload();
    const isLoggedIn = !!session;

    // Fetch queries from endpoints using React Query hooks
    const { data: profile, isLoading: isProfileLoading } = useProfile({
        enabled: isLoggedIn
    });

    const { data: experiences = [], isLoading: isExperiencesLoading } = useMyExperiences({
        enabled: isLoggedIn
    });

    const { data: projects = [], isLoading: isProjectsLoading } = useMyProjects({
        enabled: isLoggedIn
    });

    const [projectType, setProjectType] = useState<'all' | ProjectType>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const isLoading = isLoggedIn && (isProfileLoading || isExperiencesLoading || isProjectsLoading);

    // Filter out non-public details
    const publicExperiences = useMemo(() => {
        return experiences.filter(exp => exp.isPublic);
    }, [experiences]);

    const publicProjects = useMemo(() => {
        return projects.filter(p => p.isPublic);
    }, [projects]);

    // Filtered Lists
    const filteredExperiences = useMemo(() => {
        return publicExperiences.filter(exp => {
            const matchSearch = !searchQuery ||
                exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchSearch;
        });
    }, [publicExperiences, searchQuery]);

    const filteredProjects = useMemo(() => {
        return publicProjects.filter(proj => {
            const matchType = projectType === 'all' || proj.type === projectType;
            const matchSearch = !searchQuery ||
                proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                proj.techStacks.some(stack => stack.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchType && matchSearch;
        });
    }, [publicProjects, projectType, searchQuery]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white pb-24 text-neutral-900 font-sans">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-white pt-20 pb-16 md:pt-28 md:pb-20">
                    {/* Background Grid Accent */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_80%,transparent_100%)] opacity-70"></div>
                    
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-950 sm:text-6xl md:text-7xl font-sans max-w-4xl mx-auto leading-[1.1] mb-6">
                            Build your portfolio.<br />
                            <span className="text-neutral-900 bg-clip-text">Grow your brand.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-base md:text-lg text-neutral-500 leading-relaxed font-sans font-medium mb-10">
                            Create stunning personal portfolios, business profiles, project showcases, and professional resumes—all in one place.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-sm transition-all active:scale-95 shadow-sm text-center"
                            >
                                Get Started
                            </Link>
                            <button
                                onClick={() => {
                                    const el = document.getElementById('features');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                            >
                                <Play className="h-4 w-4 text-neutral-500 fill-current" />
                                <span>View Demo</span>
                            </button>
                        </div>

                        {/* Large Featured Mockup Image */}
                        <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-50 shadow-2xl transition duration-505 hover:shadow-3xl hover:border-neutral-350">
                            <img
                                src={heroMockup}
                                alt="Portfolio Admin Dashboard Preview"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 border-t border-neutral-100 scroll-mt-16">
                    <div className="text-left mb-16">
                        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                            Everything you need
                        </h2>
                        <p className="mt-3 text-neutral-500 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                            A comprehensive suite of tools to showcase your work.
                        </p>
                    </div>

                    {/* Bento Grid Features Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Card 1: Project Showcase */}
                        <div className="md:col-span-7 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8 shadow-2xs hover:shadow-xs hover:border-neutral-200 transition duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-3xs group-hover:scale-105 transition duration-300">
                                    <FolderGit2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Project Showcase</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    Display your best work with high-resolution galleries, detailed case studies, and interactive elements.
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Personal Portfolio */}
                        <div className="md:col-span-5 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8 shadow-2xs hover:shadow-xs hover:border-neutral-200 transition duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-3xs group-hover:scale-105 transition duration-300">
                                    <User className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Personal Portfolio</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    Tailored templates to highlight your individual skills and career journey.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                        {/* Card 3: Business Profile */}
                        <div className="md:col-span-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8 shadow-2xs hover:shadow-xs hover:border-neutral-200 transition duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-3xs group-hover:scale-105 transition duration-300">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Business Profile</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    Professional layouts designed for agencies and small businesses.
                                </p>
                            </div>
                        </div>

                        {/* Card 4: Resume Builder */}
                        <div className="md:col-span-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8 shadow-2xs hover:shadow-xs hover:border-neutral-200 transition duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-655 text-sky-600 border border-sky-100 shadow-3xs group-hover:scale-105 transition duration-300">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Resume Builder</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    Generate clean, ATS-friendly resumes directly from your profile data.
                                </p>
                            </div>
                        </div>

                        {/* Card 5: Custom Domain */}
                        <div className="md:col-span-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-8 shadow-2xs hover:shadow-xs hover:border-neutral-200 transition duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-3xs group-hover:scale-105 transition duration-300">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Custom Domain</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    Connect your own domain to maintain a consistent brand identity.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 border-t border-neutral-100 scroll-mt-16">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                            Loved by creators worldwide
                        </h2>
                        <p className="mt-3 text-neutral-500 text-base max-w-2xl mx-auto font-medium">
                            See how developers and businesses are showcasing their achievements.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="rounded-2xl border border-neutral-150 bg-white p-8 shadow-3xs hover:shadow-2xs transition duration-300">
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-medium italic">
                                "Folio helped me organize my scattered side projects and career milestones into a single, cohesive timeline. I shared it on LinkedIn and got contacted by three recruiters within a week!"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-205 flex items-center justify-center font-bold text-neutral-700 text-sm">
                                    AR
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900 leading-tight">Alex Rivera</h4>
                                    <p className="text-xs text-neutral-450">Senior Frontend Engineer</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-150 bg-white p-8 shadow-3xs hover:shadow-2xs transition duration-300">
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-neutral-600 text-sm leading-relaxed mb-6 font-medium italic">
                                "As a small digital agency, we needed a neat showcase that wasn't overly complex. Folio let us present our clients' success stories beautifully and cleanly. It's a game changer."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-205 flex items-center justify-center font-bold text-neutral-700 text-sm">
                                    SJ
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900 leading-tight">Sarah Jenkins</h4>
                                    <p className="text-xs text-neutral-450">Creative Director, Pixels & Code</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 border-t border-neutral-100 scroll-mt-16 mb-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                            Simple, transparent pricing
                        </h2>
                        <p className="mt-3 text-neutral-500 text-base max-w-2xl mx-auto font-medium">
                            Choose the plan that fits your professional needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                        {/* Free Tier */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-8 flex flex-col justify-between hover:border-neutral-300 transition duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Developer Starter</h3>
                                <p className="mt-2 text-xs text-neutral-450 font-medium">Perfect for showcasing side projects</p>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-neutral-900">$0</span>
                                    <span className="ml-1 text-sm font-medium text-neutral-455">/month</span>
                                </div>
                                <ul className="mt-8 space-y-4">
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>1 Portfolio Showcase</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Up to 5 Projects</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Standard Template</span>
                                    </li>
                                </ul>
                            </div>
                            <Link to="/register" className="mt-8 block w-full text-center px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs uppercase tracking-wider transition">
                                Choose Free
                            </Link>
                        </div>

                        {/* Pro Tier (Popular) */}
                        <div className="rounded-2xl border-2 border-neutral-900 bg-white p-8 flex flex-col justify-between relative shadow-sm">
                            <div className="absolute top-0 right-8 transform -translate-y-1/2 rounded-full bg-neutral-955 text-white px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider">
                                Popular
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Developer Pro</h3>
                                <p className="mt-2 text-xs text-neutral-450 font-medium">For professional engineers & creators</p>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-neutral-900">$12</span>
                                    <span className="ml-1 text-sm font-medium text-neutral-455">/month</span>
                                </div>
                                <ul className="mt-8 space-y-4">
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Unlimited Showcase Hubs</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Unlimited Projects & Resumes</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Custom Domain Integration</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Premium Premium Templates</span>
                                    </li>
                                </ul>
                            </div>
                            <Link to="/register" className="mt-8 block w-full text-center px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition">
                                Get Pro Now
                            </Link>
                        </div>

                        {/* Agency Tier */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-8 flex flex-col justify-between hover:border-neutral-300 transition duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Agency & Teams</h3>
                                <p className="mt-2 text-xs text-neutral-450 font-medium">For collective portfolios and firms</p>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-neutral-900">$39</span>
                                    <span className="ml-1 text-sm font-medium text-neutral-455">/month</span>
                                </div>
                                <ul className="mt-8 space-y-4">
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Everything in Pro</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Up to 10 Team Members</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Team Collaborative Features</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        <span>Dedicated VIP Support</span>
                                    </li>
                                </ul>
                            </div>
                            <Link to="/register" className="mt-8 block w-full text-center px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs uppercase tracking-wider transition">
                                Choose Agency
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">

            {/* Hero Header */}
            <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-20">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-75"></div>
                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="inline-flex items-center space-x-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5 text-slate-800" />
                        <span>Showcase Hub Directory</span>
                    </div>
                    <h1 className="mt-5 font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                        Developer Showcase Hub <br />
                        <span className="text-black font-black">
                            Explore Community Work
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl font-sans text-sm text-slate-500">
                        Explore professional developer profiles, side projects, commercial web products, and career timelines registered in our sandbox database.
                    </p>
                </div>
            </section>

            {/* Content Display */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-450 animate-in fade-in-50 duration-200">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-400 mb-3" />
                    <p className="font-sans text-xs">Querying database endpoints...</p>
                </div>
            ) : (
                <div className="animate-in fade-in-50 duration-200">
                    {/* Developers Spotlight Panel */}
                    <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
                            <Code2 className="h-4 w-4 text-slate-400" />
                            <span>Developer Profile Spotlight</span>
                        </h2>

                        <div className="max-w-xl">
                            {profile ? (
                                <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-3xs hover:border-slate-300 transition">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={profile.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                            alt={profile.fullName}
                                            className="h-12 w-12 rounded-full object-cover border border-slate-200"
                                        />
                                        <div>
                                            <h3 className="font-sans text-sm font-bold text-slate-900 group-hover:text-black">
                                                {profile.fullName || 'Member Developer'}
                                            </h3>
                                            <p className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                {profile.location || 'Ecosystem Contributor'}
                                            </p>
                                            <p className="mt-2 font-sans text-xs text-slate-500 leading-relaxed">
                                                {profile.bio || 'No personal biography configured yet.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                                        <div className="flex space-x-3 text-slate-400 font-medium">
                                            <span className="flex items-center space-x-1 font-mono">
                                                <Briefcase className="h-3 w-3" />
                                                <span>{publicExperiences.length} exps</span>
                                            </span>
                                            <span className="flex items-center space-x-1 font-mono">
                                                <FolderGit2 className="h-3 w-3" />
                                                <span>{publicProjects.length} projects</span>
                                            </span>
                                        </div>
                                        <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-slate-400">
                                            My Profile
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400 font-sans">
                                    <p className="text-xs">No active developer profile found.</p>
                                </div>
                            )}
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

                            {/* LEFT COLUMN: Career Milestones */}
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
                                        {filteredExperiences.map(exp => (
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
                                                            <p className="font-sans text-xs text-slate-505 font-medium">{exp.company}</p>
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
                                                        <p className="font-sans text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
                                                                <span>My Showcase</span>
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
                </div>
            )}

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
                                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider uppercase text-slate-650">
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
                                            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-slate-650 hover:text-black uppercase tracking-wider text-[10px]"
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
                                            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-slate-650 hover:text-black uppercase tracking-wider text-[10px]"
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

                            <p className="font-sans text-xs text-slate-650 leading-relaxed mb-5 whitespace-pre-wrap">
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
                            <span className="font-sans text-slate-505 text-[11px]">
                                Posted by <strong className="text-slate-800 font-bold">{profile?.fullName || 'Platform Creator'}</strong>
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
