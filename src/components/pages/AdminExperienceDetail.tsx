/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExperienceDetail, useUpdateExperience, useDeleteExperience } from '../../hooks/useExperiences';
import { useMyProjects } from '../../hooks/useProjects';
import { DatePicker } from '../atoms/DatePicker';
import {
  ArrowLeft, Calendar, Briefcase, Building2, Globe, Lock,
  Edit, Trash2, Save, X, Loader2, ShieldAlert, FolderGit2, ExternalLink
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

export const AdminExperienceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: experience, isLoading, isError, error } = useExperienceDetail(id);
  const { data: allProjects } = useMyProjects();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editCompany, setEditCompany] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editIsPresent, setEditIsPresent] = useState(false);
  const [editCompanyLogo, setEditCompanyLogo] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
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

  // Filter projects linked to this experience
  const linkedProjects = allProjects?.filter(p => p.experienceId === id) || [];

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

  const formatDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  const handleStartEdit = () => {
    if (!experience) return;
    setEditCompany(experience.company);
    setEditPosition(experience.position);
    setEditDescription(experience.description || '');
    setEditStartDate(formatDateForInput(experience.startDate));
    setEditEndDate(formatDateForInput(experience.endDate));
    setEditIsPresent(!experience.endDate);
    setEditCompanyLogo(experience.companyLogo || '');
    setEditIsPublic(experience.isPublic);
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!experience) return;
    setEditError('');

    if (!editCompany.trim() || !editPosition.trim() || !editStartDate) {
      setEditError('Company, Position, and Start Date are required.');
      return;
    }

    updateMutation.mutate({
      id: experience.id,
      company: editCompany.trim(),
      position: editPosition.trim(),
      description: editDescription.trim() || undefined,
      startDate: editStartDate,
      endDate: editIsPresent ? null : (editEndDate || null),
      companyLogo: editCompanyLogo.trim() || undefined,
      isPublic: editIsPublic,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: (err) => {
        setEditError(err.response?.data?.message || err.message || 'Failed to update.');
      }
    });
  };

  const handleDelete = () => {
    if (!experience) return;
    setConfirmState({
      isOpen: true,
      title: 'Permanently Delete Experience',
      message: 'Are you sure you want to permanently delete this experience? This action cannot be undone and will dissociate any linked projects from this milestone.',
      variant: 'danger',
      showCancel: true,
      onConfirm: () => {
        deleteMutation.mutate(experience.id, {
          onSuccess: () => {
            navigate('/admin/experiences');
          },
          onError: (err) => {
            setEditError(err.response?.data?.message || err.message || 'Failed to delete.');
          },
        });
      }
    });
  };

  // Duration calculator
  const getDuration = (start?: string | null, end?: string | null) => {
    if (!start) return '';
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months < 0) months = 0;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years > 0 && rem > 0) return `${years} yr ${rem} mo`;
    if (years > 0) return `${years} yr`;
    return `${rem} mo`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#69718A]">
        <Loader2 className="h-10 w-10 animate-spin text-[#8B6CF6] mb-3" />
        <p className="font-sans text-sm font-medium">Loading experience details...</p>
      </div>
    );
  }

  if (isError || !experience) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/experiences')}
          className="flex items-center space-x-2 text-[#69718A] hover:text-[#202744] transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Experiences</span>
        </button>
        <div className="flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="font-bold">Error loading experience</p>
            <p className="mt-1">{error?.response?.data?.message || error?.message || 'Experience not found or access denied.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-experiences-btn"
          onClick={() => navigate('/admin/experiences')}
          className="inline-flex items-center space-x-2 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2 text-xs font-semibold text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Experiences</span>
        </button>

        {!isEditing && (
          <div className="flex items-center space-x-2">
            <button
              id="edit-experience-btn"
              onClick={handleStartEdit}
              className="flex items-center space-x-1.5 rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-bold text-[#202744] hover:border-[#8B6CF6]/40 hover:text-[#8B6CF6] hover:bg-[#8B6CF6]/5 transition shadow-xs cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="delete-experience-btn"
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

      {/* Main Detail Card */}
      {isEditing ? (
        /* ─── EDIT MODE ─── */
        <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />
          <div className="border-b border-[#EAE5DD] px-6 py-4 flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold text-[#202744]">
              Edit Experience
            </h3>
            <div className="flex items-center space-x-2">
              <button
                id="cancel-edit-btn"
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-1.5 font-sans text-xs font-bold text-[#69718A] hover:bg-[#FAF8F5] cursor-pointer shadow-xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <button
                id="save-edit-btn"
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
                  Position Title <span className="text-[#8B6CF6]">*</span>
                </label>
                <input
                  id="edit-exp-position"
                  type="text"
                  required
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Company / Organization <span className="text-[#8B6CF6]">*</span>
                </label>
                <input
                  id="edit-exp-company"
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Start Date <span className="text-[#8B6CF6]">*</span>
                </label>
                <DatePicker
                  id="edit-exp-startdate"
                  value={editStartDate}
                  onChange={(val) => setEditStartDate(val)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-sans text-xs font-bold text-[#202744]">End Date</label>
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      id="edit-exp-ispresent"
                      type="checkbox"
                      checked={editIsPresent}
                      onChange={(e) => setEditIsPresent(e.target.checked)}
                      className="rounded border-[#EAE5DD] text-[#8B6CF6] focus:ring-[#8B6CF6] h-3.5 w-3.5"
                    />
                    <span className="font-sans text-xs font-medium text-[#69718A]">Present</span>
                  </label>
                </div>
                <DatePicker
                  id="edit-exp-enddate"
                  disabled={editIsPresent}
                  value={editEndDate}
                  onChange={(val) => setEditEndDate(val)}
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                Company Logo URL
              </label>
              <input
                id="edit-exp-logo"
                type="url"
                value={editCompanyLogo}
                onChange={(e) => setEditCompanyLogo(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
              />
            </div>

            <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">Public Visibility</h4>
                  <p className="font-sans text-[11px] text-[#69718A]">Display this experience on your public portfolio.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="edit-exp-ispublic"
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
                Description & Responsibilities
              </label>
              <textarea
                id="edit-exp-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Detail your roles and achievements..."
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 min-h-[120px]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
          {/* Header with company info */}
          <div className="border-b border-[#EAE5DD] bg-[#FAF8F5]/80 px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                {experience.companyLogo ? (
                  <img
                    src={experience.companyLogo}
                    alt={experience.company}
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-2xl object-cover bg-white border border-[#EAE5DD] shadow-xs"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8E0FF] font-sans text-base font-bold text-[#8B6CF6] uppercase border border-[#EAE5DD] shadow-xs">
                    {experience.company.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-sans text-xl font-extrabold text-[#202744] leading-tight">
                    {experience.position}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-[#8B6CF6]" />
                    <span className="font-sans text-sm font-semibold text-[#69718A]">{experience.company}</span>
                  </div>
                </div>
              </div>

              <span className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                experience.isPublic
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]'
              }`}>
                {experience.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                <span>{experience.isPublic ? 'Public' : 'Hidden'}</span>
              </span>
            </div>
          </div>

          {/* Detail Fields */}
          <div className="px-6 py-6 space-y-6">

            {/* Timeline Section */}
            <div className="flex items-start space-x-3.5">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE5DD]">
                <Calendar className="h-4 w-4 text-[#8B6CF6]" />
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Timeline</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-sans text-sm font-semibold text-[#202744]">{formatDate(experience.startDate)}</span>
                  <span className="text-[#69718A]">—</span>
                  {experience.endDate ? (
                    <span className="font-sans text-sm font-semibold text-[#202744]">{formatDate(experience.endDate)}</span>
                  ) : (
                    <span className="font-sans text-sm font-bold text-emerald-600">Present</span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#69718A] mt-1 font-medium">
                  Duration: <span className="text-[#202744] font-semibold">{getDuration(experience.startDate, experience.endDate)}</span>
                </p>
              </div>
            </div>

            {/* Description */}
            {experience.description && (
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE5DD]">
                  <Briefcase className="h-4 w-4 text-[#4697F5]" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Description</p>
                  <p className="font-sans text-sm text-[#202744] leading-relaxed mt-1 whitespace-pre-wrap">
                    {experience.description}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="border-t border-[#EAE5DD] pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Created</p>
                <p className="font-sans text-xs text-[#202744] mt-0.5 font-medium">{formatDate(experience.createdAt)}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider">Last Updated</p>
                <p className="font-sans text-xs text-[#202744] mt-0.5 font-medium">{formatDate(experience.updatedAt)}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Linked Projects Section */}
      <div className="rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden">
        <div className="border-b border-[#EAE5DD] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FolderGit2 className="h-4 w-4 text-[#8B6CF6]" />
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744]">
              Linked Projects
            </h3>
            <span className="rounded-full bg-[#E8E0FF] px-2.5 py-0.5 text-[10px] font-bold text-[#8B6CF6]">
              {linkedProjects.length}
            </span>
          </div>
        </div>

        {linkedProjects.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <FolderGit2 className="mx-auto h-8 w-8 text-[#69718A]/40 mb-2 stroke-1" />
            <p className="font-sans text-xs font-medium text-[#69718A]">No projects linked to this experience.</p>
            <p className="font-sans text-[11px] text-[#69718A]/80 mt-0.5">You can link a project to this experience from the Projects page.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE1]">
            {linkedProjects.map((proj) => (
              <div
                key={proj.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF8F5]/60 transition"
              >
                <div className="flex items-center space-x-3.5">
                  {proj.thumbnail ? (
                    <img
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="h-10 w-10 rounded-xl object-cover border border-[#EAE5DD] shadow-xs"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8E0FF] font-sans text-[10px] font-bold text-[#8B6CF6] uppercase">
                      {proj.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-sans text-xs font-bold text-[#202744] leading-tight">{proj.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="rounded-md bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-semibold text-[#69718A] border border-[#EAE5DD] uppercase">{proj.type}</span>
                      {proj.techStacks?.length > 0 && (
                        <>
                          <span className="text-[#EAE5DD]">·</span>
                          <span className="font-sans text-[11px] text-[#69718A]">
                            {proj.techStacks.slice(0, 3).join(', ')}
                            {proj.techStacks.length > 3 && ` +${proj.techStacks.length - 3}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {proj.projectUrl && (
                    <a
                      href={proj.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#EAE5DD] p-2 text-[#69718A] hover:text-[#8B6CF6] hover:border-[#8B6CF6]/40 hover:bg-[#8B6CF6]/5 transition shadow-xs"
                      title="Visit URL"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    proj.isPublic
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#FAF8F5] text-[#69718A] border border-[#EAE5DD]'
                  }`}>
                    {proj.isPublic ? 'Public' : 'Hidden'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
