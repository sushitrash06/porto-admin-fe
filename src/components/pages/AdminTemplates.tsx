/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Palette, Copy, Trash2, Edit3, Globe,
  CheckCircle2, AlertCircle, Loader2, Users, Layers
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  useAdminTemplates,
  useTogglePublishTemplate,
  useCloneTemplate,
  useDeleteTemplate,
} from '../../hooks/useTemplates';
import type { TemplateCategory, Template } from '../../types/theme';

export const AdminTemplates: React.FC = () => {
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<TemplateCategory | 'ALL'>('ALL');
  const [publishStatus, setPublishStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [page, setPage] = useState<number>(1);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  // Queries & Mutations
  const queryParams = {
    search: search.trim() || undefined,
    category: category === 'ALL' ? undefined : category,
    isPublished:
      publishStatus === 'PUBLISHED'
        ? true
        : publishStatus === 'DRAFT'
        ? false
        : undefined,
    page,
    limit: 12,
  };

  const { data: response, isLoading, isError, error } = useAdminTemplates(queryParams);
  const togglePublishMutation = useTogglePublishTemplate();
  const cloneMutation = useCloneTemplate();
  const deleteMutation = useDeleteTemplate();

  const templates = response?.data || [];
  const meta = response?.meta;

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleTogglePublish = (template: Template) => {
    togglePublishMutation.mutate(
      { id: template.id, isPublished: !template.isPublished },
      {
        onSuccess: () => {
          showNotification(
            `Template "${template.name}" ${!template.isPublished ? 'published' : 'moved to drafts'}.`
          );
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          showNotification(err.response?.data?.message || 'Failed to update publish state.');
        },
      }
    );
  };

  const handleClone = (template: Template) => {
    cloneMutation.mutate(template.id, {
      onSuccess: (cloned) => {
        showNotification(`Cloned template as "${cloned.name}".`);
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showNotification(err.response?.data?.message || 'Failed to clone template.');
      },
    });
  };

  const handleDelete = () => {
    if (!deletingTemplate) return;
    deleteMutation.mutate(deletingTemplate.id, {
      onSuccess: () => {
        showNotification(`Template "${deletingTemplate.name}" deleted.`);
        setDeletingTemplate(null);
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showNotification(err.response?.data?.message || 'Failed to delete template.');
        setDeletingTemplate(null);
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER & ACTIONS
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3 h-3" />
            <span>Theme & Section Blueprints</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Template Architecture Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft, configure, and publish drag-and-drop AST layout blueprints for user portfolios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/templates/builder')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition active:scale-95 shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* Floating Notification */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FILTERS & SEARCH BAR
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by template name or slug..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory | 'ALL')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="DESIGNER">DESIGNER</option>
              <option value="BUSINESS">BUSINESS</option>
              <option value="CREATIVE">CREATIVE</option>
              <option value="MINIMAL">MINIMAL</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={publishStatus}
              onChange={(e) => setPublishStatus(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. TEMPLATES GRID VIEW
         ───────────────────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-slate-800 mb-3" />
          <p className="text-xs font-semibold">Retrieving templates catalog...</p>
        </div>
      ) : isError ? (
        <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Failed to load templates</h4>
            <p className="text-xs mt-0.5">
              {(error as AxiosError<{ message?: string }>)?.response?.data?.message || 'Check your database or backend connection.'}
            </p>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <Palette className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Templates Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
            No templates match your search criteria. Build a new template blueprint in the Theme Builder Studio.
          </p>
          <button
            type="button"
            onClick={() => navigate('/admin/templates/builder')}
            className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
          >
            Create First Template
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const sectionCount = tpl.layoutConfig?.sections?.length || 0;
            const primaryColor = tpl.layoutConfig?.theme?.primaryColor || '#000000';
            const bgColor = tpl.layoutConfig?.theme?.backgroundColor || '#ffffff';

            return (
              <div
                key={tpl.id}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Visual Mockup Header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                    {tpl.thumbnail ? (
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                        style={{ backgroundColor: bgColor }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md mb-2"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {tpl.slug}
                        </span>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider shadow-xs ${
                          tpl.isPublished
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {tpl.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {tpl.isDefault && (
                        <span className="px-2 py-1 rounded-md bg-indigo-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow-xs">
                          Default
                        </span>
                      )}
                    </div>

                    <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white font-mono text-[9px] font-bold uppercase">
                      v{tpl.version}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                      <span>{tpl.category}</span>
                      <span>{sectionCount} Sections</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                      {tpl.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {tpl.description || 'No blueprint description provided.'}
                    </p>

                    {/* Stats pill */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tpl._count?.profiles || 0} active profiles</span>
                      </span>

                      {/* Color Preview Swatch */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: primaryColor }}
                          title={`Primary: ${primaryColor}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: bgColor }}
                          title={`Background: ${bgColor}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/templates/builder/${tpl.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Builder Studio</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(tpl)}
                      className={`p-2 rounded-lg border text-xs transition ${
                        tpl.isPublished
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title={tpl.isPublished ? 'Unpublish to draft' : 'Publish template'}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClone(tpl)}
                      disabled={cloneMutation.isPending}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs transition"
                      title="Clone / Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingTemplate(tpl)}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs transition"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Page {meta.page} of {meta.totalPages} ({meta.total} templates)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. DELETE CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      {deletingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Delete Template?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete template{' '}
              <strong className="text-slate-800">{deletingTemplate.name}</strong>? Profiles
              currently using this template will fallback to the platform default template.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition flex items-center gap-1.5"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;
