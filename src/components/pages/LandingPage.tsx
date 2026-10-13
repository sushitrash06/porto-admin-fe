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
    Sparkles, Code2, Globe, Loader2, Star,
    ArrowRight, ExternalLink, Shield, Monitor, ShoppingBag,
    PhoneCall, MessageSquare, Check, ShieldCheck, Building2
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useMyProjects } from '../../hooks/useProjects';
import { getSessionPayload } from '../../lib/auth';

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
    const [mockupView, setMockupView] = useState<'developer' | 'business'>('developer');

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
            <div className="min-h-screen bg-[#08090d] text-white font-sans selection:bg-indigo-500 selection:text-white">
                {/* ─── Hero Section ─── */}
                <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
                    {/* Ambient glow accent */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,rgba(168,85,247,0.05)_45%,transparent_70%)] pointer-events-none blur-2xl" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        
                        {/* Eyebrow Pill Tag */}
                        <div className="inline-flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 shadow-inner backdrop-blur-md mb-8">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-sans text-xs font-semibold text-zinc-200">
                                Foliowalaweh Studio 2.0
                            </span>
                            <span className="text-zinc-600 font-mono text-xs">·</span>
                            <span className="font-sans text-xs text-zinc-400">
                                Personal Portfolio & Business Catalog
                            </span>
                        </div>

                        {/* Main Typography Header */}
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl font-sans max-w-4xl mx-auto leading-[1.08] mb-6">
                            Build your portfolio.<br />
                            <span className="text-white">Grow your digital brand.</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-base md:text-lg text-zinc-400 leading-relaxed font-sans font-normal mb-10">
                            The minimalist portfolio management platform with dual-engine flexibility: showcase verified engineering milestones, or launch a client-ready business catalog with 1-click WhatsApp quote routing.
                        </p>
                        
                        {/* Call to Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                            >
                                <span>Start Building Free</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            
                            <button
                                onClick={() => {
                                    const el = document.getElementById('features');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-6 py-3 rounded-full border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-inner"
                            >
                                <span>Explore Live Showcase</span>
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                            </button>

                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-6 py-3 rounded-full border border-purple-800/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-inner"
                            >
                                <Shield className="h-4 w-4 text-purple-300" />
                                <span>Superadmin Console</span>
                            </Link>
                        </div>

                        {/* Trust Microcopy */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 font-sans mb-14">
                            <span className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-zinc-400" />
                                <span>No credit card required</span>
                            </span>
                            <span className="text-zinc-700 hidden sm:inline">·</span>
                            <span className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-zinc-400" />
                                <span>Real-time Live Simulator</span>
                            </span>
                            <span className="text-zinc-700 hidden sm:inline">·</span>
                            <span className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-zinc-400" />
                                <span>WhatsApp Lead Sync</span>
                            </span>
                        </div>

                        {/* ─── Interactive Mock Browser Window (Screenshot 2) ─── */}
                        <div className="relative mx-auto max-w-4xl rounded-2xl md:rounded-3xl border border-zinc-800/90 bg-[#0d0f14] shadow-2xl overflow-hidden text-left">
                            {/* Window Chrome Header Bar */}
                            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-[#12141a] px-4 py-3 sm:px-6">
                                <div className="flex items-center space-x-2">
                                    <span className="h-3 w-3 rounded-full bg-zinc-700" />
                                    <span className="h-3 w-3 rounded-full bg-zinc-700" />
                                    <span className="h-3 w-3 rounded-full bg-zinc-700" />
                                    <span className="ml-3 font-mono text-xs text-zinc-400">
                                        foliowalaweh.app/azkaxism
                                    </span>
                                </div>

                                {/* Toggle Tabs */}
                                <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setMockupView('developer')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                                            mockupView === 'developer'
                                                ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        Developer Portfolio View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMockupView('business')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                                            mockupView === 'business'
                                                ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        Business Catalog View
                                    </button>
                                </div>
                            </div>

                            {/* Window Content Body */}
                            <div className="p-6 sm:p-8 space-y-5">
                                {mockupView === 'developer' ? (
                                    <>
                                        {/* Profile Card */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-[#15171e] p-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
                                                    AZ
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">
                                                        Azkaxism
                                                    </h3>
                                                    <p className="text-xs text-zinc-400">
                                                        Senior Frontend Engineer & Design Architect
                                                    </p>
                                                    <div className="flex items-center space-x-1.5 mt-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                        <span className="text-[11px] font-semibold text-emerald-400">
                                                            Available for contract & hiring
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                to="/register"
                                                className="shrink-0 px-4 py-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs transition active:scale-95 text-center shadow-xs"
                                            >
                                                View Live Portfolio
                                            </Link>
                                        </div>

                                        {/* Experience Cards Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-zinc-800/80 bg-[#15171e] p-4.5">
                                                <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                                                    LATEST ROLE · ACTIVE NOW
                                                </span>
                                                <h4 className="font-bold text-sm text-white mt-1">
                                                    Associate Application Developer (Frontend)
                                                </h4>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    PT Metrodata Electronics Tbk · Nov 2024 – Present
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-zinc-800/80 bg-[#15171e] p-4.5">
                                                <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                                                    FINTECH EXPERIENCE
                                                </span>
                                                <h4 className="font-bold text-sm text-white mt-1">
                                                    Frontend Developer
                                                </h4>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    Sapphire Skyscraper Financial Technology Pte Ltd
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Business Mode Profile Card */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-[#15171e] p-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                                    <Building2 className="h-7 w-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">
                                                        Azkaxism Digital Agency
                                                    </h3>
                                                    <p className="text-xs text-zinc-400">
                                                        High-Performance Web Apps, Design Systems & Catalogs
                                                    </p>
                                                    <div className="flex items-center space-x-1.5 mt-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                        <span className="text-[11px] font-semibold text-emerald-400">
                                                            Open for Q2 commercial client projects
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                to="/register"
                                                className="shrink-0 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95 text-center shadow-xs flex items-center justify-center gap-1.5"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                <span>WhatsApp Quote</span>
                                            </Link>
                                        </div>

                                        {/* Business Catalog Packages */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-zinc-800/80 bg-[#15171e] p-4.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                                                        POPULAR SERVICE · 2-3 WEEKS
                                                    </span>
                                                    <span className="font-mono text-[10px] font-bold text-emerald-400">Rp 14.500.000</span>
                                                </div>
                                                <h4 className="font-bold text-sm text-white mt-1">
                                                    MVP Fast-Track Web Application
                                                </h4>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    Full-Stack Vite + NestJS + PostgreSQL with ready-to-demo architecture.
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-zinc-800/80 bg-[#15171e] p-4.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                                                        COMMERCIAL CATALOG
                                                    </span>
                                                    <span className="font-mono text-[10px] font-bold text-emerald-400">Rp 8.000.000</span>
                                                </div>
                                                <h4 className="font-bold text-sm text-white mt-1">
                                                    Interactive Digital Catalog & Showcase
                                                </h4>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    Transform products into high-converting portfolio with direct WhatsApp leads.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </section>

                {/* ─── Features Section (Screenshot 3: Architectural Versatility) ─── */}
                <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 border-t border-zinc-800/60 scroll-mt-16">
                    <div className="text-center mb-16">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400">
                            ARCHITECTURAL VERSATILITY
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl mt-3">
                            Everything you need to showcase & sell.
                        </h2>
                        <p className="mt-4 text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                            Stop juggling disjointed Notion docs, PDF resumes, and messy portfolio templates. Foliowalaweh unifies your professional presence.
                        </p>
                    </div>

                    {/* Bento Grid Layout (Screenshot 3) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Card 1: Live Theme Studio */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7 transition duration-300 hover:border-zinc-700 hover:-translate-y-1">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400 shadow-inner">
                                <Monitor className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                Live Theme Studio & Simulator
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Reorder layout sections on the fly, pick aesthetic tokens (Obsidian, Monolith, Indigo), and preview instantly on desktop, tablet, and mobile viewports.
                            </p>
                        </div>

                        {/* Card 2: Business Catalog & Rate Cards */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7 transition duration-300 hover:border-zinc-700 hover:-translate-y-1">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-800/50 text-blue-400 shadow-inner">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                Business Catalog & Rate Cards
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Transform your portfolio into an active sales machine. Publish transparent service packages, turnaround times, and direct WhatsApp quote templates.
                            </p>
                        </div>

                        {/* Card 3: Career Milestones & Chronology */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7 transition duration-300 hover:border-zinc-700 hover:-translate-y-1">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400 shadow-inner">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                Career Milestones & Chronology
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Log detailed employment history, verified dates, bullet point achievements, and tech stack tags in both timeline cards and compact tabular view.
                            </p>
                        </div>

                        {/* Card 4: Superadmin RBAC & Audits */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7 transition duration-300 hover:border-zinc-700 hover:-translate-y-1">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 shadow-inner">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                Superadmin RBAC & Audits
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Enterprise-grade user management, verification toggles, system telemetry diagnostics, and real-time security audit trails.
                            </p>
                        </div>

                        {/* Card 5: Direct WhatsApp & Email Lead Pipeline */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7 transition duration-300 hover:border-zinc-700 hover:-translate-y-1 md:col-span-2 lg:col-span-2">
                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-950/60 border border-teal-800/50 text-teal-400 shadow-inner">
                                <PhoneCall className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                Direct WhatsApp & Email Lead Pipeline
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                When prospective clients submit inquiries on your public portfolio, leads arrive instantly in your unified inbox with 1-click WhatsApp follow-ups.
                            </p>
                        </div>

                    </div>
                </section>

                {/* ─── Testimonials Section ─── */}
                <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/60">
                    <div className="text-center mb-14">
                        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                            Trusted by developers & agencies
                        </h2>
                        <p className="mt-2 text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto">
                            See how creators are landing high-ticket clients with Foliowalaweh.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7">
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                ))}
                            </div>
                            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal italic">
                                "Foliowalaweh helped me organize my scattered side projects and career milestones into a single, cohesive timeline. I shared it on LinkedIn and got contacted by three recruiters within a week!"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 text-xs">
                                    AR
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white leading-tight">Alex Rivera</h4>
                                    <p className="text-[11px] text-zinc-500">Senior Frontend Engineer</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-7">
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                ))}
                            </div>
                            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal italic">
                                "As a small digital agency, we needed a neat showcase that wasn't overly complex. Foliowalaweh let us present our clients' success stories beautifully and cleanly. It's a game changer."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-xs">
                                    SJ
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white leading-tight">Sarah Jenkins</h4>
                                    <p className="text-[11px] text-zinc-500">Creative Director, Pixels & Code</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LOGGED-IN SHOWCASE HUB VIEW (RESTYLED WITH OBSIDIAN DARK THEME)
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#08090d] pb-20 text-white font-sans">

            {/* Hero Header */}
            <section className="relative overflow-hidden border-b border-zinc-800/80 bg-[#0c0d12] py-14 sm:py-16">
                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="inline-flex items-center space-x-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Showcase Hub Directory</span>
                    </div>
                    <h1 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Developer Showcase Hub <br />
                        <span className="text-zinc-400 font-bold">
                            Explore Community Work
                        </span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl font-sans text-xs sm:text-sm text-zinc-400">
                        Explore professional developer profiles, side projects, commercial web products, and career timelines registered in our sandbox database.
                    </p>
                </div>
            </section>

            {/* Content Display */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 animate-in fade-in-50 duration-200">
                    <Loader2 className="h-9 w-9 animate-spin text-zinc-400 mb-3" />
                    <p className="font-sans text-xs">Querying database endpoints...</p>
                </div>
            ) : (
                <div className="animate-in fade-in-50 duration-200">
                    {/* Developers Spotlight Panel */}
                    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center space-x-2">
                            <Code2 className="h-4 w-4 text-zinc-400" />
                            <span>Developer Profile Spotlight</span>
                        </h2>

                        <div className="max-w-xl">
                            {profile ? (
                                <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#0f1117] p-5 transition hover:border-zinc-700">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={profile.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                            alt={profile.fullName}
                                            className="h-12 w-12 rounded-xl object-cover border border-zinc-700"
                                        />
                                        <div>
                                            <h3 className="font-sans text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                {profile.fullName || 'Member Developer'}
                                            </h3>
                                            <p className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                                                {profile.location || 'Ecosystem Contributor'}
                                            </p>
                                            <p className="mt-2 font-sans text-xs text-zinc-400 leading-relaxed">
                                                {profile.bio || 'No personal biography configured yet.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px]">
                                        <div className="flex space-x-3 text-zinc-500 font-medium">
                                            <span className="flex items-center space-x-1 font-mono">
                                                <Briefcase className="h-3 w-3" />
                                                <span>{publicExperiences.length} exps</span>
                                            </span>
                                            <span className="flex items-center space-x-1 font-mono">
                                                <FolderGit2 className="h-3 w-3" />
                                                <span>{publicProjects.length} projects</span>
                                            </span>
                                        </div>
                                        <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-zinc-500">
                                          My Profile
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-800 bg-[#0f1117] p-6 text-center text-zinc-500 font-sans">
                                    <p className="text-xs">No active developer profile found.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Main Filter Suite */}
                    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#0f1117] p-4 sm:p-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                {/* Search Input */}
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        id="landing-search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by company, position, project title, or technologies..."
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pr-4 pl-10 font-sans text-xs focus:border-indigo-500 focus:outline-hidden transition-all text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                {/* Core Controls */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="flex rounded-xl border border-zinc-800 bg-zinc-900 p-1">
                                        <button
                                            onClick={() => setProjectType('all')}
                                            className={`rounded-lg px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                                projectType === 'all'
                                                    ? 'bg-zinc-800 text-white shadow-xs'
                                                    : 'text-zinc-500 hover:text-white'
                                            }`}
                                        >
                                            All Projects
                                        </button>
                                        <button
                                            onClick={() => setProjectType(ProjectType.WORK)}
                                            className={`rounded-lg px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                                projectType === ProjectType.WORK
                                                    ? 'bg-zinc-800 text-white shadow-xs'
                                                    : 'text-zinc-500 hover:text-white'
                                            }`}
                                        >
                                            Work Project
                                        </button>
                                        <button
                                            onClick={() => setProjectType(ProjectType.PERSONAL)}
                                            className={`rounded-lg px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                                projectType === ProjectType.PERSONAL
                                                    ? 'bg-zinc-800 text-white shadow-xs'
                                                    : 'text-zinc-500 hover:text-white'
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
                                <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center space-x-2">
                                    <Briefcase className="h-4 w-4 text-zinc-400" />
                                    <span>Career Milestones</span>
                                </h2>

                                {filteredExperiences.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0f1117] p-8 text-center text-zinc-500">
                                        <GraduationCap className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                                        <p className="font-sans text-xs">No career milestones published on this profile.</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-zinc-800 pl-5 ml-2.5 space-y-6">
                                        {filteredExperiences.map(exp => (
                                            <div key={exp.id} className="relative group/timeline">
                                                <span className="absolute -left-[25px] top-1.5 flex h-2.5 w-2.5 rounded-full bg-zinc-900 border border-zinc-600 group-hover/timeline:bg-indigo-500 transition-colors" />

                                                <div className="rounded-2xl border border-zinc-800/80 bg-[#0f1117] p-5 transition hover:border-zinc-700">
                                                    <div className="flex items-center space-x-3 mb-2.5">
                                                        {exp.companyLogo ? (
                                                            <img
                                                                src={exp.companyLogo}
                                                                alt={exp.company}
                                                                referrerPolicy="no-referrer"
                                                                className="h-9 w-9 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                                                            />
                                                        ) : (
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 font-mono text-[10px] font-bold text-zinc-400 border border-zinc-800">
                                                                {exp.company.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h4 className="font-sans text-sm font-bold text-white leading-tight">{exp.position}</h4>
                                                            <p className="font-sans text-xs text-zinc-400 font-medium">{exp.company}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-500 uppercase mb-3">
                                                        <Calendar className="h-3 w-3 text-zinc-500" />
                                                        <span>{exp.startDate}</span>
                                                        <span>—</span>
                                                        <span className={!exp.endDate ? 'text-emerald-400 font-semibold' : ''}>
                                                            {exp.endDate || 'Active Now'}
                                                        </span>
                                                    </div>

                                                    {exp.description && (
                                                        <p className="font-sans text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: Projects Showroom */}
                            <div className="lg:col-span-7">
                                <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center space-x-2">
                                    <FolderGit2 className="h-4 w-4 text-zinc-400" />
                                    <span>Project Showcases</span>
                                </h2>

                                {filteredProjects.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#0f1117] p-12 text-center text-zinc-500">
                                        <Code2 className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
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
                                                    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0f1117] transition hover:-translate-y-1 hover:border-zinc-700 shadow-md"
                                                >
                                                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-zinc-800">
                                                        {proj.thumbnail ? (
                                                            <img
                                                                src={proj.thumbnail}
                                                                alt={proj.title}
                                                                referrerPolicy="no-referrer"
                                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                                                                <FolderGit2 className="h-8 w-8 stroke-1" />
                                                            </div>
                                                        )}
                                                        <span className="absolute top-2.5 right-2.5 rounded-md px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase border border-zinc-700 text-zinc-300 bg-zinc-900/90 shadow-xs backdrop-blur-md">
                                                            {proj.type === ProjectType.WORK ? '💼 Work' : '☕ Personal'}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-1 flex-col justify-between p-4.5">
                                                        <div>
                                                            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-500 uppercase mb-1.5 tracking-wider">
                                                                <span>My Showcase</span>
                                                                {linkedExp && (
                                                                    <span className="text-zinc-400 truncate max-w-[120px]" title={`At ${linkedExp.company}`}>
                                                                        @{linkedExp.company}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <h3 className="font-sans text-sm font-bold text-white group-hover:text-indigo-300 leading-snug">
                                                                {proj.title}
                                                            </h3>

                                                            {proj.description && (
                                                                <p className="mt-2 line-clamp-2 font-sans text-xs text-zinc-400 leading-relaxed">
                                                                    {proj.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Tech Stacks */}
                                                        <div className="mt-4 border-t border-zinc-800/80 pt-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {proj.techStacks.slice(0, 3).map((badge, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-400"
                                                                    >
                                                                        {badge}
                                                                    </span>
                                                                ))}
                                                                {proj.techStacks.length > 3 && (
                                                                    <span className="rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
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

            {/* Modal for exploring a single project */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition">
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0e1015] text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                        <div className="relative aspect-video w-full bg-zinc-950">
                            {selectedProject.thumbnail ? (
                                <img
                                    src={selectedProject.thumbnail}
                                    alt={selectedProject.title}
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover opacity-90"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-zinc-600">
                                    <FolderGit2 className="h-12 w-12" />
                                </div>
                            )}
                            <button
                                id="close-modal-btn"
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-zinc-800 active:scale-95 cursor-pointer text-lg font-bold border border-zinc-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 border-b border-zinc-800/80 pb-3">
                                <div className="flex items-center space-x-2">
                                    <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider uppercase text-zinc-300">
                                        {selectedProject.type === ProjectType.WORK ? 'Work Assignment' : 'Personal Project'}
                                    </span>
                                    {selectedProject.role && (
                                        <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 font-sans text-[10px] font-semibold text-zinc-400">
                                            Role: {selectedProject.role}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3">
                                    {selectedProject.projectUrl && (
                                        <a
                                            href={selectedProject.projectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider text-[10px]"
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
                                            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider text-[10px]"
                                        >
                                            <Github className="h-3.5 w-3.5" />
                                            <span>Code Repository</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-sans text-lg font-bold text-white mb-2">
                                {selectedProject.title}
                            </h3>

                            <p className="font-sans text-xs text-zinc-400 leading-relaxed mb-5 whitespace-pre-wrap">
                                {selectedProject.description || 'No descriptive context was provided.'}
                            </p>

                            <div>
                                <h4 className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    Applied Tech Stack
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {selectedProject.techStacks.map((tech, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-400 cursor-default uppercase"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="border-t border-zinc-800/80 bg-zinc-950 px-6 py-4 flex items-center justify-between text-xs">
                            <span className="font-sans text-zinc-400 text-[11px]">
                                Posted by <strong className="text-white font-bold">{profile?.fullName || 'Platform Creator'}</strong>
                            </span>
                            <button
                                id="close-project-modal-bottom-btn"
                                onClick={() => setSelectedProject(null)}
                                className="rounded-full bg-white px-4 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-950 hover:bg-zinc-200 transition active:scale-95 cursor-pointer"
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
