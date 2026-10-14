/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useBusinessProjectDetail, 
  useUpdateBusinessProject, 
  useDeleteBusinessProject, 
  useUploadBusinessProjectThumbnail, 
  useUploadBusinessProjectImage, 
  useDeleteBusinessProjectImage 
} from '../../hooks/useBusinessProjects';
import { 
  ArrowLeft, FolderGit2, Globe, Edit, Trash2, Save, X, Loader2, 
  ShieldAlert, Camera, Plus, Lock, Building, Info, 
  Image as ImageIcon, ChevronDown, Check, Calendar, MapPin
} from 'lucide-react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

const projectTypesList = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'INSTITUTIONAL', label: 'Institutional' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'RENOVATION', label: 'Renovation' },
  { value: 'INTERIOR_DESIGN', label: 'Interior Design' },
  { value: 'OTHER', label: 'Other' }
];

export const BusinessProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: project, isLoading, isError, error } = useBusinessProjectDetail(id);
  const updateMutation = useUpdateBusinessProject();
  const deleteMutation = useDeleteBusinessProject();
  const uploadThumbnailMutation = useUploadBusinessProjectThumbnail();
  const uploadImageMutation = useUploadBusinessProjectImage();
  const deleteImageMutation = useDeleteBusinessProjectImage();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editType, setEditType] = useState('COMMERCIAL');
  const [editClientName, setEditClientName] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editError, setEditError] = useState('');

  // Deletion confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleStartEdit = () => {
    if (!project) return;
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setEditLocation(project.location || '');
    setEditYear(project.year?.toString() || '');
    setEditType(project.projectType);
    setEditClientName(project.clientName || '');
    setEditIsPublic(project.isPublic);
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

    const yr = editYear.trim() ? parseInt(editYear) : undefined;
    if (editYear.trim() && (isNaN(yr!) || yr! < 1900 || yr! > 2100)) {
      setEditError('Completion Year must be a valid four-digit year.');
      return;
    }

    updateMutation.mutate({
      id: project.id,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      location: editLocation.trim() || undefined,
      year: yr,
      projectType: editType,
      clientName: editClientName.trim() || undefined,
      isPublic: editIsPublic,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: (err) => {
        setEditError(err.response?.data?.message || err.message || 'Failed to update project details.');
      }
    });
  };

  const handleDelete = () => {
    if (!project) return;
    setConfirmState({
      isOpen: true,
      title: 'Permanently Delete Business Project',
      message: 'Are you sure you want to permanently delete this commercial case study? This action cannot be undone and all data associated with it will be lost.',
      onConfirm: () => {
        deleteMutation.mutate(project.id, {
          onSuccess: () => {
            navigate('/admin/business/projects');
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

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && project) {
      setEditError('');
      try {
        for (const file of files) {
          await uploadImageMutation.mutateAsync({ id: project.id, file });
        }
      } catch (err: any) {
        setEditError(err.response?.data?.message || err.message || 'Screenshot upload failed.');
      }
    }
  };

  const handleScreenshotDelete = (imageUrl: string) => {
    if (project) {
      setConfirmState({
        isOpen: true,
        title: 'Delete Screenshot Image',
        message: 'Are you sure you want to delete this screenshot from the gallery?',
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

  const currentTypeLabel = useMemo(() => {
    const typeVal = isEditing ? editType : project?.projectType;
    return projectTypesList.find(t => t.value === typeVal)?.label || typeVal || '';
  }, [isEditing, editType, project]);

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
          onClick={() => navigate('/admin/business/projects')}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-650 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
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
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/business/projects')}
          className="inline-flex items-center space-x-2 text-[#69718A] hover:text-[#202744] transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>

        {!isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2 font-sans text-xs font-semibold text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6] hover:text-[#8B6CF6] transition cursor-pointer shadow-xs"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 font-sans text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Error display */}
      {editError && (
        <div className="flex items-start space-x-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 font-sans font-semibold shadow-xs">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{editError}</span>
        </div>
      )}

      {/* Main Details editing card */}
      {isEditing ? (
        /* EDIT MODE form details */
        <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          <div className="border-b border-[#F0EBE1] bg-[#FAF8F5]/80 px-6 py-4 flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold text-[#202744]">
              Modify Case Study Details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2 font-sans text-xs font-semibold text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] cursor-pointer shadow-xs transition"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8B6CF6] px-4 py-2 font-sans text-xs font-bold text-white shadow-xs hover:bg-[#7A5CE0] transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Specs</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Title */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>

              {/* Client Name */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Location */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Location Station
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Completion Year
                </label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
            </div>

            {/* Project type select */}
            <div>
              <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                Project Category
              </label>
              <Listbox value={editType} onChange={setEditType}>
                <div className="relative">
                  <ListboxButton className="relative w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 text-[#202744] cursor-pointer">
                    <span className="block truncate text-left font-medium">{currentTypeLabel}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-[#69718A]" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-[#EAE5DD]">
                    {projectTypesList.map(type => (
                      <ListboxOption
                        key={type.value}
                        value={type.value}
                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-[#202744] data-[focus]:bg-violet-50 data-[focus]:text-[#8B6CF6]"
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>{type.label}</span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
                                <Check className="h-4 w-4" />
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

            {/* Visibility Toggle */}
            <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Visibility Status</h4>
                  <p className="font-sans text-[11px] text-[#69718A]">Specify if this project case study is visible to clients.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#EAE5DD] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 text-[#202744] min-h-[140px]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* READ ONLY VIEW MODE details */
        <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          {/* Main Title Header */}
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
                    <span className="inline-block rounded-md px-2 py-0.5 font-mono text-[9px] font-bold bg-[#FAF8F5] border border-[#EAE5DD] text-[#8B6CF6] uppercase">
                      {currentTypeLabel}
                    </span>
                    {project.year && (
                      <>
                        <span className="text-[#EAE5DD]">·</span>
                        <span className="font-sans text-xs font-semibold text-[#69718A] flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-[#8B6CF6] mr-1" />
                          <span>Year: {project.year}</span>
                        </span>
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

          <div className="px-6 py-6 space-y-5">
            {/* Spec: Client */}
            {project.clientName && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Business Client</p>
                  <p className="font-sans text-sm font-semibold text-[#202744] mt-0.5">{project.clientName}</p>
                </div>
              </div>
            )}

            {/* Spec: Location */}
            {project.location && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Project Location</p>
                  <p className="font-sans text-sm font-semibold text-[#202744] mt-0.5">{project.location}</p>
                </div>
              </div>
            )}

            {/* Spec: Description */}
            {project.description && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100 shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Description Overview</p>
                  <p className="font-sans text-sm text-[#202744]/80 leading-relaxed mt-1 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            )}

            {/* Spec: Timestamps */}
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

      {/* Media Management (Thumbnail & Screen Gallery) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Thumbnail Column */}
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
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-[#69718A] p-4">
                  <ImageIcon className="mx-auto h-8 w-8 mb-1.5 text-[#8B6CF6]/40 stroke-1" />
                  <span className="font-sans text-xs">No thumbnail uploaded</span>
                </div>
              )}

              {/* Upload overlay hover trigger */}
              <label className="absolute inset-0 bg-[#202744]/75 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                <div className="text-center text-white p-2">
                  <Camera className="mx-auto h-5 w-5 mb-1 text-white" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Replace Thumbnail</span>
                </div>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadThumbnailMutation.isPending}
                  className="hidden"
                />
              </label>
            </div>

            {uploadThumbnailMutation.isPending && (
              <div className="flex items-center justify-center space-x-2 font-sans text-xs text-[#8B6CF6]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading thumbnail...</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Screenshots Column */}
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

            {/* Add screenshot button trigger */}
            <label className="inline-flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6] hover:text-[#8B6CF6] transition cursor-pointer select-none shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Screenshot</span>
              <input 
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshotUpload}
                disabled={uploadImageMutation.isPending}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-5">
            {uploadImageMutation.isPending && (
              <div className="flex items-center justify-center space-x-2 font-sans text-xs text-[#8B6CF6] mb-4 bg-violet-50/50 border border-dashed border-violet-200 py-3 rounded-xl">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading screenshot to gallery...</span>
              </div>
            )}

            {!project.images || project.images.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#EAE5DD] rounded-xl bg-[#FAF8F5]/50">
                <ImageIcon className="mx-auto h-8 w-8 text-[#8B6CF6]/40 mb-2 stroke-1" />
                <p className="font-sans text-xs text-[#69718A] font-semibold">No screenshots added to gallery.</p>
                <p className="font-sans text-[11px] text-[#69718A]/80 mt-0.5">Upload design specs or interface images.</p>
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
                      className="h-full w-full object-cover"
                    />

                    {/* Screenshot deletion control overlay */}
                    <button
                      onClick={() => handleScreenshotDelete(imgUrl)}
                      className="absolute top-2 right-2 rounded-lg bg-[#202744]/80 hover:bg-rose-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-xs"
                      title="Remove screenshot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Remove Item"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
