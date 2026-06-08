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
    if (window.confirm('Are you sure you want to permanently delete this experience?')) {
      deleteMutation.mutate(experience.id, {
        onSuccess: () => {
          navigate('/admin/experiences');
        },
        onError: (err) => {
          setEditError(err.response?.data?.message || err.message || 'Failed to delete.');
        },
      });
    }
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-450">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-3" />
        <p className="font-sans text-sm">Loading experience details...</p>
      </div>
    );
  }

  if (isError || !experience) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/experiences')}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Experiences</span>
        </button>
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-600 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
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
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition font-sans text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Experiences</span>
        </button>

        {!isEditing && (
          <div className="flex items-center space-x-2">
            <button
              id="edit-experience-btn"
              onClick={handleStartEdit}
              className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="delete-experience-btn"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center space-x-1.5 rounded-md border border-red-200 bg-white px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 hover:border-red-300 transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {editError && (
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-600 font-sans font-medium">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{editError}</span>
        </div>
      )}

      {/* Main Detail Card */}
      {isEditing ? (
        /* ─── EDIT MODE ─── */
        <div className="rounded-xl border border-slate-200 bg-white shadow-3xs">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
              Edit Experience
            </h3>
            <div className="flex items-center space-x-2">
              <button
                id="cancel-edit-btn"
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
              <button
                id="save-edit-btn"
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
                  Position Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-exp-position"
                  type="text"
                  required
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Company / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-exp-company"
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Start Date <span className="text-red-555">*</span>
                </label>
                <DatePicker
                  id="edit-exp-startdate"
                  value={editStartDate}
                  onChange={(val) => setEditStartDate(val)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                  <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      id="edit-exp-ispresent"
                      type="checkbox"
                      checked={editIsPresent}
                      onChange={(e) => setEditIsPresent(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span className="font-sans text-[10px] font-bold text-slate-500">Present</span>
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
              <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Company Logo URL
              </label>
              <input
                id="edit-exp-logo"
                type="url"
                value={editCompanyLogo}
                onChange={(e) => setEditCompanyLogo(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
              />
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-slate-950">Published Visibility</h4>
                  <p className="font-sans text-[11px] text-slate-400">Controls if this record appears on the public showcase.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="edit-exp-ispublic"
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
                id="edit-exp-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Detail your operational roles..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[120px]"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        <div className="rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden">
          {/* Header with company info */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {experience.companyLogo ? (
                  <img
                    src={experience.companyLogo}
                    alt={experience.company}
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-xl object-cover bg-white border border-slate-200/60 shadow-3xs"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white font-mono text-sm font-bold text-slate-400 uppercase border border-slate-200/50 shadow-3xs">
                    {experience.company.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-sans text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
                    {experience.position}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-sans text-sm font-medium text-slate-600">{experience.company}</span>
                  </div>
                </div>
              </div>

              <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
                experience.isPublic
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {experience.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                <span>{experience.isPublic ? 'Public' : 'Hidden'}</span>
              </span>
            </div>
          </div>

          {/* Detail Fields */}
          <div className="px-6 py-5 space-y-5">

            {/* Timeline Section */}
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Calendar className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeline</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-sans text-sm font-semibold text-slate-800">{formatDate(experience.startDate)}</span>
                  <span className="text-slate-300">—</span>
                  {experience.endDate ? (
                    <span className="font-sans text-sm font-semibold text-slate-800">{formatDate(experience.endDate)}</span>
                  ) : (
                    <span className="font-sans text-sm font-bold text-emerald-600">Present</span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-slate-400 mt-0.5 font-semibold">
                  Duration: {getDuration(experience.startDate, experience.endDate)}
                </p>
              </div>
            </div>

            {/* Description */}
            {experience.description && (
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                  <p className="font-sans text-sm text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">
                    {experience.description}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</p>
                <p className="font-mono text-[11px] text-slate-600 mt-0.5">{formatDate(experience.createdAt)}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                <p className="font-mono text-[11px] text-slate-600 mt-0.5">{formatDate(experience.updatedAt)}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Linked Projects Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="h-4 w-4 text-slate-500" />
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800">
              Linked Projects
            </h3>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500">
              {linkedProjects.length}
            </span>
          </div>
        </div>

        {linkedProjects.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <FolderGit2 className="mx-auto h-6 w-6 text-slate-300 mb-2 stroke-1" />
            <p className="font-sans text-xs text-slate-400">No projects linked to this experience.</p>
            <p className="font-sans text-[11px] text-slate-350 mt-0.5">You can link a project to this experience from the Projects page.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {linkedProjects.map((proj) => (
              <div
                key={proj.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center space-x-3">
                  {proj.thumbnail ? (
                    <img
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="h-9 w-9 rounded-lg object-cover border border-slate-200/50"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-mono text-[9px] font-bold text-slate-400 uppercase">
                      {proj.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-sans text-xs font-bold text-slate-900 leading-tight">{proj.title}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-[9px] font-bold text-slate-400 uppercase">{proj.type}</span>
                      {proj.techStacks?.length > 0 && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-sans text-[10px] text-slate-400">
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
                      className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:text-slate-700 hover:border-slate-400 transition"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <span className={`inline-flex rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${
                    proj.isPublic
                      ? 'bg-slate-50 text-slate-500 border border-slate-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {proj.isPublic ? 'Public' : 'Hidden'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
