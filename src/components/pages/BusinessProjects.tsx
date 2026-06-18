/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useBusinessProjects, 
  useCreateBusinessProject, 
  useDeleteBusinessProject,
  useUploadBusinessProjectThumbnail,
  useUploadBusinessProjectImage
} from '../../hooks/useBusinessProjects';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { 
  FolderGit2, Plus, Edit, Trash2, ShieldAlert, 
  Calendar, Loader2, ChevronDown, Check, Building, MapPin, Globe, EyeOff, X,
  Camera, Image as ImageIcon, PlusCircle
} from 'lucide-react';
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

export const BusinessProjects: React.FC = () => {
  const navigate = useNavigate();

  // Queries
  const { data: projects, isLoading, isError, error: fetchError } = useBusinessProjects();
  const createMutation = useCreateBusinessProject();
  const deleteMutation = useDeleteBusinessProject();

  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Modal Dialogue Creator state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('COMMERCIAL');
  const [clientName, setClientName] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Validation/Error message
  const [error, setError] = useState<string>('');

  // New local state for create mode uploads
  const [createThumbnailFile, setCreateThumbnailFile] = useState<File | null>(null);
  const [createThumbnailPreview, setCreateThumbnailPreview] = useState<string>('');
  const [createScreenshotFiles, setCreateScreenshotFiles] = useState<File[]>([]);
  const [createScreenshotPreviews, setCreateScreenshotPreviews] = useState<string[]>([]);
  const [isCreatingAndUploading, setIsCreatingAndUploading] = useState<boolean>(false);

  const uploadThumbnailMutation = useUploadBusinessProjectThumbnail();
  const uploadImageMutation = useUploadBusinessProjectImage();

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

  const handleOpenCreate = () => {
    setError('');
    setTitle('');
    setLocation('');
    setYear(new Date().getFullYear().toString());
    setDescription('');
    setProjectType('COMMERCIAL');
    setClientName('');
    setIsPublic(true);
    resetCreateMediaState();
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project Title is required.');
      return;
    }

    const yr = year.trim() ? parseInt(year) : undefined;
    if (year.trim() && (isNaN(yr!) || yr! < 1900 || yr! > 2100)) {
      setError('Year must be a valid four-digit year.');
      return;
    }

    const payload = {
      title: title.trim(),
      location: location.trim() || undefined,
      year: yr,
      description: description.trim() || undefined,
      projectType,
      clientName: clientName.trim() || undefined,
      isPublic
    };

    setIsCreatingAndUploading(true);
    createMutation.mutate(payload, {
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
          handleCloseModal();
          navigate(`/admin/business/projects/${newProj.id}`);
        } catch (uploadErr: any) {
          setError(uploadErr.response?.data?.message || uploadErr.message || 'Project created, but asset upload failed.');
        } finally {
          setIsCreatingAndUploading(false);
        }
      },
      onError: (err) => {
        setError(err.response?.data?.message || err.message || 'Failed to create business project.');
        setIsCreatingAndUploading(false);
      }
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card navigation click
    setConfirmState({
      isOpen: true,
      title: 'Delete Business Project Case Study',
      message: 'Are you sure you want to permanently delete this commercial case study? All related details and image registers will be lost.',
      onConfirm: () => {
        deleteMutation.mutate(id, {
          onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to delete project.');
          }
        });
      }
    });
  };

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(proj => 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.clientName && proj.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);
  }, [filteredProjects, activePage]);

  const currentTypeLabel = useMemo(() => {
    return projectTypesList.find(t => t.value === projectType)?.label || projectType;
  }, [projectType]);

  return (
    <div className="space-y-6">
      {/* Header layout */}
      <div className="mb-6 border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
            Business Projects Case Studies
          </h2>
          <p className="font-sans text-xs text-neutral-450 mt-1">
            Publish commercial case studies, project specs, and client deliverables.
          </p>
        </div>

        <button
          id="create-new-business-project-btn"
          onClick={handleOpenCreate}
          className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs transition hover:bg-slate-800 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search Filter */}
      {projects && projects.length > 0 && (
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search projects by title, client, or keyword..."
            className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
          />
        </div>
      )}

      {/* Error block */}
      {isError && (
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-655 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">Error loading business projects</p>
            <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
          </div>
        </div>
      )}

      {/* Project content */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-450">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 mb-2" />
          <p className="font-sans text-xs">Querying project databases...</p>
        </div>
      ) : !projects || projects.length === 0 ? (
        /* Empty state with CTA */
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-450 font-sans">
          <FolderGit2 className="mx-auto h-10 w-10 text-slate-350 mb-3 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">No Business Projects Published</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Case studies outline specifications, client achievements, location milestones, and screen designs.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Case Study</span>
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-450 font-sans">
          <p className="text-xs">No case studies match your query.</p>
        </div>
      ) : (
        <>
          {/* Projects Card Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map(proj => (
              <div
                key={proj.id}
                onClick={() => navigate(`/admin/business/projects/${proj.id}`)}
                className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-3xs transition-all duration-200 hover:border-slate-400 hover:shadow-2xs"
              >
                {/* Thumbnail Header Area */}
                <div className="relative aspect-video w-full bg-slate-50 border-b border-slate-200/50 overflow-hidden flex items-center justify-center">
                  {proj.thumbnail ? (
                    <img 
                      src={proj.thumbnail} 
                      alt={proj.title} 
                      className="h-full w-full object-cover group-hover:scale-103 transition duration-300"
                    />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <FolderGit2 className="h-8 w-8 stroke-1" />
                      <span className="font-sans text-[8px] uppercase tracking-wider mt-1">No Image Specs</span>
                    </div>
                  )}

                  <span className={`absolute top-3 right-3 inline-flex items-center space-x-0.5 rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider bg-white/90 border border-slate-200 shadow-3xs backdrop-blur-xs ${proj.isPublic ? 'text-slate-600' : 'text-slate-400'}`}>
                    {proj.isPublic ? <Globe className="h-2.5 w-2.5 text-slate-500 mr-0.5" /> : <EyeOff className="h-2.5 w-2.5 text-slate-400 mr-0.5" />}
                    <span>{proj.isPublic ? 'Public' : 'Hidden'}</span>
                  </span>
                </div>

                {/* Card Info details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      <span>{proj.projectType.replace('_', ' ')}</span>
                      {proj.year && (
                        <span className="flex items-center">
                          <Calendar className="h-2.5 w-2.5 mr-0.5" />
                          {proj.year}
                        </span>
                      )}
                    </div>

                    <h4 className="font-sans text-sm font-bold text-slate-900 group-hover:text-black line-clamp-1">
                      {proj.title}
                    </h4>

                    {proj.clientName && (
                      <p className="font-sans text-xs text-slate-550 flex items-center">
                        <Building className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                        <span className="truncate">{proj.clientName}</span>
                      </p>
                    )}

                    {proj.location && (
                      <p className="font-sans text-xs text-slate-500 flex items-center">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                        <span className="truncate">{proj.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Footer options */}
                  <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center group-hover:text-black transition">
                      <span>Configure specs</span>
                      <Edit className="h-3 w-3 ml-1" />
                    </span>

                    <button
                      onClick={(e) => handleDelete(proj.id, e)}
                      disabled={deleteMutation.isPending}
                      className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 hover:border-red-200 hover:text-red-650 hover:bg-red-50 transition cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 font-sans text-xs">
              <div className="text-slate-450">
                Showing page <span className="font-semibold text-slate-700">{activePage}</span> of{' '}
                <span className="font-semibold text-slate-700">{totalPages}</span> ({filteredProjects.length} elements)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={activePage <= 1}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-650 transition hover:bg-slate-55 disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={activePage >= totalPages}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-650 transition hover:bg-slate-55 disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Creator Modal Sheet */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                Create Business Case Study
              </DialogTitle>
              <button 
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-650 font-sans font-semibold">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Assets Upload Section for Creation Mode */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">Project Media Assets (Optional)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Thumbnail Selection */}
                  <div className="space-y-2">
                    <span className="block font-sans text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Cover Thumbnail</span>
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
                        <div className="h-12 w-20 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-5 w-5 stroke-1" />
                        </div>
                      )}
                      <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-55 rounded-md font-sans text-[10px] font-bold uppercase tracking-wider text-slate-650 cursor-pointer flex items-center space-x-1.5 transition">
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
                    <span className="block font-sans text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Screenshots</span>
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
                        <div key={idx} className="relative group/img h-14 w-24 rounded-md overflow-hidden border border-slate-200">
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
                    placeholder="e.g. Acme E-Commerce Deployment"
                    className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                  />
                </div>

                {/* Client Name */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. PT Acme Indonesia"
                    className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Location */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Project Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jakarta, ID (or Remote)"
                    className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Completion Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Project Type Listbox */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Project Type Category
                </label>
                <Listbox value={projectType} onChange={setProjectType}>
                  <div className="relative">
                    <ListboxButton className="relative w-full rounded-md border border-slate-200 bg-slate-55 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer">
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

              {/* Description */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail project specifications, milestones achieved, key technologies..."
                  className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[90px]"
                />
              </div>

              {/* Public visibility toggle */}
              <div className="rounded-md border border-slate-200 bg-slate-55 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-sans text-xs font-bold text-slate-900">Showcase Visibility</h5>
                    <p className="font-sans text-[10px] text-slate-400">Toggle whether this case study is listed publicly.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={createMutation.isPending || isCreatingAndUploading}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || isCreatingAndUploading}
                  className="rounded-md bg-black px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {(createMutation.isPending || isCreatingAndUploading) && (
                    <Loader2 className="h-3 w-3 animate-spin mr-1 inline" />
                  )}
                  <span>{isCreatingAndUploading ? 'Uploading assets...' : 'Create Case Study'}</span>
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
