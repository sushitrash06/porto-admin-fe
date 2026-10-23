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
    Info, List, Loader2, Camera, X, ImageIcon, PlusCircle, Eye, ChevronDown, Check,
    MoreHorizontal, ExternalLink, Pencil, Star, LayoutGrid
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { TagsInput } from '../atoms/TagsInput';
import { Badge } from '../atoms/Badge';
import {
    TableContainer, Table, TableHeader, TableHead,
    TableBody, TableRow, TableCell, TableActionButton
} from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { DeviceMockupIllustration, type DeviceMockupTheme } from '../molecules/DeviceMockupIllustration';

const ProjectCardThumbnail: React.FC<{ thumbnail?: string | null; title: string; theme: DeviceMockupTheme }> = ({ thumbnail, title, theme }) => {
    const [hasError, setHasError] = useState(false);
    if (!thumbnail || !thumbnail.trim() || hasError) {
        return <DeviceMockupIllustration theme={theme} />;
    }
    return (
        <img
            src={thumbnail}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
        />
    );
};

export const AdminProjects: React.FC = () => {
    const navigate = useNavigate();
    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [developerFilter, setDeveloperFilter] = useState<string>('all');
    const [publicFilter, setPublicFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [quickFilter, setQuickFilter] = useState<'all' | 'public' | 'private' | 'draft'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'oldest'>('recent');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('10:42');

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
    }, [searchQuery, typeFilter, developerFilter, publicFilter, categoryFilter, quickFilter, sortBy]);

    // Live clock for footer "All changes saved · {time}"
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateTime();
        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, []);

    // Dismiss card options popup menu on window click
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        if (activeMenuId) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [activeMenuId]);

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

    // Helper to resolve clean display category for mockup cards
    const getProjectCategory = (proj: Project): string => {
        if (proj.role) {
            const r = proj.role.toUpperCase();
            if (r.includes('DESIGN') || r.includes('UI') || r.includes('UX')) return 'UI / UX DESIGN';
            if (r.includes('FRONT') || r.includes('WEB') || r.includes('FULL') || r.includes('DEV')) return 'WEB DEVELOPMENT';
            if (r.includes('BRAND')) return 'BRANDING';
            if (r.includes('PRODUCT')) return 'PRODUCT DESIGN';
            return proj.role.toUpperCase();
        }
        if (proj.type === ProjectType.WORK) return 'WEB DEVELOPMENT';
        if (proj.techStacks && proj.techStacks.length > 0) {
            const first = proj.techStacks[0].toLowerCase();
            if (first.includes('figma') || first.includes('design')) return 'PRODUCT DESIGN';
            if (first.includes('react') || first.includes('next') || first.includes('web') || first.includes('vue')) return 'WEB DEVELOPMENT';
            if (first.includes('brand') || first.includes('logo')) return 'BRANDING';
        }
        return 'PERSONAL PROJECT';
    };

    // Helper to deterministically pick mockup theme
    const getMockupTheme = (index: number, id: string): DeviceMockupTheme => {
        const themes: DeviceMockupTheme[] = ['violet', 'blue', 'warm', 'dark'];
        const charCode = id ? id.charCodeAt(id.length - 1) : index;
        return themes[(index + charCode) % themes.length];
    };

    // Project counts for tab pills
    const allCount = projectsList.length;
    const publicCount = useMemo(() => projectsList.filter(p => p.isPublic).length, [projectsList]);
    const privateCount = useMemo(() => projectsList.filter(p => !p.isPublic && (p.projectUrl || p.githubUrl)).length, [projectsList]);
    const draftCount = useMemo(() => projectsList.filter(p => !p.isPublic && (!p.projectUrl && !p.githubUrl)).length, [projectsList]);

    // Filter projects client-side
    const filteredProjects = useMemo(() => {
        return projectsList.filter(proj => {
            // Quick tab filter: all | public | private | draft
            if (quickFilter === 'public' && !proj.isPublic) return false;
            if (quickFilter === 'private' && (proj.isPublic || (!proj.projectUrl && !proj.githubUrl && draftCount > 0))) return false;
            if (quickFilter === 'draft' && (proj.isPublic || (proj.projectUrl || proj.githubUrl))) return false;

            // Visibility dropdown filter
            if (publicFilter === 'public' && !proj.isPublic) return false;
            if (publicFilter === 'private' && proj.isPublic) return false;

            // Category filter
            if (categoryFilter !== 'all') {
                const cat = getProjectCategory(proj).toLowerCase().replace(/[^a-z]/g, '');
                const target = categoryFilter.toLowerCase().replace(/[^a-z]/g, '');
                if (!cat.includes(target) && !proj.techStacks.some(t => t.toLowerCase().replace(/[^a-z]/g, '').includes(target))) {
                    return false;
                }
            }

            // Type filter
            if (typeFilter !== 'all' && proj.type !== typeFilter) {
                return false;
            }

            // Developer filter (Super Admin)
            if (isSuper && developerFilter !== 'all' && proj.userId !== developerFilter) {
                return false;
            }

            // Regular search query
            if (debouncedSearch.trim()) {
                const q = debouncedSearch.toLowerCase();
                const matchTitle = proj.title.toLowerCase().includes(q);
                const matchDesc = proj.description?.toLowerCase().includes(q);
                const matchStack = proj.techStacks.some(tag => tag.toLowerCase().includes(q));
                const matchRole = proj.role?.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchStack && !matchRole) return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'name') {
                return a.title.localeCompare(b.title);
            }
            if (sortBy === 'oldest') {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateA - dateB;
            }
            // Default: 'recent'
            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    }, [projectsList, isSuper, quickFilter, publicFilter, categoryFilter, developerFilter, debouncedSearch, sortBy, draftCount]);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const selectedDevUser = useMemo(() => usersList.find(u => u.id === developerFilter), [usersList, developerFilter]);
    const developerFilterLabel = useMemo(() => {
        if (developerFilter === 'all') return 'Creators: All Users';
        return `Creator: ${selectedDevUser?.profile?.fullName || selectedDevUser?.email || developerFilter}`;
    }, [developerFilter, selectedDevUser]);

    const categoryFilterLabel = useMemo(() => {
        switch (categoryFilter) {
            case 'product_design': return 'Product design';
            case 'ui_ux': return 'UI / UX design';
            case 'web_dev': return 'Web development';
            case 'branding': return 'Branding';
            case 'personal': return 'Personal project';
            default: return 'All categories';
        }
    }, [categoryFilter]);

    const publicFilterLabel = useMemo(() => {
        if (publicFilter === 'all') return 'All visibility';
        return publicFilter === 'public' ? 'Public' : 'Private';
    }, [publicFilter]);

    const typeFilterLabel = useMemo(() => {
        switch (typeFilter) {
            case 'WORK': return 'Type: Work';
            case 'PERSONAL': return 'Type: Personal';
            case 'FREELANCE': return 'Type: Freelance';
            case 'OPEN_SOURCE': return 'Type: Open Source';
            default: return 'All types';
        }
    }, [typeFilter]);

    const sortLabel = useMemo(() => {
        if (sortBy === 'name') return 'Sort: Name (A-Z)';
        if (sortBy === 'oldest') return 'Sort: Oldest first';
        return 'Sort: Recently updated';
    }, [sortBy]);

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
            {/* ─── Top Header Section ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8B6CF6] mb-1">
                        PERSONAL WORKSPACE
                    </span>
                    <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202744]">
                        {isSuper ? 'Project repositories audit' : 'My project repositories'}
                    </h1>
                    <p className="font-sans text-xs sm:text-sm text-[#69718A] mt-1">
                        {isSuper
                            ? 'Audit, filter, and inspect project repositories submitted by all platform users.'
                            : 'Thoughtful work, carefully collected. Choose what the world gets to see.'}
                    </p>
                </div>

                {!isSuper && (
                    <button
                        id="create-new-project-btn"
                        onClick={handleOpenCreate}
                        className="flex items-center space-x-2 rounded-xl bg-[#8B6CF6] hover:bg-[#7857ED] text-white px-5 py-2.5 font-sans text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add project</span>
                    </button>
                )}
            </div>

            {/* Superadmin System Banner */}
            {isSuper && (
                <div className="flex items-center space-x-2.5 rounded-2xl border border-[#4697F5]/20 bg-[#4697F5]/5 px-4 py-3 text-xs text-[#202744]">
                    <Info className="h-4 w-4 shrink-0 text-[#4697F5]" />
                    <p className="font-sans font-medium leading-relaxed">
                        <strong>System Privilege: Read Only Sandbox</strong>. You are logged as a <strong>Super Administrator</strong>.
                    </p>
                </div>
            )}

            {/* ─── Toolbar Row: Search, Categories, Visibility, View Toggle ─── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Bar with ⌘ K */}
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8A90A2]" />
                    <input
                        id="project-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Find a project, technology, or idea..."
                        className="w-full rounded-xl border border-[#EAE5DD] bg-white py-2.5 pl-10 pr-12 font-sans text-xs text-[#202744] placeholder:text-[#8A90A2] focus:border-[#8B6CF6] focus:outline-hidden shadow-3xs transition"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-[#FAF8F5] border border-[#EAE5DD] px-1.5 py-0.5 font-mono text-[10px] text-[#8A90A2] select-none">
                        ⌘ K
                    </span>
                </div>

                {/* Right Filter Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Superadmin Developer Select */}
                    {isSuper && (
                        <Listbox value={developerFilter} onChange={setDeveloperFilter}>
                            <div className="relative">
                                <ListboxButton
                                    id="proj-developer-select"
                                    className="relative rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-8 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[140px] shadow-3xs flex items-center justify-between"
                                >
                                    <span className="block truncate font-semibold">{developerFilterLabel}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-[#8A90A2] shrink-0 ml-1.5" />
                                </ListboxButton>
                                <ListboxOptions className="absolute right-0 z-30 mt-1 max-h-60 w-52 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                    <ListboxOption
                                        value="all"
                                        className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                    >
                                        Creators: All Users
                                    </ListboxOption>
                                    {usersList.filter(u => u.role !== Role.ADMIN).map(u => (
                                        <ListboxOption
                                            key={u.id}
                                            value={u.id}
                                            className="relative cursor-pointer select-none py-2 pr-8 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                        >
                                            {u.profile?.fullName || u.email}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </div>
                        </Listbox>
                    )}

                    {/* All Categories Dropdown */}
                    <Listbox value={categoryFilter} onChange={setCategoryFilter}>
                        <div className="relative">
                            <ListboxButton className="rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-8 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[130px] shadow-3xs flex items-center justify-between">
                                <span className="block truncate font-semibold">{categoryFilterLabel}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-[#8A90A2] shrink-0 ml-1.5" />
                            </ListboxButton>
                            <ListboxOptions className="absolute right-0 z-30 mt-1 max-h-60 w-44 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                <ListboxOption value="all" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    All categories
                                </ListboxOption>
                                <ListboxOption value="product_design" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Product design
                                </ListboxOption>
                                <ListboxOption value="ui_ux" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    UI / UX design
                                </ListboxOption>
                                <ListboxOption value="web_dev" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Web development
                                </ListboxOption>
                                <ListboxOption value="branding" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Branding
                                </ListboxOption>
                                <ListboxOption value="personal" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Personal project
                                </ListboxOption>
                            </ListboxOptions>
                        </div>
                    </Listbox>

                    {/* All Visibility Dropdown */}
                    <Listbox value={publicFilter} onChange={setPublicFilter}>
                        <div className="relative">
                            <ListboxButton className="rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-8 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[120px] shadow-3xs flex items-center justify-between">
                                <span className="block truncate font-semibold">{publicFilterLabel}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-[#8A90A2] shrink-0 ml-1.5" />
                            </ListboxButton>
                            <ListboxOptions className="absolute right-0 z-30 mt-1 max-h-60 w-36 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                <ListboxOption value="all" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    All visibility
                                </ListboxOption>
                                <ListboxOption value="public" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Public
                                </ListboxOption>
                                <ListboxOption value="private" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Private
                                </ListboxOption>
                            </ListboxOptions>
                        </div>
                    </Listbox>

                    {/* Project Type Dropdown */}
                    <Listbox value={typeFilter} onChange={setTypeFilter}>
                        <div className="relative">
                            <ListboxButton className="rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-8 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer min-w-[125px] shadow-3xs flex items-center justify-between">
                                <span className="block truncate font-semibold">{typeFilterLabel}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-[#8A90A2] shrink-0 ml-1.5" />
                            </ListboxButton>
                            <ListboxOptions className="absolute right-0 z-30 mt-1 max-h-60 w-40 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                                <ListboxOption value="all" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    All types
                                </ListboxOption>
                                <ListboxOption value="WORK" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Work
                                </ListboxOption>
                                <ListboxOption value="PERSONAL" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Personal
                                </ListboxOption>
                                <ListboxOption value="FREELANCE" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Freelance
                                </ListboxOption>
                                <ListboxOption value="OPEN_SOURCE" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                    Open Source
                                </ListboxOption>
                            </ListboxOptions>
                        </div>
                    </Listbox>

                    {/* View Switch Button (Grid / Table) */}
                    <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                        className="flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2.5 font-sans text-xs font-semibold text-[#202744] shadow-3xs hover:bg-[#FAF8F5] transition cursor-pointer"
                        title={viewMode === 'grid' ? 'Switch to Table representation' : 'Switch to Grid view'}
                    >
                        {viewMode === 'grid' ? (
                            <>
                                <LayoutGrid className="h-4 w-4 text-[#8B6CF6]" />
                                <span>Grid view</span>
                            </>
                        ) : (
                            <>
                                <List className="h-4 w-4 text-[#8B6CF6]" />
                                <span>Table view</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ─── Sub-filters Row: Tab Pills & Sort ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                {/* Left Tabs: All projects · X, Public · Y, Private · Z, Draft · W */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setQuickFilter('all')}
                        className={`rounded-full px-3.5 py-1 text-xs transition cursor-pointer ${
                            quickFilter === 'all'
                                ? 'bg-[#E8E0FF] text-[#8B6CF6] font-bold shadow-3xs'
                                : 'text-[#69718A] hover:text-[#202744] hover:bg-white font-medium'
                        }`}
                    >
                        All projects · {allCount}
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickFilter('public')}
                        className={`rounded-full px-3.5 py-1 text-xs transition cursor-pointer ${
                            quickFilter === 'public'
                                ? 'bg-[#E8E0FF] text-[#8B6CF6] font-bold shadow-3xs'
                                : 'text-[#69718A] hover:text-[#202744] hover:bg-white font-medium'
                        }`}
                    >
                        Public · {publicCount}
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickFilter('private')}
                        className={`rounded-full px-3.5 py-1 text-xs transition cursor-pointer ${
                            quickFilter === 'private'
                                ? 'bg-[#E8E0FF] text-[#8B6CF6] font-bold shadow-3xs'
                                : 'text-[#69718A] hover:text-[#202744] hover:bg-white font-medium'
                        }`}
                    >
                        Private · {privateCount}
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickFilter('draft')}
                        className={`rounded-full px-3.5 py-1 text-xs transition cursor-pointer ${
                            quickFilter === 'draft'
                                ? 'bg-[#E8E0FF] text-[#8B6CF6] font-bold shadow-3xs'
                                : 'text-[#69718A] hover:text-[#202744] hover:bg-white font-medium'
                        }`}
                    >
                        Draft · {draftCount}
                    </button>
                </div>

                {/* Right: Sort Dropdown */}
                <Listbox value={sortBy} onChange={setSortBy}>
                    <div className="relative">
                        <ListboxButton className="flex items-center space-x-1 text-xs font-semibold text-[#69718A] hover:text-[#202744] transition cursor-pointer py-1 px-2 rounded-lg hover:bg-white">
                            <span>{sortLabel}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-[#8A90A2]" />
                        </ListboxButton>
                        <ListboxOptions className="absolute right-0 z-30 mt-1 max-h-60 w-44 overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                            <ListboxOption value="recent" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                Sort: Recently updated
                            </ListboxOption>
                            <ListboxOption value="name" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                Sort: Project name (A-Z)
                            </ListboxOption>
                            <ListboxOption value="oldest" className="cursor-pointer select-none py-2 px-3 text-[#202744] data-[focus]:bg-[#FAF8F5]">
                                Sort: Oldest first
                            </ListboxOption>
                        </ListboxOptions>
                    </div>
                </Listbox>
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

            {/* ─── Projects Presentation: Grid or Table ─── */}
            {isLoading ? (
                <div className="rounded-2xl border border-[#EAE5DD] bg-white p-16 text-center text-[#69718A]">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8B6CF6] mb-2" />
                    <p className="font-sans text-xs font-medium">Loading project repositories...</p>
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
                        <div className="space-y-6">
                            {/* 3-Column Responsive Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map((proj, idx) => (
                                    <div
                                        key={proj.id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white shadow-3xs transition-all duration-200 hover:border-[#8B6CF6]/40 hover:shadow-md"
                                    >
                                        <div>
                                            {/* Top Mockup / Thumbnail Banner */}
                                            <div className="relative aspect-[16/10] w-full bg-[#FAF8F5] border-b border-[#F0EBE1] overflow-hidden">
                                                <ProjectCardThumbnail
                                                    thumbnail={proj.thumbnail}
                                                    title={proj.title}
                                                    theme={getMockupTheme(idx, proj.id)}
                                                />
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-5">
                                                {/* Category & 3-dots */}
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="font-sans text-[11px] font-bold tracking-wider text-[#8B6CF6] uppercase">
                                                        {getProjectCategory(proj)}
                                                    </span>
                                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveMenuId(activeMenuId === proj.id ? null : proj.id)}
                                                            className="p-1 rounded-lg text-[#8A90A2] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
                                                            title="Options"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                        {activeMenuId === proj.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white border border-[#EAE5DD] shadow-lg py-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100">
                                                                <button
                                                                    type="button"
                                                                    id={`view-project-${proj.id}-btn`}
                                                                    onClick={() => {
                                                                        setActiveMenuId(null);
                                                                        navigate(`/admin/projects/${proj.id}`);
                                                                    }}
                                                                    className="w-full text-left px-3 py-1.5 text-xs text-[#202744] hover:bg-[#FAF8F5] flex items-center space-x-2 cursor-pointer"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5 text-[#69718A]" />
                                                                    <span>View detail</span>
                                                                </button>
                                                                {!isSuper && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveMenuId(null);
                                                                                handleOpenEdit(proj);
                                                                            }}
                                                                            className="w-full text-left px-3 py-1.5 text-xs text-[#202744] hover:bg-[#FAF8F5] flex items-center space-x-2 cursor-pointer"
                                                                        >
                                                                            <Edit className="h-3.5 w-3.5 text-[#69718A]" />
                                                                            <span>Edit project</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveMenuId(null);
                                                                                handleDelete(proj.id);
                                                                            }}
                                                                            className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                            <span>Delete</span>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h3
                                                    onClick={() => navigate(`/admin/projects/${proj.id}`)}
                                                    className="font-sans text-base font-bold text-[#202744] group-hover:text-[#8B6CF6] transition-colors leading-snug cursor-pointer line-clamp-1"
                                                >
                                                    {proj.title}
                                                </h3>

                                                {/* Tagline / Description */}
                                                <p className="font-sans text-xs text-[#69718A] line-clamp-2 mt-1 leading-relaxed">
                                                    {proj.description || 'Thoughtful work, carefully collected and crafted.'}
                                                </p>

                                                {/* Tech Stacks (middle dot separated string) */}
                                                <p className="font-sans text-xs text-[#69718A] font-medium mt-3.5 line-clamp-1">
                                                    {proj.techStacks.length > 0 ? proj.techStacks.join(' · ') : 'Next.js · TypeScript · Tailwind'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Footer: Status Pill, Links, Pencil Edit */}
                                        <div className="px-5 py-3.5 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-2.5">
                                                {/* Status Badge */}
                                                {proj.isPublic ? (
                                                    <span className="inline-flex items-center rounded-md bg-[#EAFBF1] border border-[#C6F0D6] px-2 py-0.5 text-[11px] font-semibold text-[#1E8E3E]">
                                                        Public
                                                    </span>
                                                ) : (!proj.projectUrl && !proj.githubUrl) ? (
                                                    <span className="inline-flex items-center rounded-md bg-[#FFF8E6] border border-[#FFE8A3] px-2 py-0.5 text-[11px] font-semibold text-[#B07208]">
                                                        Draft
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-[#F0EBE1] border border-[#EAE5DD] px-2 py-0.5 text-[11px] font-semibold text-[#69718A]">
                                                        Private
                                                    </span>
                                                )}

                                                {/* Links */}
                                                <div className="flex items-center space-x-1.5 text-xs text-[#69718A]">
                                                    {proj.projectUrl && (
                                                        <a
                                                            href={proj.projectUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1 hover:text-[#202744] font-medium transition"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            <span>Live demo</span>
                                                        </a>
                                                    )}
                                                    {proj.projectUrl && proj.githubUrl && <span>·</span>}
                                                    {proj.githubUrl && (
                                                        <a
                                                            href={proj.githubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-[#202744] font-medium transition"
                                                        >
                                                            GitHub
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Pencil Edit Icon Button */}
                                            {!isSuper && (
                                                <button
                                                    type="button"
                                                    id={`edit-project-${proj.id}-btn`}
                                                    onClick={() => handleOpenEdit(proj)}
                                                    className="p-1.5 rounded-lg text-[#8A90A2] hover:text-[#8B6CF6] hover:bg-[#FAF8F5] transition cursor-pointer"
                                                    title="Edit project"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ─── Featured Spotlight Banner ─── */}
                            <div className="mt-8 rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <p className="font-sans text-xs text-[#202744] font-medium">
                                    Your best work deserves a little spotlight. Pin up to 3 projects to your portfolio homepage.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/theme-studio')}
                                    className="shrink-0 flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-semibold text-[#202744] shadow-3xs hover:bg-[#FAF8F5] hover:border-[#8B6CF6]/40 transition cursor-pointer"
                                >
                                    <Star className="h-3.5 w-3.5 text-[#8B6CF6]" />
                                    <span>Manage featured work</span>
                                </button>
                            </div>

                            {/* ─── Bottom Pagination ─── */}
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="font-sans text-xs text-[#69718A]">
                                    Showing {filteredProjects.length === 0 ? 0 : (activePage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(activePage * ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length} projects
                                </span>

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        disabled={activePage <= 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="flex items-center space-x-1 rounded-xl border border-[#EAE5DD] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#202744] shadow-3xs hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <span>← Previous</span>
                                    </button>

                                    {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-7 w-7 rounded-lg font-sans text-xs font-semibold transition cursor-pointer ${
                                                page === activePage
                                                    ? 'bg-[#E8E0FF] text-[#8B6CF6]'
                                                    : 'text-[#69718A] hover:bg-white hover:text-[#202744]'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={activePage >= totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="flex items-center space-x-1 rounded-xl border border-[#EAE5DD] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#202744] shadow-3xs hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <span>Next →</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Soft Table Representation */
                        <TableContainer>
                            <Table minWidth="min-w-[800px]">
                                <TableHeader>
                                    <tr>
                                        {isSuper && <TableHead>Developer</TableHead>}
                                        <TableHead>Project</TableHead>
                                        <TableHead>Tech Stack</TableHead>
                                        <TableHead align="center">Status</TableHead>
                                        <TableHead align="right">Actions</TableHead>
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE).map(proj => {
                                        const owner = usersList.find(u => u.id === proj.userId);
                                        return (
                                            <TableRow key={proj.id}>
                                                {isSuper && (
                                                    <TableCell>
                                                        <div className="font-bold text-[#202744] text-xs">{owner?.profile?.fullName || 'Sandbox Member'}</div>
                                                        <div className="text-[11px] text-[#69718A]">{owner?.email}</div>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <div className="flex items-center space-x-3.5">
                                                        {proj.thumbnail ? (
                                                            <img
                                                                src={proj.thumbnail}
                                                                alt={proj.title}
                                                                referrerPolicy="no-referrer"
                                                                className="h-10 w-16 rounded-xl object-cover bg-white border border-[#EAE5DD] shadow-3xs shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] text-[#8B6CF6]/50 shrink-0">
                                                                <FolderGit2 className="h-5 w-5 stroke-1" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-[#202744] text-xs leading-snug truncate">{proj.title}</div>
                                                            <span className="inline-block mt-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-medium bg-[#FAF8F5] border border-[#EAE5DD] text-[#69718A]">
                                                                {proj.type === ProjectType.WORK ? 'Work' : 'Personal'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {proj.techStacks.map((stack, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center space-x-0.5 rounded-md px-2 py-0.5 font-sans text-[10px] font-medium bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]"
                                                            >
                                                                {stack}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Badge
                                                        variant={proj.isPublic ? 'success' : 'secondary'}
                                                        size="xs"
                                                        dot={proj.isPublic}
                                                    >
                                                        {proj.isPublic ? 'Public' : 'Hidden'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        {proj.projectUrl && (
                                                            <a
                                                                href={proj.projectUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="h-8 w-8 inline-flex items-center justify-center text-[#69718A] hover:text-[#8B6CF6] hover:bg-[#F3EEFF] rounded-lg transition"
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
                                                                className="h-8 w-8 inline-flex items-center justify-center text-[#69718A] hover:text-[#8B6CF6] hover:bg-[#F3EEFF] rounded-lg transition"
                                                                title="Review repository link"
                                                            >
                                                                <Github className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        <TableActionButton
                                                            id={`view-project-tbl-${proj.id}-btn`}
                                                            icon={<Eye className="h-3.5 w-3.5" />}
                                                            label="View Detail"
                                                            onClick={() => navigate(`/admin/projects/${proj.id}`)}
                                                        />
                                                        {!isSuper && (
                                                            <>
                                                                <TableActionButton
                                                                    icon={<Edit className="h-3.5 w-3.5" />}
                                                                    label="Edit Project"
                                                                    onClick={() => handleOpenEdit(proj)}
                                                                />
                                                                <TableActionButton
                                                                    icon={<Trash2 className="h-3.5 w-3.5" />}
                                                                    label="Delete Project"
                                                                    variant="danger"
                                                                    onClick={() => handleDelete(proj.id)}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            <Pagination
                                currentPage={activePage}
                                totalPages={totalPages}
                                totalItems={filteredProjects.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                itemLabel="projects"
                                onPageChange={setCurrentPage}
                                variant="table"
                            />
                        </TableContainer>
                    )}
                </>
            )}

            {/* ─── Page Footer ─── */}
            <div className="mt-8 pt-4 border-t border-[#EAE5DD] flex items-center justify-between text-xs text-[#8A90A2] font-sans pb-6">
                <span>Foliowalaweh · Your Work · Your Story · Your Way</span>
                <span>All changes saved · {currentTime}</span>
            </div>

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
