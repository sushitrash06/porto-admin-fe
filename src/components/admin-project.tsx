/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { User, Project } from '../types';
import { ProjectType, Role } from '../types';
import { 
  useMyProjects, 
  useAdminProjects, 
  useCreateProject, 
  useUpdateProject, 
  useDeleteProject,
  useUploadProjectThumbnail,
  useUploadProjectImage,
  useDeleteProjectImage 
} from '../hooks/useProjects';
import { useMyExperiences } from '../hooks/useExperiences';
import { useUsers } from '../hooks/useUsers';
import { 
  FolderGit2, Search, Plus, Edit, Trash2, Globe, Github, ShieldAlert, 
  Code2, Info, Grid, List, Loader2, Camera, X, ImageIcon, PlusCircle 
} from 'lucide-react';

interface AdminProjectsProps {
    currentUser: User;
    onRefreshDB?: () => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({ currentUser, onRefreshDB }) => {
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

    const isSuper = currentUser.role === Role.SUPER_ADMIN;

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
    const { data: myExpsData } = useMyExperiences();
    const ownExperiences = myExpsData || [];

    // Fetch projects (either standard own, or admin-filtered)
    const { data: myProjectsData, isLoading: isMyProjsLoading, isError: isMyProjsError, error: myProjsErr } = useMyProjects();

    const { data: adminProjectsData, isLoading: isAdminProjsLoading, isError: isAdminProjsError, error: adminProjsErr } = useAdminProjects({
        userId: developerFilter === 'all' ? undefined : developerFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: debouncedSearch || undefined,
        limit: 1000,
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
    const [techStacksInput, setTechStacksInput] = useState<string>(''); 
    const [projectUrl, setProjectUrl] = useState<string>('');
    const [githubUrl, setGithubUrl] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [experienceId, setExperienceId] = useState<string>('');

    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const handleOpenCreate = () => {
        setError('');
        setSuccess('');
        setEditingProject(null);
        setTitle('');
        setDescription('');
        setType(ProjectType.PERSONAL);
        setTechStacksInput('');
        setProjectUrl('');
        setGithubUrl('');
        setRole('');
        setIsPublic(true);
        setExperienceId('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (proj: Project) => {
        setError('');
        setSuccess('');
        setEditingProject(proj);
        setTitle(proj.title);
        setDescription(proj.description || '');
        setType(proj.type);
        setTechStacksInput(proj.techStacks.join(', '));
        setProjectUrl(proj.projectUrl || '');
        setGithubUrl(proj.githubUrl || '');
        setRole(proj.role || '');
        setIsPublic(proj.isPublic);
        setExperienceId(proj.experienceId || '');
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

        const parsedTechStacks = techStacksInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const payload = {
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
                ...payload
            }, {
                onSuccess: () => {
                    setSuccess('Project details saved successfully!');
                    setIsModalOpen(false);
                    if (onRefreshDB) onRefreshDB();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to update project.');
                }
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess('Project created successfully!');
                    setIsModalOpen(false);
                    if (onRefreshDB) onRefreshDB();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to create project.');
                }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    if (onRefreshDB) onRefreshDB();
                },
                onError: (err) => {
                    setError(err.response?.data?.message || err.message || 'Failed to delete project.');
                }
            });
        }
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
        if (window.confirm('Delete this screenshot?')) {
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

    return (
        <div className="space-y-6">

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
                            <select
                                id="proj-developer-select"
                                value={developerFilter}
                                onChange={(e) => setDeveloperFilter(e.target.value)}
                                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-750"
                            >
                                <option value="all">Creators: All Users</option>
                                {usersList.filter(u => u.role !== Role.SUPER_ADMIN).map(u => (
                                    <option key={u.id} value={u.id}>
                                        Creator: {u.profile?.fullName || u.email}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Type constraint */}
                        <select
                            id="proj-type-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-755"
                        >
                            <option value="all">Types: All Projects</option>
                            <option value="PERSONAL">📍 Personal</option>
                            <option value="WORK">💼 Work Products</option>
                        </select>

                        {/* Public status */}
                        <select
                            id="proj-public-select"
                            value={publicFilter}
                            onChange={(e) => setPublicFilter(e.target.value)}
                            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-750"
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

                                            {!isSuper ? (
                                                <div className="flex items-center space-x-1.5">
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
                                                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
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
                                                                className="inline-flex items-center space-x-0.5 rounded px-2 py-0.5 font-mono text-[8px] font-bold bg-slate-50 text-slate-550 border border-slate-150"
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

                                                        {!isSuper ? (
                                                            <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                                                                <button
                                                                    onClick={() => handleOpenEdit(proj)}
                                                                    className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(proj.id)}
                                                                    className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:border-red-200 hover:text-red-650 hover:bg-red-50 transition cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] italic text-slate-400">Read-Only</span>
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">

                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                                {editingProject ? 'Modify Project Parameters' : 'Introduce Project Portfolio'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
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
                                            <span className="block font-sans text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Thumbnail</span>
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
                                            <span className="block font-sans text-[10px] font-bold text-slate-500 uppercase tracking-wider">Extra Screenshots ({editingProject.images?.length || 0})</span>
                                            <label className="inline-flex px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-md font-sans text-[10px] font-bold uppercase tracking-wider text-slate-650 cursor-pointer items-center space-x-1.5 transition">
                                                {uploadImageMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlusCircle className="h-3 w-3" />}
                                                <span>Add Screenshot</span>
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

                                    {/* Screenshots Gallery List */}
                                    {editingProject.images && editingProject.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-200/60">
                                            {editingProject.images.map((img, idx) => (
                                                <div key={idx} className="relative group/image h-16 w-28 rounded-md overflow-hidden border border-slate-250">
                                                    <img
                                                        src={img}
                                                        alt="Screenshot"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleScreenshotDelete(editingProject.id, img)}
                                                        disabled={deleteImageMutation.isPending}
                                                        className="absolute top-1 right-1 bg-black/60 text-white rounded p-0.5 hover:bg-red-600 transition"
                                                        title="Delete image"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
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
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value as ProjectType)}
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        >
                                            <option value={ProjectType.PERSONAL}>Personal / Hobby Node</option>
                                            <option value={ProjectType.WORK}>Work Product Assignment</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Link to Experience (For Standard users only) */}
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Affiliated Company Career
                                        </label>
                                        <select
                                            value={experienceId}
                                            onChange={(e) => setExperienceId(e.target.value)}
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        >
                                            <option value="">Independent (No Company Association)</option>
                                            {ownExperiences.map(exp => (
                                                <option key={exp.id} value={exp.id}>
                                                    {exp.position} at {exp.company}
                                                </option>
                                            ))}
                                        </select>
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

                                {/* Tech Stacks Comma Separated */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Applied Technology Tools <span className="text-slate-400">(Comma separated values)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={techStacksInput}
                                        onChange={(e) => setTechStacksInput(e.target.value)}
                                        placeholder="e.g. NextJS, TailwindCSS, PostgreSQL"
                                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
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
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex items-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60"
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                        <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
