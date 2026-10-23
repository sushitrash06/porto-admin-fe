/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Palette, Copy, Trash2, Edit3, Globe,
  CheckCircle2, AlertCircle, Loader2, Users, Layers, Eye
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  useAdminTemplates,
  useTogglePublishTemplate,
  useCloneTemplate,
  useDeleteTemplate,
} from '../../hooks/useTemplates';
import type { TemplateCategory, Template } from '../../types/theme';
import { Pagination } from '../molecules/Pagination';
import { ThemeDeviceSimulator } from '../molecules/ThemeDeviceSimulator';
import { useToast } from '../../hooks/useToast';

export const AdminTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<TemplateCategory | 'ALL'>('ALL');
  const [publishStatus, setPublishStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [page, setPage] = useState<number>(1);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<Template | null>(null);

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
          const msg = `Template "${template.name}" ${!template.isPublished ? 'published' : 'moved to drafts'}.`;
          showNotification(msg);
          toast.success(msg);
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          const errMsg = err.response?.data?.message || 'Failed to update publish state.';
          showNotification(errMsg);
          toast.error(errMsg);
        },
      }
    );
  };

  const handleClone = (template: Template) => {
    cloneMutation.mutate(template.id, {
      onSuccess: (cloned) => {
        const msg = `Cloned template as "${cloned.name}".`;
        showNotification(msg);
        toast.success(msg);
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        const errMsg = err.response?.data?.message || 'Failed to clone template.';
        showNotification(errMsg);
        toast.error(errMsg);
      },
    });
  };

  const handleDelete = () => {
    if (!deletingTemplate) return;
    deleteMutation.mutate(deletingTemplate.id, {
      onSuccess: () => {
        const msg = `Template "${deletingTemplate.name}" deleted.`;
        showNotification(msg);
        toast.success(msg);
        setDeletingTemplate(null);
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        const errMsg = err.response?.data?.message || 'Failed to delete template.';
        showNotification(errMsg);
        toast.error(errMsg);
        setDeletingTemplate(null);
      },
    });
  };

  return (
    <div className="space-y-6 font-sans text-[#202744]">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER & ACTIONS
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EAE5DD]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8E0FF] border border-[#8B6CF6]/30 text-[#8B6CF6] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Theme & Section Blueprints</span>
          </div>
          <h1 className="text-2xl font-black text-[#202744] tracking-tight">
            Template Architecture Studio
          </h1>
          <p className="text-xs text-[#69718A] mt-0.5">
            Craft, configure, and publish drag-and-drop AST layout blueprints for user portfolios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/templates/builder')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A5CE6] text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* Floating Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-[#202744] text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FILTERS & SEARCH BAR
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl border border-[#EAE5DD] bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#69718A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by template name or slug..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] text-xs text-[#202744] focus:bg-white focus:outline-hidden focus:border-[#8B6CF6] placeholder:text-[#69718A] transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory | 'ALL')}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] text-xs text-[#202744] focus:bg-white focus:outline-hidden focus:border-[#8B6CF6] font-medium transition cursor-pointer"
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
              className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] text-xs text-[#202744] focus:bg-white focus:outline-hidden focus:border-[#8B6CF6] font-medium transition cursor-pointer"
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
        <div className="py-24 flex flex-col items-center justify-center text-[#69718A]">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B6CF6] mb-3" />
          <p className="text-xs font-semibold">Retrieving templates catalog...</p>
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Failed to load templates</h4>
            <p className="text-xs mt-0.5">
              {(error as AxiosError<{ message?: string }>)?.response?.data?.message || 'Check your database or backend connection.'}
            </p>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-[#EAE5DD] rounded-2xl bg-white p-8 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E8E0FF] flex items-center justify-center text-[#8B6CF6] mb-4">
            <Palette className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-[#202744]">No Templates Found</h3>
          <p className="text-xs text-[#69718A] max-w-sm mt-1 mb-6">
            No templates match your search criteria. Build a new template blueprint in the Theme Builder Studio.
          </p>
          <button
            type="button"
            onClick={() => navigate('/admin/templates/builder')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8B6CF6] hover:bg-[#7A5CE6] text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => {
            const sectionCount = tpl.layoutConfig?.sections?.length || 0;
            const primaryColor = tpl.layoutConfig?.theme?.primaryColor || '#8B6CF6';
            const bgColor = tpl.layoutConfig?.theme?.backgroundColor || '#FAF8F5';

            return (
              <div
                key={tpl.id}
                className="group rounded-2xl border border-[#EAE5DD] bg-white overflow-hidden shadow-2xs hover:shadow-lg hover:border-[#8B6CF6]/40 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Visual Mockup Header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#FAF8F5] border-b border-[#EAE5DD]">
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
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs mb-2"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-[#69718A] uppercase tracking-widest">
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
                            : 'bg-[#FFC45B] text-[#202744]'
                        }`}
                      >
                        {tpl.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {tpl.isDefault && (
                        <span className="px-2 py-1 rounded-md bg-[#8B6CF6] text-white font-mono text-[9px] font-bold uppercase tracking-wider shadow-xs">
                          Default
                        </span>
                      )}
                    </div>

                    <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-[#202744]/75 backdrop-blur-xs text-white font-mono text-[9px] font-bold uppercase">
                      v{tpl.version}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#69718A] uppercase mb-1">
                      <span className="font-bold text-[#8B6CF6]">{tpl.category}</span>
                      <span>{sectionCount} Sections</span>
                    </div>

                    <h3 className="font-bold text-base text-[#202744] group-hover:text-[#8B6CF6] transition leading-snug">
                      {tpl.name}
                    </h3>

                    <p className="text-xs text-[#69718A] line-clamp-2 mt-1.5 leading-relaxed">
                      {tpl.description || 'No blueprint description provided.'}
                    </p>

                    {/* Stats pill */}
                    <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-[#69718A] font-mono text-[11px]">
                        <Users className="w-3.5 h-3.5 text-[#69718A]" />
                        <span>{tpl._count?.profiles || 0} active profiles</span>
                      </span>

                      {/* Color Preview Swatch */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-[#EAE5DD]"
                          style={{ backgroundColor: primaryColor }}
                          title={`Primary: ${primaryColor}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-[#EAE5DD]"
                          style={{ backgroundColor: bgColor }}
                          title={`Background: ${bgColor}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE5DD] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/templates/builder/${tpl.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#202744] text-white hover:bg-[#181E35] text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-3xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8B6CF6]" />
                    <span>Builder Studio</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewingTemplate(tpl)}
                      className="p-2 rounded-xl border border-[#EAE5DD] bg-white text-[#69718A] hover:text-[#8B6CF6] hover:border-[#8B6CF6] hover:bg-[#FAF8F5] text-xs transition cursor-pointer shadow-3xs"
                      title="Quick Live Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(tpl)}
                      className={`p-2 rounded-xl border text-xs transition cursor-pointer shadow-3xs ${
                        tpl.isPublished
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-[#EAE5DD] bg-white text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744]'
                      }`}
                      title={tpl.isPublished ? 'Unpublish to draft' : 'Publish template'}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClone(tpl)}
                      disabled={cloneMutation.isPending}
                      className="p-2 rounded-xl border border-[#EAE5DD] bg-white text-[#69718A] hover:text-[#8B6CF6] hover:border-[#8B6CF6] hover:bg-[#FAF8F5] text-xs transition cursor-pointer shadow-3xs disabled:opacity-50"
                      title="Clone / Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingTemplate(tpl)}
                      className="p-2 rounded-xl border border-[#EAE5DD] bg-white text-[#69718A] hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs transition cursor-pointer shadow-3xs"
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
          {meta && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={queryParams.limit}
              itemLabel="templates"
              onPageChange={setPage}
              variant="standalone"
            />
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. LIVE SIMULATOR PREVIEW MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      {previewingTemplate && (
        <ThemeDeviceSimulator
          data={{
            layout: previewingTemplate.layoutConfig,
          }}
          title={`Template Preview: ${previewingTemplate.name}`}
          onClose={() => setPreviewingTemplate(null)}
          isModal
        />
      )}

            {/* ─────────────────────────────────────────────────────────────────────────────
          4. DELETE CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      {deletingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202744]/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#EAE5DD] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#202744]">Delete Template?</h3>
            <p className="text-xs text-[#69718A] mt-2 leading-relaxed">
              Are you sure you want to delete template{' '}
              <strong className="text-[#202744]">{deletingTemplate.name}</strong>? Profiles
              currently using this template will fallback to the platform default template.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                className="px-4 py-2 rounded-xl border border-[#EAE5DD] bg-white text-[#69718A] text-xs font-semibold hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
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
