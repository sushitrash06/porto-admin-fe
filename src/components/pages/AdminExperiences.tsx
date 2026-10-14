/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Experience } from '../../types';
import { Role } from '../../types';
import { useMyExperiences, useAdminExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience } from '../../hooks/useExperiences';
import { useUsers } from '../../hooks/useUsers';
import { getSessionPayload } from '../../lib/auth';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { DatePicker } from '../atoms/DatePicker';
import {
    Briefcase, Search, Plus, Edit, Trash2, ShieldAlert,
    Calendar, Loader2, Eye, ChevronDown, Check, Info, Grid, List
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

export const AdminExperiences: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [developerFilter, setDeveloperFilter] = useState<string>('all');
    const [publicFilter, setPublicFilter] = useState<string>('all');

    // View style and Pagination States
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 4;

    const payload = getSessionPayload();
    const currentUser = useMemo<User | null>(() => {
        if (!payload) return null;
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            createdAt: '',
            updatedAt: '',
        };
    }, [payload]);

    const isSuper = currentUser?.role === Role.ADMIN;

    // Fetch all users list if super admin (for filtering)
    const { data: usersData } = useUsers(
        isSuper ? { limit: 100 } : { page: 1, limit: 0 }
    );
    const usersList = usersData?.data || [];

    // Fetch logged-in user's own experiences
    const { data: myExpsData, isLoading: isMyExpsLoading, isError: isMyExpsError, error: myExpsErr } = useMyExperiences({
        enabled: !!currentUser && !isSuper
    });

    // Fetch all experiences for admin view (backend-filtered)
    const { data: adminExpsData, isLoading: isAdminExpsLoading, isError: isAdminExpsError, error: adminExpsErr } = useAdminExperiences({
        userId: developerFilter === 'all' ? undefined : developerFilter,
        search: debouncedSearch || undefined,
        limit: 1000,
    }, {
        enabled: !!currentUser && isSuper
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

    // Custom confirm dialog state
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'info' | 'warning';
        showCancel?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'danger',
        showCancel: true,
    });

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

        const payloadData = {
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
                ...payloadData
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to update experience.');
                }
            });
        } else {
            createMutation.mutate(payloadData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to create experience.');
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Career Experience',
            message: 'Are you sure you want to delete this career history entry? This will permanently remove the record and dissociate any linked projects from this milestone.',
            variant: 'danger',
            showCancel: true,
            onConfirm: () => {
                deleteMutation.mutate(id, {
                    onError: (err) => {
                        setError(err.response?.data?.message || err.message || 'Failed to delete experience.');
                    }
                });
            }
        });
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

    const selectedDevUser = useMemo(() => usersList.find(u => u.id === developerFilter), [usersList, developerFilter]);
    const developerFilterLabel = useMemo(() => {
        if (developerFilter === 'all') return 'Creators: All Users';
        return `Creator: ${selectedDevUser?.profile?.fullName || selectedDevUser?.email || developerFilter}`;
    }, [developerFilter, selectedDevUser]);

    const publicFilterLabel = useMemo(() => {
        if (publicFilter === 'all') return 'Status: All Records';
        return publicFilter === 'public' ? 'Status: 🌐 Published' : 'Status: 🔒 Hidden';
    }, [publicFilter]);

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-450">
                <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-3" />
                <p className="font-sans text-sm">Verifying session...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 admin-page-enter">
            {/* Self-contained header display */}
            <div className="border-b border-[#EAE5DD] pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8E0FF] text-[#8B6CF6] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                            <Briefcase className="w-3 h-3" />
                            <span>{isSuper ? 'Superadmin Audit' : 'Career Timeline'}</span>
                        </div>
                        <h2 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#202744]">
                            {isSuper ? 'Experience Audit' : 'My Career Milestones'}
                        </h2>
                        <p className="font-sans text-xs text-[#69718A] mt-1">
                            {isSuper ? 'Review and filter all user career histories across the platform.' : 'Maintain your full-cycle career history, company logs, and visibility status.'}
                        </p>
                    </div>

                    {!isSuper && (
                        <button
                            id="create-new-exp-btn"
                            onClick={handleOpenCreate}
                            className="flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-[#8B6CF6] px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#7857ED] active:scale-95 self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Experience</span>
                        </button>
                    )}
                </div>
            </div>

            {/* View Information banner for Superadmins */}
            {isSuper && (
                <div className="flex items-center space-x-2 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-4 py-3 text-xs text-[#69718A]">
                    <Info className="h-4 w-4 shrink-0 text-[#8B6CF6]" />
                    <p className="font-sans font-medium leading-relaxed">
                        <strong className="text-[#202744]">System Privilege: Read Only Sandbox</strong>. You are logged as a <strong>Super Administrator</strong>. Experience entries can only be edited by their respective developer accounts.
                    </p>
                </div>
            )}

            {/* Control panel containing filters */}
            <div className="flex flex-col gap-4 border-b border-[#EAE5DD] pb-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    {/* Query search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                        <input
                            id="experience-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter list by company or role keyword..."
                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-4 pl-10 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {/* Developer Filter (Super admin exclusive) */}
                        {isSuper && (
                            <Listbox value={developerFilter} onChange={setDeveloperFilter}>
                                <div className="relative">
                                    <ListboxButton
                                        id="developer-select-filter"
                                        className="relative rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-8 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] cursor-pointer min-w-[160px]"
                                    >
                                        <span className="block truncate">{developerFilterLabel}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDown className="h-3.5 w-3.5 text-[#69718A]" />
                                        </span>
                                    </ListboxButton>
                                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-56 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                        <ListboxOption
                                            value="all"
                                            className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                        Creators: All Users
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#8B6CF6]">
                                                            <Check className="h-3.5 w-3.5" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </ListboxOption>
                                        {usersList.filter(u => u.role !== Role.ADMIN).map(u => (
                                            <ListboxOption
                                                key={u.id}
                                                value={u.id}
                                                className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                            {u.profile?.fullName || u.email}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#8B6CF6]">
                                                                <Check className="h-3.5 w-3.5" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </div>
                            </Listbox>
                        )}

                        {/* Public/Private filter */}
                        <Listbox value={publicFilter} onChange={setPublicFilter}>
                            <div className="relative">
                                <ListboxButton
                                    id="ispublic-select-filter"
                                    className="relative rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-8 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] cursor-pointer min-w-[140px]"
                                >
                                    <span className="block truncate">{publicFilterLabel}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDown className="h-3.5 w-3.5 text-[#69718A]" />
                                    </span>
                                </ListboxButton>
                                <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-44 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                    <ListboxOption
                                        value="all"
                                        className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                    Status: All Records
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#8B6CF6]">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="public"
                                        className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                    🌐 Published
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#8B6CF6]">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="private"
                                        className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                    🔒 Hidden
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#8B6CF6]">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                </ListboxOptions>
                            </div>
                        </Listbox>

                        {/* View Mode Switcher */}
                        <div className="flex rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg p-1.5 transition-all text-xs cursor-pointer flex items-center ${viewMode === 'grid'
                                    ? 'bg-white text-[#202744] shadow-xs'
                                    : 'text-[#69718A] hover:text-[#202744]'
                                    }`}
                                title="Grid representation"
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`rounded-lg p-1.5 transition-all text-xs cursor-pointer flex items-center ${viewMode === 'table'
                                    ? 'bg-white text-[#202744] shadow-xs'
                                    : 'text-[#69718A] hover:text-[#202744]'
                                    }`}
                                title="Table representation"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>

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
                <div className="rounded-2xl border border-[#EAE5DD] bg-white p-12 text-center text-[#69718A]">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8B6CF6] mb-2" />
                    <p className="font-sans text-xs">Querying database registers...</p>
                </div>
            ) : filteredExperiences.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EAE5DD] bg-white p-12 text-center text-[#69718A] font-sans">
                    <Briefcase className="mx-auto h-10 w-10 text-[#8B6CF6]/40 mb-3 stroke-1" />
                    <h3 className="text-sm font-bold text-[#202744]">No Career Histories Discovered</h3>
                    <p className="text-xs text-[#69718A] mt-1">Try resetting search variables or add your first work milestone.</p>
                    {!isSuper && (
                        <button
                            onClick={handleOpenCreate}
                            className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-[#8B6CF6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7857ED] transition shadow-xs cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add First Experience</span>
                        </button>
                    )}
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
                                        className="group relative flex flex-col justify-between rounded-2xl border border-[#EAE5DD] bg-white p-5 shadow-xs transition hover:border-[#8B6CF6]/40 hover:shadow-md"
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
                                                            className="h-10 w-10 rounded-xl object-cover bg-[#FAF8F5] border border-[#EAE5DD]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8E0FF]/60 font-mono text-[11px] font-bold text-[#8B6CF6] uppercase border border-[#8B6CF6]/20">
                                                            {exp.company.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-sans text-sm font-bold text-[#202744] leading-tight">
                                                            {exp.position}
                                                        </h4>
                                                        <p className="font-sans text-xs text-[#69718A] font-medium">{exp.company}</p>
                                                    </div>
                                                </div>

                                                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${exp.isPublic
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]'
                                                }`}>
                                                    {exp.isPublic ? '🌐 Public' : '🔒 Hidden'}
                                                </span>
                                            </div>

                                            {/* Timeline Dates */}
                                            <div className="mt-4 flex items-center space-x-1.5 font-mono text-[10px] text-[#69718A] font-bold uppercase">
                                                <Calendar className="h-3.5 w-3.5 text-[#8B6CF6]" />
                                                <span>{formatDate(exp.startDate)}</span>
                                                <span>—</span>
                                                <span className={!exp.endDate ? 'text-emerald-600 font-semibold' : ''}>
                                                    {exp.endDate ? formatDate(exp.endDate) : 'Active Now'}
                                                </span>
                                            </div>

                                            {/* Description Paragraph */}
                                            {exp.description && (
                                                <p className="mt-3 font-sans text-xs text-[#69718A] leading-relaxed whitespace-pre-wrap line-clamp-3">
                                                    {exp.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Grid card actions footer */}
                                        <div className="mt-5 flex items-center justify-between border-t border-[#EAE5DD] pt-3">
                                            {isSuper ? (
                                                <span className="font-mono text-[9px] text-[#69718A] font-bold uppercase tracking-wider">
                                                    Owner: {expOwner?.profile?.fullName || expOwner?.email || 'System Account'}
                                                </span>
                                            ) : (
                                                <span className="font-sans text-[10px] text-[#69718A] font-bold uppercase tracking-wider">
                                                    Self Milestone
                                                </span>
                                            )}

                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    id={`view-exp-${exp.id}-btn`}
                                                    onClick={() => navigate(`/admin/experiences/${exp.id}`)}
                                                    className="rounded-xl border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#FAF8F5] transition cursor-pointer shadow-xs"
                                                    title="View detail"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                {!isSuper && (
                                                    <>
                                                        <button
                                                            id={`edit-exp-${exp.id}-btn`}
                                                            onClick={() => handleOpenEdit(exp)}
                                                            className="rounded-xl border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#FAF8F5] transition cursor-pointer shadow-xs"
                                                            title="Modify parameters"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            id={`delete-exp-${exp.id}-btn`}
                                                            onClick={() => handleDelete(exp.id)}
                                                            disabled={deleteMutation.isPending}
                                                            className="rounded-xl border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50 shadow-xs"
                                                            title="Delete entry"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-[#EAE5DD] bg-white shadow-xs">
                            <table className="w-full min-w-[700px] border-collapse text-left text-xs font-sans">
                                <thead className="bg-[#FAF8F5] border-b border-[#EAE5DD] font-sans text-[10px] font-bold uppercase tracking-wider text-[#69718A]">
                                    <tr>
                                        {isSuper && <th className="px-6 py-4">Developer</th>}
                                        <th className="px-6 py-4">Company Details</th>
                                        <th className="px-6 py-4">Position Title</th>
                                        <th className="px-6 py-4">Timeline</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EBE1] text-[#69718A]">
                                    {filteredExperiences.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(exp => {
                                        const expOwner = usersList.find(u => u.id === exp.userId);

                                        return (
                                            <tr key={exp.id} className="hover:bg-[#FAF8F5]/60 transition">
                                                {isSuper && (
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#202744] leading-snug">
                                                            {expOwner?.profile?.fullName || 'Sandbox Member'}
                                                        </div>
                                                        <div className="font-mono text-[10px] text-[#69718A]">
                                                            {expOwner?.email || 'N/A'}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 font-bold text-[#202744]">
                                                    <div className="flex items-center space-x-2.5">
                                                        {exp.companyLogo ? (
                                                            <img
                                                                src={exp.companyLogo}
                                                                alt={exp.company}
                                                                referrerPolicy="no-referrer"
                                                                className="h-8 w-8 rounded-lg object-cover bg-white border border-[#EAE5DD] shadow-xs"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8E0FF] font-sans text-[10px] font-bold text-[#8B6CF6] uppercase">
                                                                {exp.company.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{exp.company}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-[#202744]">
                                                    {exp.position}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-[#69718A]">
                                                    {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : <span className="text-emerald-600 font-bold">Active Now</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${exp.isPublic
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]'
                                                    }`}>
                                                        {exp.isPublic ? 'Public' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            id={`view-exp-tbl-${exp.id}-btn`}
                                                            onClick={() => navigate(`/admin/experiences/${exp.id}`)}
                                                            className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition cursor-pointer"
                                                            title="View detail"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                        {!isSuper && (
                                                            <>
                                                                <button
                                                                    id={`edit-exp-tbl-${exp.id}-btn`}
                                                                    onClick={() => handleOpenEdit(exp)}
                                                                    className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition cursor-pointer"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    id={`delete-exp-tbl-${exp.id}-btn`}
                                                                    onClick={() => handleDelete(exp.id)}
                                                                    disabled={deleteMutation.isPending}
                                                                    className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-[#EAE5DD] bg-[#FAF8F5]/80 px-6 py-3.5 rounded-b-2xl font-sans text-xs">
                            <div className="text-[#69718A]">
                                Showing page <span className="font-semibold text-[#202744]">{activePage}</span> of{' '}
                                <span className="font-semibold text-[#202744]">{totalPages}</span> ({filteredExperiences.length} elements)
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={activePage <= 1}
                                    className="rounded-lg border border-[#EAE5DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#202744] transition hover:bg-[#FAF8F5] disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={activePage >= totalPages}
                                    className="rounded-lg border border-[#EAE5DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#202744] transition hover:bg-[#FAF8F5] disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {/* Integration modal sheet */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-[#202744]/40 backdrop-blur-xs transition-opacity" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200">
                        <div className="h-1.5 w-full bg-linear-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />

                        <div className="px-6 py-4 border-b border-[#EAE5DD] flex items-center justify-between">
                            <DialogTitle className="font-sans text-sm font-bold text-[#202744]">
                                {editingExp ? 'Edit Experience' : 'Add Experience'}
                            </DialogTitle>
                            <button
                                type="button"
                                id="close-exp-modal-top-btn"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 text-[#69718A] hover:text-[#202744] flex items-center justify-center rounded-lg hover:bg-[#FAF8F5] font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                                {error && (
                                    <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans font-medium">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Job Position */}
                                    <div>
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Position Title <span className="text-[#8B6CF6]">*</span>
                                        </label>
                                        <input
                                            id="modal-exp-position"
                                            type="text"
                                            required
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                        />
                                    </div>

                                    {/* Company Name */}
                                    <div>
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Company / Organization <span className="text-[#8B6CF6]">*</span>
                                        </label>
                                        <input
                                            id="modal-exp-company"
                                            type="text"
                                            required
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            placeholder="e.g. Acme Studio"
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Start Date */}
                                    <div>
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Start Date <span className="text-[#8B6CF6]">*</span>
                                        </label>
                                        <DatePicker
                                            id="modal-exp-startdate"
                                            value={startDate}
                                            onChange={(val) => setStartDate(val)}
                                        />
                                    </div>

                                    {/* End Date details */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="font-sans text-xs font-bold text-[#202744]">
                                                End Date
                                            </label>
                                            <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                                                <input
                                                    id="modal-exp-ispresent"
                                                    type="checkbox"
                                                    checked={isPresent}
                                                    onChange={(e) => setIsPresent(e.target.checked)}
                                                    className="rounded border-[#EAE5DD] text-[#8B6CF6] focus:ring-[#8B6CF6] h-3.5 w-3.5"
                                                />
                                                <span className="font-sans text-xs font-medium text-[#69718A]">Present</span>
                                            </label>
                                        </div>

                                        <DatePicker
                                            id="modal-exp-enddate"
                                            disabled={isPresent}
                                            value={endDate}
                                            onChange={(val) => setEndDate(val)}
                                        />
                                    </div>
                                </div>

                                {/* Company Logo Image URL */}
                                <div>
                                    <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                        Company Logo URL
                                    </label>
                                    <input
                                        id="modal-exp-logo"
                                        type="url"
                                        value={companyLogo}
                                        onChange={(e) => setCompanyLogo(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                    />
                                </div>

                                {/* Visibility logic */}
                                <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-sans text-xs font-bold text-[#202744]">Public Visibility</h4>
                                            <p className="font-sans text-[11px] text-[#69718A]">Display this experience on your published public portfolio.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                id="modal-exp-ispublic"
                                                type="checkbox"
                                                checked={isPublic}
                                                onChange={(e) => setIsPublic(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                                            <span className="ml-2 font-sans text-xs font-bold text-[#202744]">{isPublic ? 'Public' : 'Hidden'}</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Description input */}
                                <div>
                                    <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                        Description & Key Achievements
                                    </label>
                                    <textarea
                                        id="modal-exp-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Detail your roles, client impact, or specific tools utilized daily..."
                                        className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 min-h-[90px]"
                                    />
                                </div>

                            </div>

                            {/* Action buttons */}
                            <div className="bg-[#FAF8F5] border-t border-[#EAE5DD] px-6 py-4 flex items-center justify-end space-x-2">
                                <button
                                    id="cancel-save-exp-btn"
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-bold text-[#69718A] hover:bg-slate-50 cursor-pointer shadow-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="submit-save-exp-btn"
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center space-x-1.5 rounded-xl bg-[#8B6CF6] px-5 py-2 font-sans text-xs font-bold text-white shadow-xs hover:bg-[#7A5CE5] transition active:scale-95 cursor-pointer disabled:opacity-60"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{editingExp ? 'Save Changes' : 'Add Experience'}</span>
                                </button>
                            </div>

                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                variant={confirmState.variant}
                showCancel={confirmState.showCancel}
            />

        </div>
    );
};
