/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useProjectDetail,
  useUpdateProject,
  useDeleteProject,
  useUploadProjectThumbnail,
  useUploadProjectImage,
  useDeleteProjectImage
} from '../../hooks/useProjects';
import { useMyExperiences } from '../../hooks/useExperiences';
import { ProjectType } from '../../types';
import {
  ArrowLeft, FolderGit2, Globe, Github, Edit, Trash2, Save, X, Loader2,
  ShieldAlert, Code2, Camera, Plus, Lock, Building2, ExternalLink,
  Info, Sparkles, Image as ImageIcon, ChevronDown, Check
} from 'lucide-react';
import { getSessionPayload } from '../../lib/auth';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

export const AdminProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const payload = getSessionPayload();
  const isSuper = payload?.role === 'SUPER_ADMIN';

  // Hook queries
  const { data: project, isLoading, isError, error } = useProjectDetail(id);
  const { data: myExpsData } = useMyExperiences({
    enabled: !isSuper
  });
  const experiences = myExpsData || [];

  // Mutations
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const uploadThumbnailMutation = useUploadProjectThumbnail();
  const uploadImageMutation = useUploadProjectImage();
  const deleteImageMutation = useDeleteProjectImage();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<ProjectType>(ProjectType.PERSONAL);
  const [editTechStacksInput, setEditTechStacksInput] = useState('');
  const [editProjectUrl, setEditProjectUrl] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editExperienceId, setEditExperienceId] = useState('');
  const [editError, setEditError] = useState('');

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

  // Find linked experience for viewing
  const linkedExperience = experiences.find(exp => exp.id === project?.experienceId);

  const handleStartEdit = () => {
    if (!project) return;
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setEditType(project.type);
    setEditTechStacksInput(project.techStacks.join(', '));
    setEditProjectUrl(project.projectUrl || '');
    setEditGithubUrl(project.githubUrl || '');
    setEditRole(project.role || '');
    setEditIsPublic(project.isPublic);
    setEditExperienceId(project.experienceId || '');
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!project) return;
    setEditError('');

    if (!editTitle.trim()) {
      setEditError('Project Title is required.');
      return;
    }

    const parsedTechStacks = editTechStacksInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    updateMutation.mutate({
      id: project.id,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      type: editType,
      techStacks: parsedTechStacks,
      projectUrl: editProjectUrl.trim() || undefined,
      githubUrl: editGithubUrl.trim() || undefined,
      role: editRole.trim() || undefined,
      isPublic: editIsPublic,
      experienceId: editExperienceId || null,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: (err) => {
        setEditError(err.response?.data?.message || err.message || 'Failed to update project.');
      }
    });
  };

  const handleDelete = () => {
    if (!project) return;
    setConfirmState({
      isOpen: true,
      title: 'Permanently Delete Project',
      message: 'Are you sure you want to permanently delete this project? This action cannot be undone and all data associated with it will be lost.',
      variant: 'danger',
      showCancel: true,
      onConfirm: () => {
        deleteMutation.mutate(project.id, {
          onSuccess: () => {
            navigate('/admin/projects');
          },
          onError: (err) => {
            setEditError(err.response?.data?.message || err.message || 'Failed to delete project.');
          }
        });
      }
    });
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && project) {
      setEditError('');
      uploadThumbnailMutation.mutate({ id: project.id, file }, {
        onError: (err) => {
          setEditError(err.response?.data?.message || err.message || 'Thumbnail upload failed.');
        }
      });
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && project) {
      setEditError('');
      uploadImageMutation.mutate({ id: project.id, file }, {
        onError: (err) => {
          setEditError(err.response?.data?.message || err.message || 'Screenshot upload failed.');
        }
      });
    }
  };

  const handleScreenshotDelete = (imageUrl: string) => {
    if (project) {
      setConfirmState({
        isOpen: true,
        title: 'Delete Screenshot Image',
        message: 'Are you sure you want to delete this screenshot from the gallery?',
        variant: 'danger',
        showCancel: true,
        onConfirm: () => {
          setEditError('');
          deleteImageMutation.mutate({ id: project.id, imageUrl }, {
            onError: (err) => {
              setEditError(err.response?.data?.message || err.message || 'Failed to delete screenshot.');
            }
          });
        }
      });
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-450">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-3" />
        <p className="font-sans text-sm">Loading project details...</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-600 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-650" />
          <div>
            <p className="font-bold">Error loading project</p>
            <p className="mt-1">{error?.response?.data?.message || error?.message || 'Project not found or access denied.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-projects-btn"
          onClick={() => navigate('/admin/projects')}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>

        {!isEditing && !isSuper && (
          <div className="flex items-center space-x-2">
            <button
              id="edit-project-btn"
              onClick={handleStartEdit}
              className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="delete-project-btn"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center space-x-1.5 rounded-md border border-red-200 bg-white px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-red-550 hover:bg-red-50 hover:border-red-300 transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {editError && (
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-650 font-sans font-medium">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-650" />
          <span>{editError}</span>
        </div>
      )}

      {/* Main Detail / Edit Card */}
      {isEditing ? (
        /* ─── EDIT MODE ─── */
        <div className="rounded-xl border border-slate-200 bg-white shadow-3xs">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
              Edit Project Details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                id="cancel-project-edit-btn"
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
              <button
                id="save-project-edit-btn"
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex items-center space-x-1 rounded-md bg-black px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Project Title <span className="text-red-550">*</span>
                </label>
                <input
                  id="edit-proj-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Project Type <span className="text-red-555">*</span>
                </label>
                <Listbox value={editType} onChange={setEditType}>
                  <div className="relative">
                    <ListboxButton
                      id="edit-proj-type"
                      className="relative w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer"
                    >
                      <span className="block truncate text-left">
                        {editType === ProjectType.PERSONAL ? 'Personal Project' : 'Work / Commercial'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                      <ListboxOption
                        value={ProjectType.PERSONAL}
                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                              Personal Project
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
                              Work / Commercial
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
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Role in Project
                </label>
                <input
                  id="edit-proj-role"
                  type="text"
                  placeholder="e.g. Lead Frontend Developer"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Linked Experience
                </label>
                <Listbox value={editExperienceId} onChange={setEditExperienceId}>
                  <div className="relative">
                    <ListboxButton
                      id="edit-proj-experience"
                      className="relative w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer"
                    >
                      <span className="block truncate text-left">
                        {(() => {
                          const selectedExp = experiences.find(e => e.id === editExperienceId);
                          return selectedExp ? `${selectedExp.position} at ${selectedExp.company}` : 'No Linked Experience';
                        })()}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                      <ListboxOption
                        value=""
                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                              No Linked Experience
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </>
                        )}
                      </ListboxOption>
                      {experiences.map(exp => (
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
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tech Stack / Tools (comma-separated)
              </label>
              <input
                id="edit-proj-techstacks"
                type="text"
                placeholder="React, TypeScript, Tailwind, NestJS"
                value={editTechStacksInput}
                onChange={(e) => setEditTechStacksInput(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Live Site URL
                </label>
                <input
                  id="edit-proj-url"
                  type="url"
                  placeholder="https://example.com"
                  value={editProjectUrl}
                  onChange={(e) => setEditProjectUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Repository URL
                </label>
                <input
                  id="edit-proj-github"
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={editGithubUrl}
                  onChange={(e) => setEditGithubUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-slate-950">Published Visibility</h4>
                  <p className="font-sans text-[11px] text-slate-400">Toggle whether this project is showcased publicly.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="edit-proj-ispublic"
                    type="checkbox"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  <span className="ml-2 font-sans text-xs font-bold text-slate-700">{editIsPublic ? 'Public' : 'Hidden'}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                id="edit-proj-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Give a detailed overview of the project, features, challenges..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[140px]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        <div className="rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden">
          {/* Header with Title */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-mono text-sm font-bold text-slate-500 border border-slate-200/50 shadow-3xs">
                  <FolderGit2 className="h-6 w-6 text-slate-650" />
                </div>
                <div>
                  <h2 className="font-sans text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
                    {project.title}
                  </h2>
                  <div className="flex items-center space-x-2.5 mt-1.5">
                    <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[8px] font-bold bg-slate-100 border border-slate-200 text-slate-550 uppercase">
                      {project.type}
                    </span>
                    {project.role && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-sans text-xs font-medium text-slate-500">Role: {project.role}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
                project.isPublic
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {project.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                <span>{project.isPublic ? 'Public Showcase' : 'Hidden'}</span>
              </span>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="px-6 py-6 space-y-6">

            {/* Linked Experience */}
            {linkedExperience && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Building2 className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Linked Experience</p>
                  <p className="font-sans text-sm font-semibold text-slate-800 mt-1">
                    {linkedExperience.position} at {linkedExperience.company}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400 mt-0.5 font-medium">
                    {formatDate(linkedExperience.startDate)} — {linkedExperience.endDate ? formatDate(linkedExperience.endDate) : 'Present'}
                  </p>
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {project.techStacks && project.techStacks.length > 0 && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Code2 className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tech Stack & Tools</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStacks.map((stack, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 rounded px-2.5 py-0.5 font-mono text-[9px] font-medium bg-slate-50 text-slate-550 border border-slate-200"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-slate-400" />
                        <span>{stack}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Project Links */}
            {(project.projectUrl || project.githubUrl) && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Globe className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Links</p>
                  <div className="flex items-center space-x-3">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-650 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Live Site</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-650 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
                      >
                        <Github className="h-3 w-3" />
                        <span>GitHub Repo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Info className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                  <p className="font-sans text-sm text-slate-600 leading-relaxed mt-1.5 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</p>
                <p className="font-mono text-[11px] text-slate-600 mt-0.5">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                <p className="font-mono text-[11px] text-slate-600 mt-0.5">{formatDate(project.updatedAt)}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Media Management Section (Thumbnail & Screenshots) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Thumbnail Display Column */}
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden h-fit">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
              Project Thumbnail
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="relative group aspect-video w-full rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt="Project Thumbnail"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-350 p-4">
                  <FolderGit2 className="mx-auto h-8 w-8 mb-1.5 stroke-1" />
                  <span className="font-sans text-[10px]">No thumbnail uploaded</span>
                </div>
              )}

              {/* Upload Overlay */}
              {!isSuper && (
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                  <div className="text-center text-white p-2">
                    <Camera className="mx-auto h-5 w-5 mb-1" />
                    <span className="font-sans text-[9px] font-bold uppercase tracking-wider">Replace Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploadThumbnailMutation.isPending}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {uploadThumbnailMutation.isPending && (
              <div className="flex items-center justify-center space-x-1.5 font-sans text-[10px] text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading thumbnail...</span>
              </div>
            )}
          </div>
        </div>

        {/* Screenshots Gallery Column */}
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
                Screenshots Gallery
              </h3>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500">
                {project.images?.length || 0}
              </span>
            </div>

            {/* Add screenshot button */}
            {!isSuper && (
              <label className="inline-flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-wider text-slate-655 hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer select-none">
                <Plus className="h-3 w-3" />
                <span>Add Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  disabled={uploadImageMutation.isPending}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="p-5">
            {uploadImageMutation.isPending && (
              <div className="flex items-center justify-center space-x-1.5 font-sans text-xs text-slate-500 mb-4 bg-slate-50 border border-dashed border-slate-250 py-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                <span>Uploading screenshot...</span>
              </div>
            )}

            {!project.images || project.images.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <ImageIcon className="mx-auto h-7 w-7 text-slate-300 mb-2 stroke-1" />
                <p className="font-sans text-xs text-slate-400 font-medium">No screenshots added to gallery.</p>
                <p className="font-sans text-[10px] text-slate-350 mt-0.5">Upload screenshots to showcase interfaces or details.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-video rounded-lg bg-slate-50 border border-slate-200/60 overflow-hidden shadow-3xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Screenshot ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />

                    {/* Screenshot action controls */}
                    {!isSuper && (
                      <button
                        onClick={() => handleScreenshotDelete(imgUrl)}
                        disabled={deleteImageMutation.isPending}
                        className="absolute top-2 right-2 rounded-md bg-black/60 hover:bg-red-650 p-1 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer disabled:opacity-50"
                        title="Delete image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

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
