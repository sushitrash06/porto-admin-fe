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
  useUploadBusinessProjectImage,
  useConvertPersonalProject
} from '../../hooks/useBusinessProjects';
import { useMyProjects } from '../../hooks/useProjects';
import { useToast } from '../../hooks/useToast';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { 
  FolderGit2, Plus, Edit, Trash2, ShieldAlert, 
  Calendar, Loader2, ChevronDown, Check, Building, MapPin, Globe, EyeOff, X,
  Camera, Image as ImageIcon, PlusCircle, ArrowDownToLine, Sparkles
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { SearchBar } from '../molecules/SearchBar';
import { Pagination } from '../molecules/Pagination';
import { Badge } from '../atoms/Badge';
import { TableActionButton } from '../molecules/Table';

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
  const { toast } = useToast();

  // Queries
  const { data: projects, isLoading, isError, error: fetchError } = useBusinessProjects();
  const { data: personalProjects = [], isLoading: isPersonalLoading } = useMyProjects({ enabled: true });
  const createMutation = useCreateBusinessProject();
  const deleteMutation = useDeleteBusinessProject();
  const convertMutation = useConvertPersonalProject();

  // Pagination & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Modal Dialogue Creator state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importDeleteOriginal, setImportDeleteOriginal] = useState<boolean>(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

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
          onSuccess: () => {
            toast.success('Commercial case study deleted successfully.');
          },
          onError: (err) => {
            const errMsg = err.response?.data?.message || err.message || 'Failed to delete project.';
            toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to delete project.');
          }
        });
      }
    });
  };

  const handleImportPersonalProject = (personalProjectId: string) => {
    setConvertingId(personalProjectId);
    convertMutation.mutate(
      { personalProjectId, deleteOriginal: importDeleteOriginal },
      {
        onSuccess: (data) => {
          toast.success(
            `Project "${data.title}" converted to commercial case study successfully!`
          );
          setIsImportModalOpen(false);
          setConvertingId(null);
        },
        onError: (err) => {
          const errMsg =
            err.response?.data?.message || err.message || 'Failed to import personal project.';
          toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to import project.');
          setConvertingId(null);
        },
      }
    );
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
      <div className="mb-6 border-b border-[#F0EBE1] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#8B6CF6] border border-violet-100 shadow-xs">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-bold tracking-tight text-[#202744]">
              Business Projects & Case Studies
            </h2>
            <p className="font-sans text-xs text-[#69718A] mt-0.5">
              Publish commercial case studies, project specs, and client deliverables.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            id="import-from-personal-btn"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex cursor-pointer items-center justify-center space-x-2 rounded-xl border border-[#EAE5DD] bg-white hover:bg-[#FAF8F5] px-4 py-2.5 font-sans text-xs font-semibold text-[#202744] shadow-3xs transition active:scale-95"
            title="Convert a personal portfolio project into a commercial business case study"
          >
            <ArrowDownToLine className="h-4 w-4 text-[#8B6CF6]" />
            <span>Import from Personal</span>
          </button>

          <button
            id="create-new-business-project-btn"
            onClick={handleOpenCreate}
            className="flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-[#8B6CF6] px-4 py-2.5 font-sans text-xs font-semibold text-white shadow-xs transition hover:bg-[#7A5CE0] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      {projects && projects.length > 0 && (
        <div className="max-w-md w-full">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search projects by title, client, or keyword..."
          />
        </div>
      )}

      {/* Error block */}
      {isError && (
        <div className="flex items-start space-x-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-xs text-rose-800 font-sans shadow-xs">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Error loading business projects</p>
            <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
          </div>
        </div>
      )}

      {/* Project content */}
      {isLoading ? (
        <div className="rounded-2xl border border-[#EAE5DD] bg-white p-14 text-center text-[#69718A] shadow-3xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-[#8B6CF6] mx-auto mb-3 border border-violet-100">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="font-sans text-xs font-semibold text-[#202744]">Loading case studies...</p>
          <p className="font-sans text-[11px] text-[#69718A] mt-0.5">Fetching corporate portfolio projects</p>
        </div>
      ) : !projects || projects.length === 0 ? (
        /* Empty state with CTA */
        <div className="rounded-2xl border border-dashed border-[#EAE5DD] bg-[#FAF8F5]/50 p-14 text-center text-[#69718A] font-sans">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-[#8B6CF6] mx-auto mb-3 border border-violet-100 shadow-3xs">
            <FolderGit2 className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#202744]">No Business Projects Published</h3>
          <p className="text-xs text-[#69718A] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Case studies outline specifications, client achievements, location milestones, and screen designs.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center space-x-2 rounded-xl bg-[#8B6CF6] px-4 py-2 font-sans text-xs font-semibold text-white shadow-xs hover:bg-[#7857ED] transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Case Study</span>
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EAE5DD] bg-white p-10 text-center text-[#69718A] font-sans">
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
                className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white shadow-3xs transition-all duration-200 hover:border-[#8B6CF6]/40 hover:shadow-xs"
              >
                {/* Thumbnail Header Area */}
                <div className="relative aspect-video w-full bg-[#FAF8F5] border-b border-[#F3EFEA] overflow-hidden flex items-center justify-center">
                  {proj.thumbnail ? (
                    <img 
                      src={proj.thumbnail} 
                      alt={proj.title} 
                      className="h-full w-full object-cover group-hover:scale-102 transition duration-300"
                    />
                  ) : (
                    <div className="text-[#69718A]/50 flex flex-col items-center">
                      <FolderGit2 className="h-8 w-8 stroke-1 text-[#8B6CF6]/40" />
                      <span className="font-sans text-[9px] font-semibold uppercase tracking-wider mt-1">No Image Preview</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={proj.isPublic ? 'success' : 'neutral'}
                      size="xs"
                      className="backdrop-blur-xs bg-white/90 shadow-3xs"
                    >
                      {proj.isPublic ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      <span>{proj.isPublic ? 'Public' : 'Hidden'}</span>
                    </Badge>
                  </div>
                </div>

                {/* Card Info details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="xs">
                        {proj.projectType.replace('_', ' ')}
                      </Badge>
                      {proj.year && (
                        <span className="flex items-center font-sans text-xs text-[#69718A]">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-[#8B6CF6]" />
                          {proj.year}
                        </span>
                      )}
                    </div>

                    <h4 className="font-sans text-sm font-semibold text-[#202744] group-hover:text-[#8B6CF6] transition line-clamp-1">
                      {proj.title}
                    </h4>

                    {proj.clientName && (
                      <p className="font-sans text-xs text-[#69718A] flex items-center">
                        <Building className="h-3.5 w-3.5 text-[#8B6CF6] mr-1.5 shrink-0" />
                        <span className="truncate">{proj.clientName}</span>
                      </p>
                    )}

                    {proj.location && (
                      <p className="font-sans text-xs text-[#69718A] flex items-center">
                        <MapPin className="h-3.5 w-3.5 text-[#8B6CF6] mr-1.5 shrink-0" />
                        <span className="truncate">{proj.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Footer options */}
                  <div className="mt-5 border-t border-[#F3EFEA] pt-3.5 flex items-center justify-between">
                    <span className="font-sans text-xs font-semibold text-[#8B6CF6] inline-flex items-center group-hover:translate-x-0.5 transition">
                      <span>Configure specs</span>
                      <Edit className="h-3.5 w-3.5 ml-1.5" />
                    </span>

                    <TableActionButton
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      label="Delete case study"
                      variant="danger"
                      onClick={(e) => handleDelete(proj.id, e)}
                      disabled={deleteMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            totalItems={filteredProjects.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="projects"
            onPageChange={setCurrentPage}
            variant="standalone"
          />
        </>
      )}

      {/* Creator Modal Sheet */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-[#202744]/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            
            <div className="px-6 py-4.5 border-b border-[#F0EBE1] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#8B6CF6] border border-violet-100">
                  <Plus className="h-4 w-4" />
                </div>
                <DialogTitle className="font-sans text-sm font-bold text-[#202744]">
                  Create Business Case Study
                </DialogTitle>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="flex items-start space-x-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 font-sans font-semibold shadow-xs">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Assets Upload Section for Creation Mode */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] space-y-4">
                <h4 className="font-mono text-[9px] font-bold text-[#69718A] uppercase tracking-wider">Project Media Assets (Optional)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Thumbnail Selection */}
                  <div className="space-y-2">
                    <span className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Cover Thumbnail</span>
                    <div className="flex items-center space-x-3">
                      {createThumbnailPreview ? (
                        <div className="relative group/thumb">
                          <img
                            src={createThumbnailPreview}
                            alt="Thumbnail Preview"
                            className="h-12 w-20 rounded-lg object-cover border border-[#EAE5DD]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              URL.revokeObjectURL(createThumbnailPreview);
                              setCreateThumbnailFile(null);
                              setCreateThumbnailPreview('');
                            }}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-rose-600 cursor-pointer shadow-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="h-12 w-20 rounded-lg bg-white border border-[#EAE5DD] flex items-center justify-center text-[#8B6CF6]/40">
                          <ImageIcon className="h-5 w-5 stroke-1" />
                        </div>
                      )}
                      <label className="px-3 py-1.5 bg-white border border-[#EAE5DD] hover:border-[#8B6CF6] hover:text-[#8B6CF6] rounded-xl font-sans text-xs font-semibold text-[#202744] cursor-pointer flex items-center space-x-1.5 transition shadow-xs">
                        <Camera className="h-3.5 w-3.5" />
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
                    <span className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Add Screenshots</span>
                    <label className="px-4 py-2.5 bg-white border border-dashed border-[#EAE5DD] hover:border-[#8B6CF6] rounded-xl font-sans text-xs text-[#69718A] cursor-pointer flex flex-col items-center justify-center space-y-0.5 transition h-[48px] shadow-xs">
                      <PlusCircle className="h-4 w-4 text-[#8B6CF6]" />
                      <span className="font-semibold text-[10px] text-[#202744]">Choose Screenshots</span>
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
                    <span className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-2">Selected Screenshots ({createScreenshotPreviews.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {createScreenshotPreviews.map((url, idx) => (
                        <div key={idx} className="relative group/img h-14 w-24 rounded-lg overflow-hidden border border-[#EAE5DD]">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Title */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Acme E-Commerce Deployment"
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
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. PT Acme Indonesia"
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Location */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                    Project Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jakarta, ID (or Remote)"
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
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Project Type Listbox */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Project Type Category
                </label>
                <Listbox value={projectType} onChange={setProjectType}>
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

              {/* Description */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail project specifications, milestones achieved, key technologies..."
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 text-[#202744] min-h-[90px]"
                />
              </div>

              {/* Public visibility toggle */}
              <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-sans text-xs font-bold text-[#202744]">Showcase Visibility</h5>
                    <p className="font-sans text-[11px] text-[#69718A]">Toggle whether this case study is listed publicly.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#EAE5DD] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2.5 border-t border-[#F0EBE1] pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={createMutation.isPending || isCreatingAndUploading}
                  className="rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-semibold text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] cursor-pointer disabled:opacity-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || isCreatingAndUploading}
                  className="rounded-xl bg-[#8B6CF6] px-5 py-2 font-sans text-xs font-bold text-white shadow-xs hover:bg-[#7A5CE0] transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {(createMutation.isPending || isCreatingAndUploading) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 inline" />
                  )}
                  <span>{isCreatingAndUploading ? 'Uploading assets...' : 'Create Case Study'}</span>
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* ─── Import Personal Project Modal ─── */}
      <Dialog
        open={isImportModalOpen}
        onClose={() => !convertingId && setIsImportModalOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-[#202744]/20 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-xl w-full rounded-2xl bg-white border border-[#EAE5DD] shadow-2xl p-6 font-sans animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1]">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8E0FF] text-[#8B6CF6]">
                  <ArrowDownToLine className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-[#202744]">
                    Import from Personal Portfolio
                  </DialogTitle>
                  <p className="text-xs text-[#69718A]">
                    Select a project to convert into a client case study without re-entering data.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={!!convertingId}
                className="text-[#8A90A2] hover:text-[#202744] p-1 rounded-lg hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 flex-1 overflow-y-auto space-y-3">
              {/* Option toggle deleteOriginal */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#202744]">Delete original personal project?</p>
                  <p className="text-[11px] text-[#69718A]">
                    If enabled, the project will be removed from your personal portfolio.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importDeleteOriginal}
                    onChange={(e) => setImportDeleteOriginal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#EAE5DD] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                </label>
              </div>

              {isPersonalLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#69718A]">
                  <Loader2 className="h-6 w-6 animate-spin text-[#8B6CF6] mb-2" />
                  <span className="text-xs">Loading personal projects...</span>
                </div>
              ) : personalProjects.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-xs font-semibold text-[#202744]">No personal projects found</p>
                  <p className="text-xs text-[#69718A] mt-1">
                    Create a project in your Personal Workspace first to import it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {personalProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#EAE5DD] bg-white hover:border-[#8B6CF6]/50 hover:bg-[#FAF8F5] transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
                        {proj.thumbnail ? (
                          <img
                            src={proj.thumbnail}
                            alt={proj.title}
                            className="h-10 w-10 rounded-lg object-cover border border-[#EAE5DD] shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-[#E8E0FF] text-[#8B6CF6] flex items-center justify-center shrink-0">
                            <FolderGit2 className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#202744] truncate">{proj.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-[#8B6CF6] font-semibold uppercase">
                              {proj.type}
                            </span>
                            {proj.techStacks?.length > 0 && (
                              <span className="text-[10px] text-[#69718A] truncate">
                                · {proj.techStacks.slice(0, 3).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleImportPersonalProject(proj.id)}
                        disabled={convertingId === proj.id}
                        className="shrink-0 flex items-center space-x-1.5 rounded-lg bg-[#8B6CF6] hover:bg-[#7857ED] text-white px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
                      >
                        {convertingId === proj.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        <span>{convertingId === proj.id ? 'Importing...' : 'Import'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F0EBE1] flex justify-end">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={!!convertingId}
                className="rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-semibold text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] cursor-pointer transition"
              >
                Close
              </button>
            </div>
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
