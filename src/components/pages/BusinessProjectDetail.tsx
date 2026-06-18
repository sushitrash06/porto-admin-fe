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
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </button>

        {!isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartEdit}
              className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center space-x-1.5 rounded-md border border-red-250 bg-white px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-red-550 hover:bg-red-50 hover:border-red-300 transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Error display */}
      {editError && (
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-655 font-sans font-medium">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{editError}</span>
        </div>
      )}

      {/* Main Details editing card */}
      {isEditing ? (
        /* EDIT MODE form details */
        <div className="rounded-xl border border-slate-200 bg-white shadow-3xs">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
              Modify Case Study details
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex items-center space-x-1 rounded-md bg-black px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                <span>Save Specs</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Title */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Project Title <span className="text-red-550">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Client Name */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Location */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Location Station
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Completion Year
                </label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            {/* Project type select */}
            <div>
              <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Project Category
              </label>
              <Listbox value={editType} onChange={setEditType}>
                <div className="relative">
                  <ListboxButton className="relative w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer">
                    <span className="block truncate text-left">{currentTypeLabel}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                    {projectTypesList.map(type => (
                      <ListboxOption
                        key={type.value}
                        value={type.value}
                        className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>{type.label}</span>
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

            {/* Visibility Toggle */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-slate-950">Visibility Visibility</h4>
                  <p className="font-sans text-[11px] text-slate-400">Specify if this project case study is visible to clients.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[140px]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* READ ONLY VIEW MODE details */
        <div className="rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden">
          {/* Main Title Header */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 font-mono text-sm font-bold text-slate-500 border border-slate-200/50 shadow-3xs">
                  <FolderGit2 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h2 className="font-sans text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
                    {project.title}
                  </h2>
                  <div className="flex items-center space-x-2.5 mt-1.5">
                    <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[8px] font-bold bg-slate-100 border border-slate-200 text-slate-550 uppercase">
                      {currentTypeLabel}
                    </span>
                    {project.year && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-sans text-xs font-semibold text-slate-500 flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" />
                          <span>Year: {project.year}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${project.isPublic
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                {project.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                <span>{project.isPublic ? 'Public Showcase' : 'Hidden'}</span>
              </span>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Spec: Client */}
            {project.clientName && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Building className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Client</p>
                  <p className="font-sans text-sm font-semibold text-slate-800 mt-1">{project.clientName}</p>
                </div>
              </div>
            )}

            {/* Spec: Location */}
            {project.location && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Location</p>
                  <p className="font-sans text-sm font-semibold text-slate-800 mt-1">{project.location}</p>
                </div>
              </div>
            )}

            {/* Spec: Description */}
            {project.description && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Info className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description Overview</p>
                  <p className="font-sans text-sm text-slate-600 leading-relaxed mt-1.5 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            )}

            {/* Spec: Timestamps */}
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

      {/* Media Management (Thumbnail & Screen Gallery) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Thumbnail Column */}
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden h-fit">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
              Project Thumbnail
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="relative group aspect-video w-full rounded-lg bg-slate-55 border border-slate-200 overflow-hidden flex items-center justify-center">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  alt="Project Thumbnail" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-350 p-4">
                  <ImageIcon className="mx-auto h-8 w-8 mb-1.5 stroke-1" />
                  <span className="font-sans text-[10px]">No thumbnail uploaded</span>
                </div>
              )}

              {/* Upload overlay hover trigger */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                <div className="text-center text-white p-2">
                  <Camera className="mx-auto h-5 w-5 mb-1" />
                  <span className="font-sans text-[9px] font-bold uppercase tracking-wider">Replace Thumbnail</span>
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
              <div className="flex items-center justify-center space-x-1.5 font-sans text-[10px] text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading thumbnail...</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Screenshots Column */}
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

            {/* Add screenshot button trigger */}
            <label className="inline-flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-wider text-slate-655 hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer select-none">
              <Plus className="h-3 w-3" />
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
              <div className="flex items-center justify-center space-x-1.5 font-sans text-xs text-slate-500 mb-4 bg-slate-50 border border-dashed border-slate-250 py-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-slate-650" />
                <span>Uploading screenshot to gallery...</span>
              </div>
            )}

            {!project.images || project.images.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <ImageIcon className="mx-auto h-7 w-7 text-slate-300 mb-2 stroke-1" />
                <p className="font-sans text-xs text-slate-400 font-medium">No screenshots added to gallery.</p>
                <p className="font-sans text-[10px] text-slate-350 mt-0.5">Upload design specs or interface images.</p>
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
                      className="h-full w-full object-cover"
                    />

                    {/* Screenshot deletion control overlay */}
                    <button
                      onClick={() => handleScreenshotDelete(imgUrl)}
                      className="absolute top-2 right-2 h-7 w-7 bg-red-600 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xs hover:bg-red-700 cursor-pointer"
                      title="Remove screenshot"
                    >
                      <Trash2 className="h-4 w-4" />
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
