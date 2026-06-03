/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { User, Experience } from '../types';
import { Role } from '../types';
import { useMyExperiences, useAdminExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience } from '../hooks/useExperiences';
import { useUsers } from '../hooks/useUsers';
import { Briefcase, Search, Plus, Edit, Trash2, Calendar, Info, ShieldAlert, Grid, List, Loader2 } from 'lucide-react';

interface AdminExperiencesProps {
    currentUser: User;
    onRefreshDB?: () => void;
}

export const AdminExperiences: React.FC<AdminExperiencesProps> = ({ currentUser, onRefreshDB }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [developerFilter, setDeveloperFilter] = useState<string>('all');
    const [publicFilter, setPublicFilter] = useState<string>('all');

    // View style and Pagination States
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 4;

    const isSuper = currentUser.role === Role.SUPER_ADMIN;

    // Fetch all users list if super admin (for filtering)
    const { data: usersData } = useUsers(
        isSuper ? { limit: 100 } : { page: 1, limit: 0 }
    );
    const usersList = usersData?.data || [];

    // Fetch logged-in user's own experiences
    const { data: myExpsData, isLoading: isMyExpsLoading, isError: isMyExpsError, error: myExpsErr } = useMyExperiences();

    // Fetch all experiences for admin view (backend-filtered)
    const { data: adminExpsData, isLoading: isAdminExpsLoading, isError: isAdminExpsError, error: adminExpsErr } = useAdminExperiences({
        userId: developerFilter === 'all' ? undefined : developerFilter,
        search: debouncedSearch || undefined,
        limit: 1000,
    });

    const experiencesList = isSuper ? (adminExpsData || []) : (myExpsData || []);
    const isLoading = isSuper ? isAdminExpsLoading : isMyExpsLoading;
    const isError = isSuper ? isAdminExpsError : isMyExpsError;
    const fetchError = isSuper ? adminExpsErr : myExpsErr;

    const createMutation = useCreateExperience();
    const updateMutation = useUpdateExperience();
    const deleteMutation = useDeleteExperience();

    // Reset page when filter metrics modify
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, developerFilter, publicFilter]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Modal / Creator States
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);

    // Form Fields
    const [company, setCompany] = useState<string>('');
    const [position, setPosition] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isPresent, setIsPresent] = useState<boolean>(false);
    const [companyLogo, setCompanyLogo] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);

    const [error, setError] = useState<string>('');

    const formatDateForInput = (dateStr?: string | null) => {
        if (!dateStr) return '';
        return dateStr.substring(0, 10);
    };

    const handleOpenCreate = () => {
        setError('');
        setEditingExp(null);
        setCompany('');
        setPosition('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setIsPresent(false);
        setCompanyLogo('');
        setIsPublic(true);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (exp: Experience) => {
        setError('');
        setEditingExp(exp);
        setCompany(exp.company);
        setPosition(exp.position);
        setDescription(exp.description || '');
        setStartDate(formatDateForInput(exp.startDate));
        setEndDate(formatDateForInput(exp.endDate));
        setIsPresent(!exp.endDate);
        setCompanyLogo(exp.companyLogo || '');
        setIsPublic(exp.isPublic);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!company.trim() || !position.trim() || !startDate) {
            setError('Company Name, Job Title/Position, and Start Date are required fields.');
            return;
        }

        const payload = {
            company: company.trim(),
            position: position.trim(),
            description: description.trim() || undefined,
            startDate: startDate,
            endDate: isPresent ? null : (endDate || null),
            companyLogo: companyLogo.trim() || undefined,
            isPublic: isPublic
        };

        if (editingExp) {
            updateMutation.mutate({
                id: editingExp.id,
                ...payload
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (onRefreshDB) onRefreshDB();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to update experience.');
                }
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (onRefreshDB) onRefreshDB();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to create experience.');
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this career history entry?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    if (onRefreshDB) onRefreshDB();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to delete experience.');
                }
            });
        }
    };

    // Filter criteria logic (client side public status filter)
    const filteredExperiences = useMemo(() => {
        return experiencesList.filter(exp => {
            // Admin query is already filtered by server (search, developerFilter)
            // But we still apply publicFilter client-side
            const matchPublic = publicFilter === 'all' ||
                (publicFilter === 'public' && exp.isPublic) ||
                (publicFilter === 'private' && !exp.isPublic);

            if (isSuper) {
                return matchPublic;
            }

            // User query needs search and public filter client-side
            const matchSearch = !searchQuery ||
                exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchSearch && matchPublic;
        });
    }, [experiencesList, isSuper, searchQuery, publicFilter]);

    const totalPages = Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE);
    const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">

            {/* View Information banner for Superadmins */}
            {isSuper && (
                <div className="flex items-center space-x-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <Info className="h-4 w-4 shrink-0 text-slate-400" />
                    <p className="font-sans font-medium leading-relaxed">
                        <strong>System Privilege: Read Only Sandbox</strong>. You are logged as a <strong>Super Administrator</strong>. Experience entries can only be edited by their respective developer accounts.
                    </p>
                </div>
            )}

            {/* Control panel containing filters */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    {/* Query search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="experience-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter list by company or role keyword..."
                            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-4 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {/* Developer Filter (Super admin exclusive) */}
                        {isSuper && (
                            <select
                                id="developer-select-filter"
                                value={developerFilter}
                                onChange={(e) => setDeveloperFilter(e.target.value)}
                                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-700"
                            >
                                <option value="all">Creators: All Users</option>
                                {usersList.filter(u => u.role !== Role.SUPER_ADMIN).map(u => (
                                    <option key={u.id} value={u.id}>
                                        Creator: {u.profile?.fullName || u.email}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Public/Private filter */}
                        <select
                            id="ispublic-select-filter"
                            value={publicFilter}
                            onChange={(e) => setPublicFilter(e.target.value)}
                            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-700"
                        >
                            <option value="all">Status: All Records</option>
                            <option value="public">🌐 Published</option>
                            <option value="private">🔒 Hidden</option>
                        </select>

                        {/* View Mode Switcher */}
                        <div className="flex rounded-md border border-slate-200 bg-slate-105 p-0.5">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md p-1.5 transition-all text-xs cursor-pointer flex items-center ${viewMode === 'grid'
                                    ? 'bg-white text-slate-950 shadow-3xs'
                                    : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                title="Grid representation"
                            >
                                <Grid className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`rounded-md p-1.5 transition-all text-xs cursor-pointer flex items-center ${viewMode === 'table'
                                    ? 'bg-white text-slate-950 shadow-3xs'
                                    : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                title="Table representation"
                            >
                                <List className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Regular User Addition Button */}
                        {!isSuper && (
                            <button
                                id="create-new-exp-btn"
                                onClick={handleOpenCreate}
                                className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs transition hover:bg-slate-800 active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Experience</span>
                            </button>
                        )}

                    </div>
                </div>
            </div>

            {/* Error Message if fetching fails */}
            {isError && (
                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-600 font-sans">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                        <p className="font-bold">Error loading career history</p>
                        <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                    </div>
                </div>
            )}

            {/* Render View Mode content */}
            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-450">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 mb-2" />
                    <p className="font-sans text-xs">Querying database registers...</p>
                </div>
            ) : filteredExperiences.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-450 font-sans">
                    <Briefcase className="mx-auto h-8 w-8 text-slate-350 mb-2 stroke-1" />
                    <h3 className="text-xs font-bold text-slate-700">No Career Histories Discovered</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting search variables or filters.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {filteredExperiences.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(exp => {
                                // For admin panel, try to match the owner
                                const expOwner = usersList.find(u => u.id === exp.userId);

                                return (
                                    <div
                                        key={exp.id}
                                        className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-3xs transition hover:border-slate-400"
                                    >
                                        <div>

                                            {/* Headline Info */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {exp.companyLogo ? (
                                                        <img
                                                            src={exp.companyLogo}
                                                            alt={exp.company}
                                                            referrerPolicy="no-referrer"
                                                            className="h-10 w-10 rounded-md object-cover bg-slate-50 border border-slate-200/60"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-400 uppercase border border-slate-200/50">
                                                            {exp.company.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-sans text-sm font-bold text-slate-900 leading-tight">
                                                            {exp.position}
                                                        </h4>
                                                        <p className="font-sans text-xs text-slate-500 font-medium">{exp.company}</p>
                                                    </div>
                                                </div>

                                                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${exp.isPublic
                                                    ? 'bg-slate-50 text-slate-500 border border-slate-200'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                }`}>
                                                    {exp.isPublic ? '🌐 Public' : '🔒 Hidden'}
                                                </span>
                                            </div>

                                            {/* Timeline Dates */}
                                            <div className="mt-4 flex items-center space-x-1.5 font-mono text-[10px] text-slate-400 font-bold uppercase">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{formatDate(exp.startDate)}</span>
                                                <span>—</span>
                                                <span className={!exp.endDate ? 'text-emerald-600 font-semibold' : ''}>
                                                    {exp.endDate ? formatDate(exp.endDate) : 'Active Now'}
                                                </span>
                                            </div>

                                            {/* Description Paragraph */}
                                            {exp.description && (
                                                <p className="mt-3 font-sans text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                                                    {exp.description}
                                                </p>
                                            )}

                                        </div>

                                        {/* Grid card actions footer */}
                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                                            {isSuper ? (
                                                <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                    Owner: {expOwner?.profile?.fullName || expOwner?.email || 'System Account'}
                                                </span>
                                            ) : (
                                                <span className="font-sans text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                                                    Self Resource
                                                </span>
                                            )}

                                            {!isSuper && (
                                                <div className="flex items-center space-x-1.5">
                                                    <button
                                                        id={`edit-exp-${exp.id}-btn`}
                                                        onClick={() => handleOpenEdit(exp)}
                                                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                        title="Modify parameters"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        id={`delete-exp-${exp.id}-btn`}
                                                        onClick={() => handleDelete(exp.id)}
                                                        disabled={deleteMutation.isPending}
                                                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-3xs">
                            <table className="w-full min-w-[700px] border-collapse text-left text-xs font-sans">
                                <thead className="bg-slate-50 border-b border-slate-200/60 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                    <tr>
                                        {isSuper && <th className="px-6 py-4">Developer</th>}
                                        <th className="px-6 py-4">Company Details</th>
                                        <th className="px-6 py-4">Position Title</th>
                                        <th className="px-6 py-4">Timeline Calendar</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        {!isSuper && <th className="px-6 py-4 text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {filteredExperiences.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(exp => {
                                        const expOwner = usersList.find(u => u.id === exp.userId);

                                        return (
                                            <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                                                {isSuper && (
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900 leading-snug">
                                                            {expOwner?.profile?.fullName || 'Sandbox Member'}
                                                        </div>
                                                        <div className="font-mono text-[9px] text-slate-400">
                                                            {expOwner?.email || 'N/A'}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    <div className="flex items-center space-x-2.5">
                                                        {exp.companyLogo ? (
                                                            <img
                                                                src={exp.companyLogo}
                                                                alt={exp.company}
                                                                referrerPolicy="no-referrer"
                                                                className="h-7 w-7 rounded-md object-cover bg-slate-50 border border-slate-200/50"
                                                            />
                                                        ) : (
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 font-mono text-[9px] font-bold text-slate-400 uppercase">
                                                                {exp.company.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{exp.company}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-700">
                                                    {exp.position}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                                                    {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : <span className="text-emerald-600 font-bold">Active Now</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${exp.isPublic
                                                        ? 'bg-slate-50 text-slate-500 border border-slate-200'
                                                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                    }`}>
                                                        {exp.isPublic ? 'Public' : 'Hidden'}
                                                    </span>
                                                </td>
                                                {!isSuper && (
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-1.5">
                                                            <button
                                                                id={`edit-exp-tbl-${exp.id}-btn`}
                                                                onClick={() => handleOpenEdit(exp)}
                                                                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                id={`delete-exp-tbl-${exp.id}-btn`}
                                                                onClick={() => handleDelete(exp.id)}
                                                                disabled={deleteMutation.isPending}
                                                                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 font-sans text-xs">
                            <div className="text-slate-450">
                                Showing page <span className="font-semibold text-slate-700">{activePage}</span> of{' '}
                                <span className="font-semibold text-slate-700">{totalPages}</span> ({filteredExperiences.length} elements)
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={activePage <= 1}
                                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-650 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={activePage >= totalPages}
                                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-650 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Integration modal sheet */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                                {editingExp ? 'Modify Experience Variables' : 'Introduce Career Experience'}
                            </h3>
                            <button
                                id="close-exp-modal-top-btn"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-md hover:bg-slate-50 font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                                {error && (
                                    <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-sans font-medium">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Job Position */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Position Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="modal-exp-position"
                                            type="text"
                                            required
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>

                                    {/* Company Name */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Company / Organization <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="modal-exp-company"
                                            type="text"
                                            required
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            placeholder="e.g. GoTo Group"
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Start Date */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="modal-exp-startdate"
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>

                                    {/* End Date details */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                End Date
                                            </label>
                                            <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                                                <input
                                                    id="modal-exp-ispresent"
                                                    type="checkbox"
                                                    checked={isPresent}
                                                    onChange={(e) => setIsPresent(e.target.checked)}
                                                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                                                />
                                                <span className="font-sans text-[10px] font-bold text-slate-500">Present</span>
                                            </label>
                                        </div>

                                        <input
                                            id="modal-exp-enddate"
                                            type="date"
                                            disabled={isPresent}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Company Logo Image URL */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Company Logo Photo URL
                                    </label>
                                    <input
                                        id="modal-exp-logo"
                                        type="url"
                                        value={companyLogo}
                                        onChange={(e) => setCompanyLogo(e.target.value)}
                                        placeholder="https://images.unsplash.com/photo-..."
                                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                    />
                                </div>

                                {/* Visibility logic */}
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-sans text-xs font-bold text-slate-950">Published Visibility Status</h4>
                                            <p className="font-sans text-[11px] text-slate-400">Controls if this record is discoverable on the main public landing showcase page.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                id="modal-exp-ispublic"
                                                type="checkbox"
                                                checked={isPublic}
                                                onChange={(e) => setIsPublic(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            <span className="ml-2 font-sans text-xs font-bold text-slate-700">{isPublic ? 'Public' : 'Hidden'}</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Description input */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Operational role achievements & description
                                    </label>
                                    <textarea
                                        id="modal-exp-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Detail your operational roles, client impact, or specific tools utilized daily..."
                                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[90px]"
                                    />
                                </div>

                            </div>

                            {/* Action buttons */}
                            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end space-x-2">
                                <button
                                    id="cancel-save-exp-btn"
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="submit-save-exp-btn"
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{editingExp ? 'Apply Changes' : 'Create Entry'}</span>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
