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
import { useConvertPersonalProject } from '../../hooks/useBusinessProjects';
import { ProjectType } from '../../types';
import {
  ArrowLeft, FolderGit2, Globe, Github, Edit, Trash2, Save, X, Loader2,
  ShieldAlert, Code2, Camera, Plus, Lock, Building2, ExternalLink,
  Info, Sparkles, Image as ImageIcon, ChevronDown, Check
} from 'lucide-react';
import { getSessionPayload } from '../../lib/auth';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { TagsInput } from '../atoms/TagsInput';

export const AdminProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const payload = getSessionPayload();
  const isSuper = payload?.role === 'ADMIN';
  const isBusiness = payload?.hasBusinessProfile || payload?.role === 'ADMIN';

  // Hook queries
  const { data: project, isLoading, isError, error } = useProjectDetail(id);
  const convertMutation = useConvertPersonalProject();
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
  const [editTechStacks, setEditTechStacks] = useState<string[]>([]);
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
    onConfirm: () => { },
    variant: 'danger',
    showCancel: true,
  });

  // Find linked experience for viewing
  const linkedExperience = experiences.find(exp => exp.id === project?.experienceId);

  const handleConvertProject = () => {
    if (!project) return;
    setEditError('');
    convertMutation.mutate({
      personalProjectId: project.id,
      deleteOriginal: false
    }, {
      onSuccess: (newBusinessProj) => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        navigate(`/admin/business/projects/${newBusinessProj.id}`);
      },
      onError: (err) => {
        setEditError(err.response?.data?.message || err.message || 'Failed to convert project.');
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleOpenConvertDialog = () => {
    if (!project) return;
    setConfirmState({
      isOpen: true,
      title: 'Convert to Business Case Study',
      message: 'Are you sure you want to convert this personal project into a Business Case Study? This will copy the title, description, thumbnail, and screenshot gallery to your business case studies register.',
      variant: 'info',
      showCancel: true,
      onConfirm: () => {
        handleConvertProject();
      }
    });
  };

  const handleStartEdit = () => {
    if (!project) return;
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setEditType(project.type);
    setEditTechStacks(project.techStacks);
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

    const parsedTechStacks = editTechStacks;

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
      <div className="flex flex-col items-center justify-center py-24 text-[#69718A]">
        <Loader2 className="h-10 w-10 animate-spin text-[#8B6CF6] mb-3" />
        <p className="font-sans text-sm font-medium">Loading project details...</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center space-x-2 text-[#69718A] hover:text-[#202744] transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>
        <div className="flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
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
          className="inline-flex items-center space-x-2 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2 text-xs font-semibold text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>

        {!isEditing && !isSuper && (
          <div className="flex items-center space-x-2">
            {isBusiness && (
              <button
                id="convert-to-business-btn"
                onClick={handleOpenConvertDialog}
                disabled={convertMutation.isPending}
                className="flex items-center space-x-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-2 font-sans text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {convertMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Building2 className="h-3.5 w-3.5" />}
                <span>Convert to Business</span>
              </button>
            )}
            <button
              id="edit-project-btn"
              onClick={handleStartEdit}
              className="flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-bold text-[#202744] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition shadow-xs cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="delete-project-btn"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center space-x-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 font-sans text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-300 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {editError && (
        <div className="flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans font-medium">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span>{editError}</span>
        </div>
      )}

      {/* Main Detail / Edit Card */}
      {isEditing ? (
        /* ─── EDIT MODE ─── */
        <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />
          <div className="border-b border-[#EAE5DD] px-6 py-4 flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold text-[#202744]">
              Edit Project Details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                id="cancel-project-edit-btn"
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-1.5 font-sans text-xs font-bold text-[#69718A] hover:bg-[#FAF8F5] cursor-pointer shadow-xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <button
                id="save-project-edit-btn"
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex items-center space-x-1.5 rounded-xl bg-[#8B6CF6] px-4 py-1.5 font-sans text-xs font-bold text-white shadow-xs hover:bg-[#7A5CE5] transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Project Title <span className="text-[#8B6CF6]">*</span>
                </label>
                <input
                  id="edit-proj-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Project Type <span className="text-[#8B6CF6]">*</span>
                </label>
                <Listbox value={editType} onChange={setEditType}>
                  <div className="relative">
                    <ListboxButton
                      id="edit-proj-type"
                      className="relative w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] cursor-pointer"
                    >
                      <span className="block truncate text-left">
                        {editType === ProjectType.PERSONAL ? '📍 Personal Project' : '💼 Work / Commercial'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-4 w-4 text-[#69718A]" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
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
                              💼 Work / Commercial
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
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Role in Project
                </label>
                <input
                  id="edit-proj-role"
                  type="text"
                  placeholder="e.g. Lead Frontend Developer"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Linked Experience
                </label>
                <Listbox value={editExperienceId} onChange={setEditExperienceId}>
                  <div className="relative">
                    <ListboxButton
                      id="edit-proj-experience"
                      className="relative w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] cursor-pointer"
                    >
                      <span className="block truncate text-left">
                        {(() => {
                          const selectedExp = experiences.find(e => e.id === editExperienceId);
                          return selectedExp ? `${selectedExp.position} at ${selectedExp.company}` : 'No Linked Experience';
                        })()}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-4 w-4 text-[#69718A]" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                      <ListboxOption
                        value=""
                        className="relative cursor-pointer select-none py-2 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                              No Linked Experience
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
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
            </div>

            <div>
              <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                Tech Stack Tags (Press Enter)
              </label>
              <TagsInput
                tags={editTechStacks}
                onChange={setEditTechStacks}
                placeholder="Add tags..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Live Site URL
                </label>
                <input
                  id="edit-proj-url"
                  type="url"
                  placeholder="https://example.com"
                  value={editProjectUrl}
                  onChange={(e) => setEditProjectUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Repository URL
                </label>
                <input
                  id="edit-proj-github"
                  type="url"
                  placeholder="https://github.com/..."
                  value={editGithubUrl}
                  onChange={(e) => setEditGithubUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Public Visibility</h4>
                  <p className="font-sans text-[11px] text-[#69718A]">Toggle whether this project is showcased publicly.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="edit-proj-ispublic"
                    type="checkbox"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                  <span className="ml-2 font-sans text-xs font-bold text-[#202744]">{editIsPublic ? 'Public' : 'Hidden'}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                Description
              </label>
              <textarea
                id="edit-proj-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Give a detailed overview of the project, features, challenges..."
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 min-h-[140px]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          {/* Header with Title */}
          <div className="border-b border-[#F0EBE1] bg-[#FAF8F5]/80 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-[#8B6CF6] border border-violet-100 shadow-xs shrink-0">
                  <FolderGit2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-sans text-lg font-bold text-[#202744] leading-tight">
                    {project.title}
                  </h2>
                  <div className="flex items-center flex-wrap gap-2 mt-1.5">
                    <span className="inline-block rounded-md px-2 py-0.5 font-mono text-[9px] font-bold bg-[#FAF8F5] border border-[#EAE5DD] text-[#69718A] uppercase">
                      {project.type}
                    </span>
                    {project.role && (
                      <>
                        <span className="text-[#EAE5DD]">·</span>
                        <span className="font-sans text-xs font-medium text-[#69718A]">Role: {project.role}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 font-sans text-xs font-semibold shrink-0 self-start ${project.isPublic
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]'
                }`}>
                {project.isPublic ? <Globe className="h-3.5 w-3.5 text-emerald-600" /> : <Lock className="h-3.5 w-3.5 text-[#69718A]" />}
                <span>{project.isPublic ? 'Public Showcase' : 'Hidden'}</span>
              </span>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="px-6 py-6 space-y-6">

            {/* Linked Experience */}
            {linkedExperience && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Linked Experience</p>
                  <p className="font-sans text-sm font-semibold text-[#202744] mt-0.5">
                    {linkedExperience.position} at {linkedExperience.company}
                  </p>
                  <p className="font-sans text-xs text-[#69718A] mt-0.5">
                    {formatDate(linkedExperience.startDate)} — {linkedExperience.endDate ? formatDate(linkedExperience.endDate) : 'Present'}
                  </p>
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {project.techStacks && project.techStacks.length > 0 && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">Tags & Technologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStacks.map((stack, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold bg-violet-50/80 text-[#8B6CF6] border border-violet-200/70"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-[#8B6CF6]" />
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
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-2">Project Links</p>
                  <div className="flex items-center flex-wrap gap-2.5">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-[#202744] hover:border-[#8B6CF6] hover:text-[#8B6CF6] hover:bg-[#FAF8F5] transition shadow-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Live Site</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-[#202744] hover:border-[#8B6CF6] hover:text-[#8B6CF6] hover:bg-[#FAF8F5] transition shadow-xs"
                      >
                        <Github className="h-3.5 w-3.5" />
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
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Description</p>
                  <p className="font-sans text-sm text-[#202744]/80 leading-relaxed mt-1.5 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-[#F0EBE1] pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Created</p>
                <p className="font-sans text-xs text-[#202744] mt-0.5">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Last Updated</p>
                <p className="font-sans text-xs text-[#202744] mt-0.5">{formatDate(project.updatedAt)}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Media Management Section (Thumbnail & Screenshots) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Thumbnail Display Column */}
        <div className="md:col-span-1 rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden h-fit">
          <div className="border-b border-[#F0EBE1] px-5 py-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744]">
              Project Thumbnail
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="relative group aspect-video w-full rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] overflow-hidden flex items-center justify-center">
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt="Project Thumbnail"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-[#69718A] p-4">
                  <FolderGit2 className="mx-auto h-8 w-8 mb-1.5 text-[#8B6CF6]/60 stroke-1" />
                  <span className="font-sans text-xs">No thumbnail uploaded</span>
                </div>
              )}

              {/* Upload Overlay */}
              {!isSuper && (
                <label className="absolute inset-0 bg-[#202744]/75 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                  <div className="text-center text-white p-2">
                    <Camera className="mx-auto h-5 w-5 mb-1 text-white" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Replace Image</span>
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
              <div className="flex items-center justify-center space-x-2 font-sans text-xs text-[#8B6CF6]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading thumbnail...</span>
              </div>
            )}
          </div>
        </div>

        {/* Screenshots Gallery Column */}
        <div className="md:col-span-2 rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          <div className="border-b border-[#F0EBE1] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-[#8B6CF6]" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744]">
                Screenshots Gallery
              </h3>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#8B6CF6] border border-violet-100">
                {project.images?.length || 0}
              </span>
            </div>

            {/* Add screenshot button */}
            {!isSuper && (
              <label className="inline-flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6] hover:text-[#8B6CF6] transition cursor-pointer select-none shadow-xs">
                <Plus className="h-3.5 w-3.5" />
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
              <div className="flex items-center justify-center space-x-2 font-sans text-xs text-[#8B6CF6] mb-4 bg-violet-50/50 border border-dashed border-violet-200 py-3 rounded-xl">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading screenshot...</span>
              </div>
            )}

            {!project.images || project.images.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#EAE5DD] rounded-xl bg-[#FAF8F5]/50">
                <ImageIcon className="mx-auto h-8 w-8 text-[#8B6CF6]/40 mb-2 stroke-1" />
                <p className="font-sans text-xs text-[#69718A] font-semibold">No screenshots added to gallery.</p>
                <p className="font-sans text-[11px] text-[#69718A]/80 mt-0.5">Upload screenshots to showcase interfaces or details.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-video rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] overflow-hidden shadow-xs hover:border-[#8B6CF6]/40 transition"
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
                        className="absolute top-2 right-2 rounded-lg bg-[#202744]/80 hover:bg-rose-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer disabled:opacity-50 shadow-xs"
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
