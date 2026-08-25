/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Project } from '../../types';
import { ProjectType, Role } from '../../types';
import {
    useMyProjects,
    useAdminProjects,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
    useUploadProjectThumbnail,
    useUploadProjectImage,
    useDeleteProjectImage
} from '../../hooks/useProjects';
import { useMyExperiences } from '../../hooks/useExperiences';
import { useUsers } from '../../hooks/useUsers';
import { getSessionPayload } from '../../lib/auth';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import {
    FolderGit2, Search, Plus, Edit, Trash2, Globe, Github, ShieldAlert,
    Code2, Info, Grid, List, Loader2, Camera, X, ImageIcon, PlusCircle, Eye, ChevronDown, Check
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { TagsInput } from '../atoms/TagsInput';

export const AdminProjects: React.FC = () => {
    const navigate = useNavigate();
    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [developerFilter, setDeveloperFilter] = useState<string>('all');
    const [publicFilter, setPublicFilter] = useState<string>('all');

    // View switch and Pagination state
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 6;

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset pagination on filter parameter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, developerFilter, publicFilter]);

    // Fetch users list for Super Admin dropdown filter
    const { data: usersData } = useUsers(
        isSuper ? { limit: 100 } : { page: 1, limit: 0 }
    );
    const usersList = usersData?.data || [];

    // Fetch user's own experiences for linking dropdown
    const { data: myExpsData } = useMyExperiences({
        enabled: !!currentUser && !isSuper
    });
    const ownExperiences = myExpsData || [];

    // Fetch projects (either standard own, or admin-filtered)
    const { data: myProjectsData, isLoading: isMyProjsLoading, isError: isMyProjsError, error: myProjsErr } = useMyProjects({
        enabled: !!currentUser && !isSuper
    });

    const { data: adminProjectsData, isLoading: isAdminProjsLoading, isError: isAdminProjsError, error: adminProjsErr } = useAdminProjects({
        userId: developerFilter === 'all' ? undefined : developerFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: debouncedSearch || undefined,
        limit: 1000,
    }, {
        enabled: !!currentUser && isSuper
    });

    const projectsList = isSuper ? (adminProjectsData || []) : (myProjectsData || []);
    const isLoading = isSuper ? isAdminProjsLoading : isMyProjsLoading;
    const isError = isSuper ? isAdminProjsError : isMyProjsError;
    const fetchError = isSuper ? adminProjsErr : myProjsErr;

    // Mutation Hooks
    const createMutation = useCreateProject();
    const updateMutation = useUpdateProject();
    const deleteMutation = useDeleteProject();
    const uploadThumbnailMutation = useUploadProjectThumbnail();
    const uploadImageMutation = useUploadProjectImage();
    const deleteImageMutation = useDeleteProjectImage();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Form Fields
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [type, setType] = useState<ProjectType>(ProjectType.PERSONAL);
    const [techStacks, setTechStacks] = useState<string[]>([]);
    const [projectUrl, setProjectUrl] = useState<string>('');
    const [githubUrl, setGithubUrl] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [experienceId, setExperienceId] = useState<string>('');

    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // New local state for create mode uploads
    const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);
    const [createThumbnailPreview, setCreateThumbnailPreview] = useState<string>('');
    const [createScreenshotFiles, setCreateScreenshotFiles] = useState<File[]>([]);
    const [createScreenshotPreviews, setCreateScreenshotPreviews] = useState<string[]>([]);
    const [isCreatingAndUploading, setIsCreatingAndUploading] = useState<boolean>(false);

    const resetCreateMediaState = () => {
        if (createThumbnailPreview) URL.revokeObjectURL(createThumbnailPreview);
        createScreenshotPreviews.forEach(url => URL.revokeObjectURL(url));
        setCreateThumbnailFile(null);
        setCreateThumbnailPreview('');
        setCreateScreenshotFiles([]);
        setCreateScreenshotPreviews([]);
    };

    const handleCloseModal = () => {
        resetCreateMediaState();
        setIsModalOpen(false);
    };


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
        onConfirm: () => { },
        variant: 'danger',
        showCancel: true,
    });

    const handleOpenCreate = () => {
        setError('');
        setSuccess('');
        setEditingProject(null);
        setTitle('');
        setDescription('');
        setType(ProjectType.PERSONAL);
        setTechStacks([]);
        setProjectUrl('');
        setGithubUrl('');
        setRole('');
        setIsPublic(true);
        setExperienceId('');
        resetCreateMediaState();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (proj: Project) => {
        setError('');
        setSuccess('');
        setEditingProject(proj);
        setTitle(proj.title);
        setDescription(proj.description || '');
        setType(proj.type);
        setTechStacks(proj.techStacks);
        setProjectUrl(proj.projectUrl || '');
        setGithubUrl(proj.githubUrl || '');
        setRole(proj.role || '');
        setIsPublic(proj.isPublic);
        setExperienceId(proj.experienceId || '');
        resetCreateMediaState();
        setIsModalOpen(true);
    };


    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim()) {
            setError('Project title is required.');
            return;
        }

        const parsedTechStacks = techStacks;

        const payloadData = {
            title: title.trim(),
            description: description.trim() || undefined,
            type: type,
            techStacks: parsedTechStacks,
            projectUrl: projectUrl.trim() || undefined,
            githubUrl: githubUrl.trim() || undefined,
            role: role.trim() || undefined,
            isPublic: isPublic,
            experienceId: experienceId || null
        };

        if (editingProject) {
            updateMutation.mutate({
                id: editingProject.id,
                ...payloadData
            }, {
                onSuccess: () => {
                    setSuccess('Project details saved successfully!');
                    handleCloseModal();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to update project.');
                }
            });
        } else {
            setIsCreatingAndUploading(true);
            createMutation.mutate(payloadData, {
                onSuccess: async (newProj) => {
                    try {
                        // 1. Upload thumbnail if selected
                        if (createThumbnailFile) {
                            await uploadThumbnailMutation.mutateAsync({
                                id: newProj.id,
                                file: createThumbnailFile
                            });
                        }
                        // 2. Upload screenshots if selected
                        if (createScreenshotFiles.length > 0) {
                            for (const file of createScreenshotFiles) {
                                await uploadImageMutation.mutateAsync({
                                    id: newProj.id,
                                    file
                                });
                            }
                        }
                        setSuccess('Project created and assets uploaded successfully!');
                        handleCloseModal();
                    } catch (uploadErr: any) {
                        setError(uploadErr.response?.data?.message || uploadErr.message || 'Project created, but asset upload failed.');
                    } finally {
                        setIsCreatingAndUploading(false);
                    }
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to create project.');
                    setIsCreatingAndUploading(false);
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Project Repository',
            message: 'Are you sure you want to delete this project? This will permanently remove the record and all uploaded screenshot attachments from the dashboard database.',
            variant: 'danger',
            showCancel: true,
            onConfirm: () => {
                deleteMutation.mutate(id, {
                    onError: (err) => {
                        setError(err.response?.data?.message || err.message || 'Failed to delete project.');
                    }
                });
            }
        });
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setError('');
            uploadThumbnailMutation.mutate({ id: projectId, file }, {
                onSuccess: (updatedProj) => {
                    if (editingProject) setEditingProject(updatedProj);
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Thumbnail upload failed.');
                }
            });
        }
    };

    const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setError('');
            uploadImageMutation.mutate({ id: projectId, file }, {
                onSuccess: (updatedProj) => {
                    if (editingProject) setEditingProject(updatedProj);
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Screenshot upload failed.');
                }
            });
        }
    };

    const handleScreenshotDelete = (projectId: string, imageUrl: string) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Screenshot Image',
            message: 'Are you sure you want to delete this screenshot from the project? This action cannot be reversed.',
            variant: 'danger',
            showCancel: true,
            onConfirm: () => {
                setError('');
                deleteImageMutation.mutate({ id: projectId, imageUrl }, {
                    onSuccess: (updatedProj) => {
                        if (editingProject) setEditingProject(updatedProj);
                    },
                    onError: (err) => {
                        setError(err.response?.data?.message || err.message || 'Screenshot deletion failed.');
                    }
                });
            }
        });
    };

    // Filter projects client-side for public Filter
    const filteredProjects = useMemo(() => {
        return projectsList.filter(proj => {
            // Apply public status filter
            const matchPublic = publicFilter === 'all' ||
                (publicFilter === 'public' && proj.isPublic) ||
                (publicFilter === 'private' && !proj.isPublic);

            if (isSuper) {
                return matchPublic;
            }

            // Regular user client-side search query
            const matchSearch = !searchQuery ||
                proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                proj.techStacks.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchType = typeFilter === 'all' || proj.type === typeFilter;

            return matchSearch && matchType && matchPublic;
        });
    }, [projectsList, isSuper, searchQuery, typeFilter, publicFilter]);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const selectedDevUser = useMemo(() => usersList.find(u => u.id === developerFilter), [usersList, developerFilter]);
    const developerFilterLabel = useMemo(() => {
        if (developerFilter === 'all') return 'Creators: All Users';
        return `Creator: ${selectedDevUser?.profile?.fullName || selectedDevUser?.email || developerFilter}`;
    }, [developerFilter, selectedDevUser]);

    const typeFilterLabel = useMemo(() => {
        if (typeFilter === 'all') return 'Types: All Projects';
        return typeFilter === 'PERSONAL' ? 'Types: 📍 Personal' : 'Types: 💼 Work Products';
    }, [typeFilter]);

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
            <div className="mb-6">
                <h2 className="font-sans text-2xl font-extrabold tracking-tight text-neutral-900">
                    {isSuper ? 'Project Audit' : 'My Project Repositories'}
                </h2>
                <p className="font-sans text-sm text-neutral-500 mt-1">
                    {isSuper ? 'Audit, filter, and inspect project portfolios submitted by all platform users.' : 'Document your open-source projects, link relevant jobs, and customize stack tags.'}
                </p>
            </div>

            {/* Superadmin Information Banner */}
            {isSuper && (
                <div className="flex items-center space-x-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    <Info className="h-4 w-4 shrink-0 text-slate-400" />
                    <p className="font-sans font-medium leading-relaxed">
                        <strong>System Privilege: Read Only Sandbox</strong>. You are logged as a <strong>Super Administrator</strong>. Project files can only be created or modified by their respective creative owners.
                    </p>
                </div>
            )}

            {/* Control panel & Filter suite */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    {/* Query search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="project-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by title, keywords, or tech stack..."
                            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-4 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Developer Filter (Super admin only) */}
                        {isSuper && (
                            <Listbox value={developerFilter} onChange={setDeveloperFilter}>
                                <div className="relative">
                                    <ListboxButton
                                        id="proj-developer-select"
                                        className="relative rounded-md border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-700 cursor-pointer min-w-[160px]"
                                    >
                                        <span className="block truncate">{developerFilterLabel}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        </span>
                                    </ListboxButton>
                                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-56 overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                                        <ListboxOption
                                            value="all"
                                            className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                        Creators: All Users
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </ListboxOption>
                                        {usersList.filter(u => u.role !== Role.ADMIN).map(u => (
                                            <ListboxOption
                                                key={u.id}
                                                value={u.id}
                                                className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                            {u.profile?.fullName || u.email}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                                <Check className="h-3 w-3" />
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

                        {/* Type constraint */}
                        <Listbox value={typeFilter} onChange={setTypeFilter}>
                            <div className="relative">
                                <ListboxButton
                                    id="proj-type-select"
                                    className="relative rounded-md border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-700 cursor-pointer min-w-[150px]"
                                >
                                    <span className="block truncate">{typeFilterLabel}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </span>
                                </ListboxButton>
                                <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-44 overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                                    <ListboxOption
                                        value="all"
                                        className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                    Types: All Projects
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="PERSONAL"
                                        className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                    📍 Personal
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="WORK"
                                        className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                    💼 Work Products
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                </ListboxOptions>
                            </div>
                        </Listbox>

                        {/* Public status */}
                        <Listbox value={publicFilter} onChange={setPublicFilter}>
                            <div className="relative">
                                <ListboxButton
                                    id="proj-public-select"
                                    className="relative rounded-md border border-slate-200 bg-slate-50 py-2 pr-8 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-700 cursor-pointer min-w-[140px]"
                                >
                                    <span className="block truncate">{publicFilterLabel}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </span>
                                </ListboxButton>
                                <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                                    <ListboxOption
                                        value="all"
                                        className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                    Status: All Records
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="public"
                                        className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                    🌐 Published
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="private"
                                        className="relative cursor-pointer select-none py-1.5 pr-8 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                    🔒 Hidden
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-black">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                </ListboxOptions>
                            </div>
                        </Listbox>

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
                                id="create-new-project-btn"
                                onClick={handleOpenCreate}
                                className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs transition hover:bg-slate-800 active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Project</span>
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
                        <p className="font-bold">Error loading project portfolios</p>
                        <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                    </div>
                </div>
            )}

            {/* Projects view conditional list */}
            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-450">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 mb-2" />
                    <p className="font-sans text-xs">Querying project register...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 font-sans">
                    <FolderGit2 className="mx-auto h-8 w-8 text-slate-355 mb-2 stroke-1" />
                    <h3 className="text-xs font-bold text-slate-705">No Projects Found</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting filter tags or search terms.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(proj => {
                                const owner = usersList.find(u => u.id === proj.userId);
                                return (
                                    <div
                                        key={proj.id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-3xs transition hover:border-slate-450"
                                    >
                                        <div>

                                            {/* Thumbnail Image */}
                                            <div className="relative aspect-video w-full bg-slate-100 border-b border-slate-205 overflow-hidden">
                                                {proj.thumbnail ? (
                                                    <img
                                                        src={proj.thumbnail}
                                                        alt={proj.title}
                                                        referrerPolicy="no-referrer"
                                                        className="h-full w-full object-cover transition duration-350 group-hover:scale-102"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-300 bg-slate-50">
                                                        <FolderGit2 className="h-8 w-8 stroke-1" />
                                                    </div>
                                                )}

                                                {/* Floating accessibility badges */}
                                                <span className="absolute top-2.5 right-2.5 rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs shadow-3xs text-slate-600 border border-slate-200">
                                                    {proj.type}
                                                </span>
                                            </div>

                                            {/* Operational Data information */}
                                            <div className="p-4.5 space-y-3">
                                                <div>
                                                    {isSuper && (
                                                        <span className="block font-mono text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                            Developer: {owner?.profile?.fullName || owner?.email || 'System Account'}
                                                        </span>
                                                    )}
                                                    <h4 className="font-sans text-sm font-bold text-slate-900 group-hover:text-black leading-snug">
                                                        {proj.title}
                                                    </h4>
                                                </div>

                                                {/* Role specification */}
                                                {proj.role && (
                                                    <p className="font-sans text-[11px] text-slate-550 leading-none">
                                                        Role: <span className="text-slate-800 font-bold">{proj.role}</span>
                                                    </p>
                                                )}

                                                {/* Description */}
                                                {proj.description && (
                                                    <p className="line-clamp-3 font-sans text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                                                        {proj.description}
                                                    </p>
                                                )}

                                                {/* Tech Stacks Tags lists */}
                                                <div className="flex flex-wrap gap-1 pt-1.5">
                                                    {proj.techStacks.map((stack, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center space-x-0.5 rounded px-2 py-0.5 font-mono text-[9px] font-medium bg-slate-50 text-slate-500 border border-slate-200"
                                                        >
                                                            <Code2 className="h-2.5 w-2.5 text-slate-400" />
                                                            <span>{stack}</span>
                                                        </span>
                                                    ))}
                                                </div>

                                            </div>
                                        </div>

                                        {/* Footer linking actions */}
                                        <div className="bg-slate-50 border-t border-slate-100 px-4.5 py-3 flex items-center justify-between text-xs">
                                            <span className={`inline-flex items-center space-x-1 font-mono text-[8px] font-bold uppercase tracking-wider ${proj.isPublic ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {proj.isPublic ? '🌐 Public Web' : '🔒 Hidden'}
                                            </span>

                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    id={`view-project-${proj.id}-btn`}
                                                    onClick={() => navigate(`/admin/projects/${proj.id}`)}
                                                    className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                    title="View Detail"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </button>
                                                {!isSuper ? (
                                                    <>
                                                        <button
                                                            id={`edit-project-${proj.id}-btn`}
                                                            onClick={() => handleOpenEdit(proj)}
                                                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                            title="Edit Project"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            id={`delete-project-${proj.id}-btn`}
                                                            onClick={() => handleDelete(proj.id)}
                                                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:text-red-650 hover:bg-red-50 transition cursor-pointer"
                                                            title="Delete project"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center space-x-1.5">
                                                        {proj.projectUrl && (
                                                            <a
                                                                href={proj.projectUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-slate-400 hover:text-black"
                                                                title="View Live Webpage"
                                                            >
                                                                <Globe className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {proj.githubUrl && (
                                                            <a
                                                                href={proj.githubUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-slate-400 hover:text-black"
                                                                title="Review repository link"
                                                            >
                                                                <Github className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-3xs">
                            <table className="w-full min-w-[800px] border-collapse text-left text-xs font-sans">
                                <thead className="bg-slate-50 border-b border-slate-200/60 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                                    <tr>
                                        {isSuper && <th className="px-6 py-3.5">Developer</th>}
                                        <th className="px-6 py-3.5">Project Title</th>
                                        <th className="px-6 py-3.5">Specification Tools</th>
                                        <th className="px-6 py-3.5 text-center">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(proj => {
                                        const owner = usersList.find(u => u.id === proj.userId);
                                        return (
                                            <tr key={proj.id} className="hover:bg-slate-50/55 transition">
                                                {isSuper && (
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{owner?.profile?.fullName || 'Sandbox Member'}</div>
                                                        <div className="text-[10px] font-mono text-slate-400">{owner?.email}</div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3.5">
                                                        {proj.thumbnail ? (
                                                            <img
                                                                src={proj.thumbnail}
                                                                alt={proj.title}
                                                                referrerPolicy="no-referrer"
                                                                className="h-10 w-16 rounded-md object-cover bg-slate-50 border border-slate-200/50"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-16 items-center justify-center rounded-md bg-slate-50 border border-slate-200 text-slate-350">
                                                                <FolderGit2 className="h-5 w-5 stroke-1" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-slate-900 leading-snug">{proj.title}</div>
                                                            <span className="inline-block mt-0.5 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold bg-slate-100 border border-slate-200 text-slate-500 uppercase">
                                                                {proj.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {proj.techStacks.map((stack, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center space-x-0.5 rounded px-2 py-0.5 font-mono text-[8px] font-bold bg-slate-50 text-slate-550 border border-slate-155"
                                                            >
                                                                {stack}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${proj.isPublic
                                                        ? 'bg-slate-50 text-slate-500 border border-slate-200'
                                                        : 'bg-slate-100 text-slate-450 border border-slate-200'
                                                        }`}>
                                                        {proj.isPublic ? '🌐 Public' : '🔒 Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <div className="flex items-center space-x-1.5">
                                                            {proj.projectUrl && (
                                                                <a
                                                                    href={proj.projectUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-450 hover:text-black p-1 bg-slate-50 rounded-md border border-slate-200"
                                                                >
                                                                    <Globe className="h-3.5 w-3.5" />
                                                                </a>
                                                            )}
                                                            {proj.githubUrl && (
                                                                <a
                                                                    href={proj.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-slate-450 hover:text-black p-1 bg-slate-50 rounded-md border border-slate-200"
                                                                >
                                                                    <Github className="h-3.5 w-3.5" />
                                                                </a>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                                                            <button
                                                                id={`view-project-tbl-${proj.id}-btn`}
                                                                onClick={() => navigate(`/admin/projects/${proj.id}`)}
                                                                className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                                title="View Detail"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                            </button>
                                                            {!isSuper && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleOpenEdit(proj)}
                                                                        className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                                        title="Edit Project"
                                                                    >
                                                                        <Edit className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(proj.id)}
                                                                        className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:border-red-200 hover:text-red-650 hover:bg-red-50 transition cursor-pointer"
                                                                        title="Delete Project"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
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
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 font-sans text-xs mt-4 rounded-lg">
                            <div className="text-slate-450">
                                Showing page <span className="font-semibold text-slate-700">{activePage}</span> of{' '}
                                <span className="font-semibold text-slate-700">{totalPages}</span> ({filteredProjects.length} projects)
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

            {/* Creation / Edit Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                                {editingProject ? 'Modify Project Parameters' : 'Introduce Project Portfolio'}
                            </DialogTitle>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="h-8 w-8 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-md hover:bg-slate-50 font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">

                            {error && (
                                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-sans font-medium">
                                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="rounded-md border border-green-100 bg-green-50 p-3 text-xs font-sans text-green-700 font-bold">
                                    {success}
                                </div>
                            )}

                            {/* Assets Upload Section (Only visible during editing to avoid issues) */}
                            {editingProject && (
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                                    <h4 className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">Project Media Assets</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Thumbnail Upload */}
                                        <div className="space-y-2">
                                            <span className="block font-sans text-[10px] font-bold text-slate-505 uppercase tracking-wider">Project Thumbnail</span>
                                            <div className="flex items-center space-x-4">
                                                {editingProject.thumbnail ? (
                                                    <img
                                                        src={editingProject.thumbnail}
                                                        alt="Thumbnail"
                                                        className="h-12 w-20 rounded-md object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-20 rounded-md bg-slate-200 flex items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-md font-sans text-[10px] font-bold uppercase tracking-wider text-slate-650 cursor-pointer flex items-center space-x-1.5 transition">
                                                    {uploadThumbnailMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                                                    <span>Change Cover</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleThumbnailUpload(e, editingProject.id)}
                                                        disabled={uploadThumbnailMutation.isPending}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Screenshot Upload */}
                                        <div className="space-y-2">
                                            <span className="block font-sans text-[10px] font-bold text-slate-505 uppercase tracking-wider">Add Screenshot</span>
                                            <label className="px-4 py-3 bg-white border border-dashed border-slate-300 hover:border-slate-400 rounded-md font-sans text-[10px] text-slate-500 cursor-pointer flex flex-col items-center justify-center space-y-1 transition h-[50px]">
                                                {uploadImageMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                ) : (
                                                    <>
                                                        <PlusCircle className="h-4 w-4 text-slate-400" />
                                                        <span className="font-bold uppercase tracking-wider text-[8px]">Upload Screen Image</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleScreenshotUpload(e, editingProject.id)}
                                                    disabled={uploadImageMutation.isPending}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Screenshots Gallery view */}
                                    {editingProject.images && editingProject.images.length > 0 && (
                                        <div className="pt-2">
                                            <span className="block font-sans text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Screenshots Gallery ({editingProject.images.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {editingProject.images.map((imgUrl, idx) => (
                                                    <div key={idx} className="relative group/img h-14 w-24 rounded-md overflow-hidden border border-slate-205">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Screenshot ${idx}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleScreenshotDelete(editingProject.id, imgUrl)}
                                                            className="absolute inset-0 bg-black/55 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-150 cursor-pointer text-xs"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Assets Upload Section for Creation Mode */}
                            {!editingProject && (
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                                    <h4 className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">Project Media Assets (Optional)</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Thumbnail Selection */}
                                        <div className="space-y-2">
                                            <span className="block font-sans text-[10px] font-bold text-slate-505 uppercase tracking-wider">Project Cover Thumbnail</span>
                                            <div className="flex items-center space-x-4">
                                                {createThumbnailPreview ? (
                                                    <div className="relative group/thumb">
                                                        <img
                                                            src={createThumbnailPreview}
                                                            alt="Thumbnail Preview"
                                                            className="h-12 w-20 rounded-md object-cover border border-slate-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                URL.revokeObjectURL(createThumbnailPreview);
                                                                setCreateThumbnailFile(null);
                                                                setCreateThumbnailPreview('');
                                                            }}
                                                            className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-650 cursor-pointer"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-20 rounded-md bg-slate-100 border border-slate-205 flex items-center justify-center text-slate-400">
                                                        <ImageIcon className="h-5 w-5 stroke-1" />
                                                    </div>
                                                )}
                                                <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-md font-sans text-[10px] font-bold uppercase tracking-wider text-slate-650 cursor-pointer flex items-center space-x-1.5 transition">
                                                    <Camera className="h-3 w-3" />
                                                    <span>Select Cover</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (createThumbnailPreview) URL.revokeObjectURL(createThumbnailPreview);
                                                                setCreateThumbnailFile(file);
                                                                setCreateThumbnailPreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Screenshots Selection */}
                                        <div className="space-y-2">
                                            <span className="block font-sans text-[10px] font-bold text-slate-505 uppercase tracking-wider">Add Screenshots</span>
                                            <label className="px-4 py-3 bg-white border border-dashed border-slate-300 hover:border-slate-400 rounded-md font-sans text-[10px] text-slate-500 cursor-pointer flex flex-col items-center justify-center space-y-1 transition h-[50px]">
                                                <PlusCircle className="h-4 w-4 text-slate-400" />
                                                <span className="font-bold uppercase tracking-wider text-[8px]">Choose Screenshots</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        if (files.length > 0) {
                                                            const newFiles = [...createScreenshotFiles, ...files];
                                                            const newPreviews = [...createScreenshotPreviews, ...files.map(f => URL.createObjectURL(f))];
                                                            setCreateScreenshotFiles(newFiles);
                                                            setCreateScreenshotPreviews(newPreviews);
                                                        }
                                                    }}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Screenshots Gallery Previews */}
                                    {createScreenshotPreviews.length > 0 && (
                                        <div className="pt-2">
                                            <span className="block font-sans text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Selected Screenshots ({createScreenshotPreviews.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {createScreenshotPreviews.map((url, idx) => (
                                                    <div key={idx} className="relative group/img h-14 w-24 rounded-md overflow-hidden border border-slate-205">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${idx}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                URL.revokeObjectURL(url);
                                                                const updatedFiles = [...createScreenshotFiles];
                                                                const updatedPreviews = [...createScreenshotPreviews];
                                                                updatedFiles.splice(idx, 1);
                                                                updatedPreviews.splice(idx, 1);
                                                                setCreateScreenshotFiles(updatedFiles);
                                                                setCreateScreenshotPreviews(updatedPreviews);
                                                            }}
                                                            className="absolute inset-0 bg-black/55 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-150 cursor-pointer text-xs"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Title */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Project Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Antigravity AI Console"
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>

                                    {/* Project Type */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            ProjectType Classification
                                        </label>
                                        <Listbox value={type} onChange={setType}>
                                            <div className="relative">
                                                <ListboxButton
                                                    id="modal-project-type"
                                                    className="relative w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer"
                                                >
                                                    <span className="block truncate text-left">
                                                        {type === ProjectType.PERSONAL ? 'Personal / Hobby Node' : 'Work Product Assignment'}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                                    </span>
                                                </ListboxButton>
                                                <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                                                    <ListboxOption
                                                        value={ProjectType.PERSONAL}
                                                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                    Personal / Hobby Node
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                    <ListboxOption
                                                        value={ProjectType.WORK}
                                                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                    Work Product Assignment
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                </ListboxOptions>
                                            </div>
                                        </Listbox>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Link to Experience (For Standard users only) */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Affiliated Company Career
                                        </label>
                                        <Listbox value={experienceId} onChange={setExperienceId}>
                                            <div className="relative">
                                                <ListboxButton
                                                    id="modal-experience"
                                                    className="relative w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer"
                                                >
                                                    <span className="block truncate text-left">
                                                        {(() => {
                                                            const selectedExp = ownExperiences.find(e => e.id === experienceId);
                                                            return selectedExp ? `${selectedExp.position} at ${selectedExp.company}` : 'Independent (No Company Association)';
                                                        })()}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                                    </span>
                                                </ListboxButton>
                                                <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                                                    <ListboxOption
                                                        value=""
                                                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                    Independent (No Company Association)
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                    {ownExperiences.map(exp => (
                                                        <ListboxOption
                                                            key={exp.id}
                                                            value={exp.id}
                                                            className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                        {exp.position} at {exp.company}
                                                                    </span>
                                                                    {selected && (
                                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
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
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            My Role in Project
                                        </label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            placeholder="e.g. Lead Architect, Designer"
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Live URL */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Live Application URL
                                        </label>
                                        <input
                                            type="url"
                                            value={projectUrl}
                                            onChange={(e) => setProjectUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>

                                    {/* GitHub URL */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Source Code Repository (GitHub)
                                        </label>
                                        <input
                                            type="url"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            placeholder="https://github.com/..."
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>
                                </div>

                                {/* Tech Stacks Tags Input */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Tags (Press Enter)
                                    </label>
                                    <TagsInput
                                        tags={techStacks}
                                        onChange={setTechStacks}
                                        placeholder="insert project tags"
                                    />
                                </div>

                                {/* Visibility toggle */}
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-sans text-xs font-bold text-slate-950">Published Visibility Status</h4>
                                            <p className="font-sans text-[11px] text-slate-400">Controls if this project node is public and visible on the landing showcase.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer select-none">
                                            <input
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

                                {/* Description */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Description Context
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Detail the core feature sets of the application, design choices..."
                                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[90px]"
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 -mx-6 -mb-6 flex items-center justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending || isCreatingAndUploading}
                                        className="flex items-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60"
                                    >
                                        {(createMutation.isPending || updateMutation.isPending || isCreatingAndUploading) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                        <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                                    </button>
                                </div>

                            </form>
                        </div>
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
