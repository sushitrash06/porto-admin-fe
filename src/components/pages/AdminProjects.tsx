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
                <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#202744]">
                    {isSuper ? 'Project Audit' : 'My Project Repositories'}
                </h2>
                <p className="font-sans text-sm text-[#69718A] mt-1">
                    {isSuper ? 'Audit, filter, and inspect project portfolios submitted by all platform users.' : 'Document your open-source projects, link relevant jobs, and customize stack tags.'}
                </p>
            </div>

            {/* Superadmin Information Banner */}
            {isSuper && (
                <div className="flex items-center space-x-2.5 rounded-2xl border border-[#4697F5]/20 bg-[#4697F5]/5 px-4 py-3 text-xs text-[#202744]">
                    <Info className="h-4 w-4 shrink-0 text-[#4697F5]" />
                    <p className="font-sans font-medium leading-relaxed">
                        <strong>System Privilege: Read Only Sandbox</strong>. You are logged as a <strong>Super Administrator</strong>. Project files can only be created or modified by their respective creative owners.
                    </p>
                </div>
            )}

            {/* Control panel & Filter suite */}
            <div className="flex flex-col gap-4 border-b border-[#EAE5DD] pb-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    {/* Query search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                        <input
                            id="project-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by title, keywords, or tech stack..."
                            className="w-full rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-4 pl-10 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 shadow-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Developer Filter (Super admin only) */}
                        {isSuper && (
                            <Listbox value={developerFilter} onChange={setDeveloperFilter}>
                                <div className="relative">
                                    <ListboxButton
                                        id="proj-developer-select"
                                        className="relative rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-9 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[160px] shadow-xs"
                                    >
                                        <span className="block truncate font-medium">{developerFilterLabel}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
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
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
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
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
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

                        {/* Type constraint */}
                        <Listbox value={typeFilter} onChange={setTypeFilter}>
                            <div className="relative">
                                <ListboxButton
                                    id="proj-type-select"
                                    className="relative rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-9 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[150px] shadow-xs"
                                >
                                    <span className="block truncate font-medium">{typeFilterLabel}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
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
                                                    Types: All Projects
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="PERSONAL"
                                        className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                    📍 Personal
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                    <ListboxOption
                                        value="WORK"
                                        className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                    💼 Work Products
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
                                                        <Check className="h-3.5 w-3.5" />
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
                                    className="relative rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-9 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[140px] shadow-xs"
                                >
                                    <span className="block truncate font-medium">{publicFilterLabel}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                        <ChevronDown className="h-3.5 w-3.5 text-[#69718A]" />
                                    </span>
                                </ListboxButton>
                                <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-40 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
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
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
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
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
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
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8B6CF6]">
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
                                    ? 'bg-white text-[#8B6CF6] shadow-xs'
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
                                    ? 'bg-white text-[#8B6CF6] shadow-xs'
                                    : 'text-[#69718A] hover:text-[#202744]'
                                    }`}
                                title="Table representation"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Regular User Addition Button */}
                        {!isSuper && (
                            <button
                                id="create-new-project-btn"
                                onClick={handleOpenCreate}
                                className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-xl bg-[#8B6CF6] px-4 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#7A5CE5] active:scale-95"
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
                <div className="flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                        <p className="font-bold">Error loading project portfolios</p>
                        <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                    </div>
                </div>
            )}

            {/* Projects view conditional list */}
            {isLoading ? (
                <div className="rounded-2xl border border-[#EAE5DD] bg-white p-16 text-center text-[#69718A]">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8B6CF6] mb-2" />
                    <p className="font-sans text-xs font-medium">Loading project portfolios...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EAE5DD] bg-white p-16 text-center text-[#69718A] font-sans">
                    <FolderGit2 className="mx-auto h-10 w-10 text-[#69718A]/40 mb-3 stroke-1" />
                    <h3 className="text-sm font-bold text-[#202744]">No Projects Found</h3>
                    <p className="text-xs text-[#69718A] mt-1">Try resetting filter tags or search terms.</p>
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
                                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white shadow-xs transition duration-200 hover:border-[#8B6CF6]/40 hover:shadow-md"
                                    >
                                        <div>

                                            {/* Thumbnail Image */}
                                            <div className="relative aspect-video w-full bg-[#FAF8F5] border-b border-[#EAE5DD] overflow-hidden">
                                                {proj.thumbnail ? (
                                                    <img
                                                        src={proj.thumbnail}
                                                        alt={proj.title}
                                                        referrerPolicy="no-referrer"
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-103"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[#8B6CF6]/40 bg-[#FAF8F5]">
                                                        <FolderGit2 className="h-10 w-10 stroke-1" />
                                                    </div>
                                                )}

                                                {/* Floating accessibility badges */}
                                                <span className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs shadow-xs text-[#202744] border border-[#EAE5DD]">
                                                    {proj.type}
                                                </span>
                                            </div>

                                            {/* Operational Data information */}
                                            <div className="p-5 space-y-3">
                                                <div>
                                                    {isSuper && (
                                                        <span className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider leading-none mb-1">
                                                            {owner?.profile?.fullName || owner?.email || 'System Account'}
                                                        </span>
                                                    )}
                                                    <h4 className="font-sans text-base font-bold text-[#202744] group-hover:text-[#8B6CF6] transition-colors leading-snug">
                                                        {proj.title}
                                                    </h4>
                                                </div>

                                                {/* Role specification */}
                                                {proj.role && (
                                                    <p className="font-sans text-xs text-[#69718A] leading-none">
                                                        Role: <span className="text-[#202744] font-semibold">{proj.role}</span>
                                                    </p>
                                                )}

                                                {/* Description */}
                                                {proj.description && (
                                                    <p className="line-clamp-3 font-sans text-xs text-[#69718A] leading-relaxed whitespace-pre-wrap">
                                                        {proj.description}
                                                    </p>
                                                )}

                                                {/* Tech Stacks Tags lists */}
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {proj.techStacks.map((stack, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center space-x-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-medium bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]"
                                                        >
                                                            <Code2 className="h-2.5 w-2.5 text-[#8B6CF6]" />
                                                            <span>{stack}</span>
                                                        </span>
                                                    ))}
                                                </div>

                                            </div>
                                        </div>

                                        {/* Footer linking actions */}
                                        <div className="bg-[#FAF8F5]/80 border-t border-[#EAE5DD] px-5 py-3.5 flex items-center justify-between text-xs">
                                            <span className={`inline-flex items-center space-x-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${proj.isPublic
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-white text-[#69718A] border border-[#EAE5DD]'
                                            }`}>
                                                {proj.isPublic ? '🌐 Public' : '🔒 Hidden'}
                                            </span>

                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    id={`view-project-${proj.id}-btn`}
                                                    onClick={() => navigate(`/admin/projects/${proj.id}`)}
                                                    className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition shadow-xs cursor-pointer"
                                                    title="View Detail"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                {!isSuper ? (
                                                    <>
                                                        <button
                                                            id={`edit-project-${proj.id}-btn`}
                                                            onClick={() => handleOpenEdit(proj)}
                                                            className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition shadow-xs cursor-pointer"
                                                            title="Edit Project"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            id={`delete-project-${proj.id}-btn`}
                                                            onClick={() => handleDelete(proj.id)}
                                                            className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition shadow-xs cursor-pointer"
                                                            title="Delete project"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center space-x-1.5">
                                                        {proj.projectUrl && (
                                                            <a
                                                                href={proj.projectUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:text-[#8B6CF6] hover:border-[#8B6CF6]/40 shadow-xs transition"
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
                                                                className="rounded-lg border border-[#EAE5DD] bg-white p-2 text-[#69718A] hover:text-[#8B6CF6] hover:border-[#8B6CF6]/40 shadow-xs transition"
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
                        <div className="overflow-x-auto rounded-2xl border border-[#EAE5DD] bg-white shadow-xs">
                            <table className="w-full min-w-[800px] border-collapse text-left text-xs font-sans">
                                <thead className="bg-[#FAF8F5] border-b border-[#EAE5DD] text-[#69718A] uppercase tracking-wider text-[10px] font-bold">
                                    <tr>
                                        {isSuper && <th className="px-6 py-4">Developer</th>}
                                        <th className="px-6 py-4">Project Title</th>
                                        <th className="px-6 py-4">Tech Stack</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0EBE1] text-[#69718A]">
                                    {filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(proj => {
                                        const owner = usersList.find(u => u.id === proj.userId);
                                        return (
                                            <tr key={proj.id} className="hover:bg-[#FAF8F5]/60 transition">
                                                {isSuper && (
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#202744]">{owner?.profile?.fullName || 'Sandbox Member'}</div>
                                                        <div className="text-[10px] font-mono text-[#69718A]">{owner?.email}</div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3.5">
                                                        {proj.thumbnail ? (
                                                            <img
                                                                src={proj.thumbnail}
                                                                alt={proj.title}
                                                                referrerPolicy="no-referrer"
                                                                className="h-10 w-16 rounded-xl object-cover bg-white border border-[#EAE5DD] shadow-xs"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] text-[#8B6CF6]/50">
                                                                <FolderGit2 className="h-5 w-5 stroke-1" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-[#202744] leading-snug">{proj.title}</div>
                                                            <span className="inline-block mt-0.5 rounded-full px-2 py-0.5 font-sans text-[9px] font-bold bg-[#FAF8F5] border border-[#EAE5DD] text-[#69718A] uppercase">
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
                                                                className="inline-flex items-center space-x-0.5 rounded-md px-2 py-0.5 font-mono text-[9px] font-medium bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]"
                                                            >
                                                                {stack}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${proj.isPublic
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]'
                                                        }`}>
                                                        {proj.isPublic ? '🌐 Public' : '🔒 Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <div className="flex items-center space-x-1">
                                                            {proj.projectUrl && (
                                                                <a
                                                                    href={proj.projectUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[#69718A] hover:text-[#8B6CF6] p-1.5 bg-white rounded-lg border border-[#EAE5DD] shadow-xs"
                                                                >
                                                                    <Globe className="h-3.5 w-3.5" />
                                                                </a>
                                                            )}
                                                            {proj.githubUrl && (
                                                                <a
                                                                    href={proj.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[#69718A] hover:text-[#8B6CF6] p-1.5 bg-white rounded-lg border border-[#EAE5DD] shadow-xs"
                                                                >
                                                                    <Github className="h-3.5 w-3.5" />
                                                                </a>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center space-x-1 border-l border-[#EAE5DD] pl-2">
                                                            <button
                                                                id={`view-project-tbl-${proj.id}-btn`}
                                                                onClick={() => navigate(`/admin/projects/${proj.id}`)}
                                                                className="rounded-lg border border-[#EAE5DD] bg-white p-1.5 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition shadow-xs cursor-pointer"
                                                                title="View Detail"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </button>
                                                            {!isSuper && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleOpenEdit(proj)}
                                                                        className="rounded-lg border border-[#EAE5DD] bg-white p-1.5 text-[#69718A] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition shadow-xs cursor-pointer"
                                                                        title="Edit Project"
                                                                    >
                                                                        <Edit className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(proj.id)}
                                                                        className="rounded-lg border border-[#EAE5DD] bg-white p-1.5 text-[#69718A] hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition shadow-xs cursor-pointer"
                                                                        title="Delete Project"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
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
                        <div className="flex items-center justify-between border-t border-[#EAE5DD] bg-[#FAF8F5]/80 px-6 py-3.5 rounded-b-2xl font-sans text-xs">
                            <div className="text-[#69718A]">
                                Showing page <span className="font-semibold text-[#202744]">{activePage}</span> of{' '}
                                <span className="font-semibold text-[#202744]">{totalPages}</span> ({filteredProjects.length} projects)
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

            {/* Creation / Edit Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-[#202744]/40 backdrop-blur-xs transition-opacity" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200">
                        <div className="h-1.5 w-full bg-linear-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />

                        <div className="px-6 py-4 border-b border-[#EAE5DD] flex items-center justify-between">
                            <DialogTitle className="font-sans text-sm font-bold text-[#202744]">
                                {editingProject ? 'Edit Project' : 'Add Project'}
                            </DialogTitle>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="h-8 w-8 text-[#69718A] hover:text-[#202744] flex items-center justify-center rounded-lg hover:bg-[#FAF8F5] font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">

                            {error && (
                                <div className="flex items-start space-x-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans font-medium">
                                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-sans text-emerald-800 font-bold">
                                    {success}
                                </div>
                            )}

                            {/* Assets Upload Section (Only visible during editing to avoid issues) */}
                            {editingProject && (
                                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] space-y-4">
                                    <h4 className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Project Media Assets</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Thumbnail Upload */}
                                        <div className="space-y-2">
                                            <span className="block font-sans text-xs font-bold text-[#202744]">Project Thumbnail</span>
                                            <div className="flex items-center space-x-4">
                                                {editingProject.thumbnail ? (
                                                    <img
                                                        src={editingProject.thumbnail}
                                                        alt="Thumbnail"
                                                        className="h-12 w-20 rounded-xl object-cover border border-[#EAE5DD] shadow-xs"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-20 rounded-xl bg-white border border-[#EAE5DD] flex items-center justify-center text-[#69718A]">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <label className="px-3.5 py-2 bg-white border border-[#EAE5DD] hover:bg-[#FAF8F5] rounded-xl font-sans text-xs font-bold text-[#202744] cursor-pointer flex items-center space-x-1.5 transition shadow-xs">
                                                    {uploadThumbnailMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8B6CF6]" /> : <Camera className="h-3.5 w-3.5 text-[#8B6CF6]" />}
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
                                            <span className="block font-sans text-xs font-bold text-[#202744]">Add Screenshot</span>
                                            <label className="px-4 py-3 bg-white border border-dashed border-[#EAE5DD] hover:border-[#8B6CF6]/50 rounded-xl font-sans text-xs text-[#69718A] cursor-pointer flex flex-col items-center justify-center space-y-1 transition h-[52px]">
                                                {uploadImageMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-[#8B6CF6]" />
                                                ) : (
                                                    <>
                                                        <PlusCircle className="h-4 w-4 text-[#8B6CF6]" />
                                                        <span className="font-bold text-[10px] text-[#202744]">Upload Screen Image</span>
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
                                            <span className="block font-sans text-xs font-bold text-[#202744] mb-2">Screenshots Gallery ({editingProject.images.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {editingProject.images.map((imgUrl, idx) => (
                                                    <div key={idx} className="relative group/img h-14 w-24 rounded-xl overflow-hidden border border-[#EAE5DD] shadow-xs">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Screenshot ${idx}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleScreenshotDelete(editingProject.id, imgUrl)}
                                                            className="absolute inset-0 bg-[#202744]/70 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-150 cursor-pointer text-xs"
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
                                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] space-y-4">
                                    <h4 className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Project Media Assets (Optional)</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Thumbnail Selection */}
                                        <div className="space-y-2">
                                            <span className="block font-sans text-xs font-bold text-[#202744]">Cover Thumbnail</span>
                                            <div className="flex items-center space-x-4">
                                                {createThumbnailPreview ? (
                                                    <div className="relative group/thumb">
                                                        <img
                                                            src={createThumbnailPreview}
                                                            alt="Thumbnail Preview"
                                                            className="h-12 w-20 rounded-xl object-cover border border-[#EAE5DD] shadow-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                URL.revokeObjectURL(createThumbnailPreview);
                                                                setCreateThumbnailFile(null);
                                                                setCreateThumbnailPreview('');
                                                            }}
                                                            className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 cursor-pointer"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-20 rounded-xl bg-white border border-[#EAE5DD] flex items-center justify-center text-[#69718A]">
                                                        <ImageIcon className="h-5 w-5 stroke-1" />
                                                    </div>
                                                )}
                                                <label className="px-3.5 py-2 bg-white border border-[#EAE5DD] hover:bg-[#FAF8F5] rounded-xl font-sans text-xs font-bold text-[#202744] cursor-pointer flex items-center space-x-1.5 transition shadow-xs">
                                                    <Camera className="h-3.5 w-3.5 text-[#8B6CF6]" />
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
                                            <span className="block font-sans text-xs font-bold text-[#202744]">Add Screenshots</span>
                                            <label className="px-4 py-3 bg-white border border-dashed border-[#EAE5DD] hover:border-[#8B6CF6]/50 rounded-xl font-sans text-xs text-[#69718A] cursor-pointer flex flex-col items-center justify-center space-y-1 transition h-[52px]">
                                                <PlusCircle className="h-4 w-4 text-[#8B6CF6]" />
                                                <span className="font-bold text-[10px] text-[#202744]">Choose Screenshots</span>
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
                                            <span className="block font-sans text-xs font-bold text-[#202744] mb-2">Selected Screenshots ({createScreenshotPreviews.length})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {createScreenshotPreviews.map((url, idx) => (
                                                    <div key={idx} className="relative group/img h-14 w-24 rounded-xl overflow-hidden border border-[#EAE5DD] shadow-xs">
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
                                                            className="absolute inset-0 bg-[#202744]/70 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition duration-150 cursor-pointer text-xs"
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
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Project Title <span className="text-[#8B6CF6]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Foliowalaweh Platform"
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                        />
                                    </div>

                                    {/* Project Type */}
                                    <div>
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Project Classification
                                        </label>
                                        <Listbox value={type} onChange={setType}>
                                            <div className="relative">
                                                <ListboxButton
                                                    id="modal-project-type"
                                                    className="relative w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] cursor-pointer"
                                                >
                                                    <span className="block truncate text-left">
                                                        {type === ProjectType.PERSONAL ? '📍 Personal Project' : '💼 Work Product'}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <ChevronDown className="h-4 w-4 text-[#69718A]" />
                                                    </span>
                                                </ListboxButton>
                                                <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                                    <ListboxOption
                                                        value={ProjectType.PERSONAL}
                                                        className="relative cursor-pointer select-none py-2 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                                    📍 Personal Project
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                    <ListboxOption
                                                        value={ProjectType.WORK}
                                                        className="relative cursor-pointer select-none py-2 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                                    💼 Work Product
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
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
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Affiliated Work Experience
                                        </label>
                                        <Listbox value={experienceId} onChange={setExperienceId}>
                                            <div className="relative">
                                                <ListboxButton
                                                    id="modal-experience"
                                                    className="relative w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] cursor-pointer"
                                                >
                                                    <span className="block truncate text-left">
                                                        {(() => {
                                                            const selectedExp = ownExperiences.find(e => e.id === experienceId);
                                                            return selectedExp ? `${selectedExp.position} at ${selectedExp.company}` : 'Independent (No Affiliation)';
                                                        })()}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <ChevronDown className="h-4 w-4 text-[#69718A]" />
                                                    </span>
                                                </ListboxButton>
                                                <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                                    <ListboxOption
                                                        value=""
                                                        className="relative cursor-pointer select-none py-2 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                                    Independent (No Affiliation)
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
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
                                                            className="relative cursor-pointer select-none py-2 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                                        {exp.position} at {exp.company}
                                                                    </span>
                                                                    {selected && (
                                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
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
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Role in Project
                                        </label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            placeholder="e.g. Lead Engineer, UI/UX Designer"
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Live URL */}
                                    <div>
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Live Project URL
                                        </label>
                                        <input
                                            type="url"
                                            value={projectUrl}
                                            onChange={(e) => setProjectUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                        />
                                    </div>

                                    {/* GitHub URL */}
                                    <div>
                                        <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                            Repository URL (GitHub)
                                        </label>
                                        <input
                                            type="url"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            placeholder="https://github.com/..."
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                                        />
                                    </div>
                                </div>

                                {/* Tech Stacks Tags Input */}
                                <div>
                                    <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                        Tech Stack Tags (Press Enter)
                                    </label>
                                    <TagsInput
                                        tags={techStacks}
                                        onChange={setTechStacks}
                                        placeholder="Add technology tags..."
                                    />
                                </div>

                                {/* Visibility toggle */}
                                <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-sans text-xs font-bold text-[#202744]">Published Visibility</h4>
                                            <p className="font-sans text-[11px] text-[#69718A]">Controls if this project is visible on your public portfolio.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer select-none">
                                            <input
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

                                {/* Description */}
                                <div>
                                    <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                                        Description & Summary
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Detail the core features, architectural choices, and impact..."
                                        className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 min-h-[90px]"
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="bg-[#FAF8F5] border-t border-[#EAE5DD] px-6 py-4 -mx-6 -mb-6 flex items-center justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-bold text-[#69718A] hover:bg-slate-50 cursor-pointer shadow-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending || isCreatingAndUploading}
                                        className="flex items-center space-x-1.5 rounded-xl bg-[#8B6CF6] px-5 py-2 font-sans text-xs font-bold text-white shadow-xs hover:bg-[#7A5CE5] transition active:scale-95 cursor-pointer disabled:opacity-60"
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
