/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Reorder } from 'motion/react';
import {
  ArrowLeft, RotateCcw, Monitor, Tablet, Smartphone, Palette,
  Layers, Sliders, Moon, Sun, Check, Loader2, GripVertical,
  Eye, EyeOff, CheckCircle2, ShieldAlert, ArrowUpDown, ExternalLink,
  AlertTriangle, Pencil
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  usePublishedTemplates,
  useMyTheme,
  useApplyTemplate,
  useUpdateUserThemeConfig,
  useReorderSections,
  useResetThemeConfig,
  useMyBusinessTheme,
  useApplyBusinessTemplate,
  useUpdateBusinessThemeConfig,
  useReorderBusinessSections,
  useResetBusinessThemeConfig,
} from '../../hooks/useTemplates';
import { useProfile } from '../../hooks/useProfile';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import type { User } from '../../types';
import type { Template, TemplateCategory, SectionBlock, LayoutConfig } from '../../types/theme';
import { DynamicPortfolioRenderer } from '../organisms/DynamicPortfolioRenderer';
import { EditSectionContentModal } from '../organisms/EditSectionContentModal';

interface UserThemeStudioProps {
  currentUser: User;
  isBusinessMode?: boolean;
}

const PERSONAL_ACCENT_PRESETS = [
  { name: 'Indigo Aura', color: '#6366f1' },
  { name: 'Emerald Spark', color: '#10b981' },
  { name: 'Purple Bloom', color: '#8b5cf6' },
  { name: 'Rose Velvet', color: '#f43f5e' },
  { name: 'Amber Sunset', color: '#f59e0b' },
  { name: 'Ocean Cyan', color: '#06b6d4' },
  { name: 'Monochrome Noir', color: '#09090b' },
];

const BUSINESS_ACCENT_PRESETS = [
  { name: 'Corporate Blue', color: '#2563eb' },
  { name: 'Emerald Trust', color: '#059669' },
  { name: 'Indigo Modern', color: '#4f46e5' },
  { name: 'Amber Gold', color: '#d97706' },
  { name: 'Rose Prestige', color: '#e11d48' },
  { name: 'Slate Executive', color: '#0f172a' },
];

export const UserThemeStudio: React.FC<UserThemeStudioProps> = ({
  currentUser,
  isBusinessMode = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect whether we are editing business or personal profile
  const isBusiness = isBusinessMode || location.pathname.includes('/business');

  // ─── 1. FETCH PROFILE DATA ────────────────────────────────────────────────
  const { data: profile } = useProfile({ enabled: !isBusiness });
  const { data: businessProfile } = useBusinessProfile({ enabled: isBusiness });

  // ─── 2. THEME DATA & MUTATIONS (PERSONAL VS BUSINESS) ─────────────────────
  const personalThemeQuery = useMyTheme();
  const businessThemeQuery = useMyBusinessTheme();
  const themeData = isBusiness ? businessThemeQuery.data : personalThemeQuery.data;
  const isLoadingTheme = isBusiness ? businessThemeQuery.isLoading : personalThemeQuery.isLoading;

  // Published templates query
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'ALL'>(
    isBusiness ? 'BUSINESS' : 'ALL'
  );
  const { data: publishedTemplates = [], isLoading: isLoadingTemplates } = usePublishedTemplates(
    selectedCategory === 'ALL' ? undefined : selectedCategory
  );

  // Mutations
  const applyPersonalMutation = useApplyTemplate();
  const applyBusinessMutation = useApplyBusinessTemplate();
  const applyTemplateMutation = isBusiness ? applyBusinessMutation : applyPersonalMutation;

  const reorderPersonalMutation = useReorderSections();
  const reorderBusinessMutation = useReorderBusinessSections();
  const reorderSectionsMutation = isBusiness ? reorderBusinessMutation : reorderPersonalMutation;

  const updatePersonalMutation = useUpdateUserThemeConfig();
  const updateBusinessMutation = useUpdateBusinessThemeConfig();
  const updateConfigMutation = isBusiness ? updateBusinessMutation : updatePersonalMutation;

  const resetPersonalMutation = useResetThemeConfig();
  const resetBusinessMutation = useResetBusinessThemeConfig();
  const resetMutation = isBusiness ? resetBusinessMutation : resetPersonalMutation;

  // ─── 3. LOCAL STUDIO STATE ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'layout' | 'templates' | 'appearance'>('layout');
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [accentColor, setAccentColor] = useState<string>(isBusiness ? '#2563eb' : '#6366f1');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [hasUnsavedReorder, setHasUnsavedReorder] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<SectionBlock | null>(null);

  // Section types with editable rich content (business blocks)
  const RICH_BLOCK_TYPES = new Set([
    'CLIENTS_LOGO', 'COMPANY_STATS', 'PROCESS_WORKFLOW',
    'TESTIMONIALS', 'FAQ_ACCORDION', 'CTA_BANNER',
  ]);

  // Sync state when backend returns data
  useEffect(() => {
    if (themeData?.resolvedLayout?.sections) {
      setSections(themeData.resolvedLayout.sections);
      setHasUnsavedReorder(false);
    }
    if (themeData?.resolvedLayout?.theme) {
      const activeColor =
        themeData.userCustomConfig?.theme?.primaryColor ||
        themeData.resolvedLayout.theme.primaryColor ||
        (isBusiness ? '#2563eb' : '#6366f1');
      const activeDark =
        themeData.userCustomConfig?.theme?.darkMode ??
        themeData.resolvedLayout.theme.darkMode ??
        false;
      setAccentColor(activeColor);
      setDarkMode(activeDark);
    }
  }, [themeData, isBusiness]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // ─── 4. ACTIONS ───────────────────────────────────────────────────────────
  const handleApplyTemplate = (tpl: Template) => {
    applyTemplateMutation.mutate(tpl.id, {
      onSuccess: () => {
        showFeedback(`Template "${tpl.name}" applied successfully!`);
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showFeedback(err.response?.data?.message || 'Failed to apply template.', 'error');
      },
    });
  };

  const handleReorder = (newSections: SectionBlock[]) => {
    setSections(newSections);
    setHasUnsavedReorder(true);
  };

  const handleSaveReorder = () => {
    const sectionIds = sections.map((s) => s.id);
    reorderSectionsMutation.mutate(sectionIds, {
      onSuccess: () => {
        setHasUnsavedReorder(false);
        showFeedback('Section order saved successfully!');
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showFeedback(err.response?.data?.message || 'Failed to save section order.', 'error');
      },
    });
  };

  const handleToggleVisibility = (sectionId: string) => {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    );
    setSections(updated);
    updateConfigMutation.mutate(
      {
        sections: updated.map((s) => ({ id: s.id, isVisible: s.isVisible })),
      },
      {
        onSuccess: () => {
          showFeedback('Section visibility updated!');
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          showFeedback(err.response?.data?.message || 'Update failed.', 'error');
        },
      }
    );
  };

  const handleSaveAppearance = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateConfigMutation.mutate(
      {
        theme: {
          primaryColor: accentColor,
          darkMode,
        },
      },
      {
        onSuccess: () => {
          showFeedback('Theme colors & styling saved!');
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          showFeedback(err.response?.data?.message || 'Failed to save appearance.', 'error');
        },
      }
    );
  };

  // ─── 4b. HANDLE SECTION CONTENT SAVE ────────────────────────────────────
  const handleSectionContentSaved = (updatedSection: SectionBlock) => {
    setSections((prev) =>
      prev.map((s) => (s.id === updatedSection.id ? updatedSection : s))
    );
    setEditingSection(null);
    showFeedback(`Konten "${updatedSection.title || updatedSection.type}" berhasil disimpan!`);
  };

  const handleConfirmReset = () => {
    resetMutation.mutate(undefined as never, {
      onSuccess: () => {
        setShowResetConfirm(false);
        showFeedback('Reset back to template defaults!');
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showFeedback(err.response?.data?.message || 'Reset failed.', 'error');
      },
    });
  };

  const activeTemplate = themeData?.template;
  const presets = isBusiness ? BUSINESS_ACCENT_PRESETS : PERSONAL_ACCENT_PRESETS;
  const backUrl = isBusiness ? '/admin/business/profile' : '/admin/profile';
  const publicUrl = `/portfolio/${currentUser.id}`;

  // ─── 5. REAL-TIME LIVE PREVIEW DATA ───────────────────────────────────────
  const livePreviewData = {
    profile: profile || null,
    businessProfile: businessProfile || null,
    businessServices: businessProfile ? [] : [],
    businessProjects: businessProfile ? [] : [],
    layout: {
      theme: {
        fontFamily: themeData?.resolvedLayout?.theme?.fontFamily || 'Inter, sans-serif',
        primaryColor: accentColor,
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        surfaceColor: darkMode ? '#1e293b' : '#ffffff',
        textColor: darkMode ? '#f8fafc' : '#0f172a',
        borderRadius: themeData?.resolvedLayout?.theme?.borderRadius || '12px',
        darkMode,
      },
      sections,
    } as LayoutConfig,
  };

  const previewFrameWidth =
    previewDevice === 'mobile'
      ? 'w-[375px]'
      : previewDevice === 'tablet'
      ? 'w-[768px]'
      : 'w-full';

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. TOP APP STUDIO HEADER
         ───────────────────────────────────────────────────────────────────────────── */}
      <header className="h-14 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-30">
        {/* Left: Back to Admin & Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backUrl)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold cursor-pointer border border-slate-700/60"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                {isBusiness ? 'Corporate Showcase Studio' : 'Portfolio Theme Studio'}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] uppercase font-bold hidden md:inline">
                {activeTemplate?.name || 'Live Editor'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Device Switcher (Desktop | Tablet | Mobile) */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              previewDevice === 'desktop'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Full-Width"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              previewDevice === 'tablet'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              previewDevice === 'mobile'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {hasUnsavedReorder && (
            <button
              type="button"
              onClick={handleSaveReorder}
              disabled={reorderSectionsMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm cursor-pointer"
            >
              {reorderSectionsMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Save Order</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Reset to Template Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline ml-1.5">Reset</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition active:scale-95 shadow-xs"
            title="Open Live Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Site</span>
          </a>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. TWO-COLUMN SPLIT STUDIO (CONTROLS LEFT | LIVE PREVIEW RIGHT)
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Floating Notification */}
        {statusMessage && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-slate-900 text-white border border-emerald-500/50'
                : 'bg-rose-900 text-white border border-rose-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ─── LEFT PANEL: CONTROLS & PALETTE (440px) ─── */}
        <aside className="w-full lg:w-[440px] xl:w-[480px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Studio Navigation Tabs */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'layout'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Colors</span>
            </button>
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {isLoadingTheme ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                <p className="text-xs font-semibold">Loading theme setup...</p>
              </div>
            ) : (
              <>
                {/* ════ TAB 1: SECTIONS LAYOUT (DRAG & DROP) ════ */}
                {activeTab === 'layout' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-indigo-400" />
                          <span>Drag & Drop Sections</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Hold ⠿ to rearrange order. Changes show on preview instantly!
                        </p>
                      </div>

                      <span className="font-mono text-[10px] text-slate-400">
                        {sections.filter((s) => s.isVisible).length}/{sections.length} Visible
                      </span>
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={sections}
                      onReorder={handleReorder}
                      className="space-y-2"
                    >
                      {sections.map((section, index) => (
                        <Reorder.Item
                          key={section.id}
                          value={section}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 select-none shadow-2xs cursor-grab active:cursor-grabbing ${
                            section.isVisible
                              ? 'bg-slate-800/80 border-slate-700/80 hover:border-indigo-500/80 hover:bg-slate-800'
                              : 'bg-slate-800/30 border-slate-800/50 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-white truncate">
                                {section.title || section.type}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-1.5 py-0.2 rounded">
                                  {section.type}
                                </span>
                                {section.variant && (
                                  <span className="font-mono text-[9px] text-slate-500">
                                    {section.variant}
                                  </span>
                                )}
                                {RICH_BLOCK_TYPES.has(section.type) && (
                                  <span className="font-mono text-[9px] text-blue-300 bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold">
                                    Rich Block
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Edit Content Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSection(section);
                              }}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                RICH_BLOCK_TYPES.has(section.type)
                                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25'
                                  : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                              }`}
                              title={RICH_BLOCK_TYPES.has(section.type) ? "Edit Rich Business Content" : "Edit Section Content"}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Visibility Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(section.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                section.isVisible
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                              title={section.isVisible ? 'Hide Section' : 'Show Section'}
                            >
                              {section.isVisible ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                              )}
                            </button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>

                    {hasUnsavedReorder && (
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleSaveReorder}
                          disabled={reorderSectionsMutation.isPending}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {reorderSectionsMutation.isPending && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          )}
                          <span>Save Section Sequence</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ════ TAB 2: TEMPLATE SELECTOR ════ */}
                {activeTab === 'templates' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>Catalog Blueprint Templates</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          1-Click apply to swap layout structure and default styling.
                        </p>
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {(['ALL', 'DEVELOPER', 'DESIGNER', 'BUSINESS', 'MINIMAL'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat as TemplateCategory | 'ALL')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {isLoadingTemplates ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {publishedTemplates.map((tpl) => {
                          const isActive = activeTemplate?.id === tpl.id;
                          return (
                            <div
                              key={tpl.id}
                              className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                                isActive
                                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                                  <span className="text-indigo-400 font-bold uppercase">{tpl.category}</span>
                                  <span>{tpl.layoutConfig?.sections?.length || 0} sections</span>
                                </div>
                                <h5 className="font-bold text-xs text-white leading-snug">{tpl.name}</h5>
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                  {tpl.description || 'AST layout blueprint.'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleApplyTemplate(tpl)}
                                disabled={isActive || applyTemplateMutation.isPending}
                                className={`mt-3 py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                                  isActive
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white cursor-pointer'
                                }`}
                              >
                                {isActive ? '✓ Active Template' : 'Use This Template'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ════ TAB 3: COLORS & APPEARANCE ════ */}
                {activeTab === 'appearance' && (
                  <div className="space-y-5">
                    <div className="pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-indigo-400" />
                        <span>Brand Accent & Dark Mode</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Customize accent color and theme surface in real time.
                      </p>
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Quick Color Palettes
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {presets.map((preset) => {
                          const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase();
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setAccentColor(preset.color);
                              }}
                              className={`h-9 w-full rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105'
                                  : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: preset.color }}
                              title={preset.name}
                            >
                              {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hex Color Input */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Custom Hex Accent
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 font-mono text-xs text-white font-bold"
                        />
                      </div>
                    </div>

                    {/* Dark Mode Switch */}
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {darkMode ? (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-400" />
                        )}
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {darkMode ? 'Dark Theme Surface' : 'Light Clean Surface'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Switches background contrast
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={(e) => setDarkMode(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveAppearance()}
                        disabled={updateConfigMutation.isPending}
                        className="w-full py-2.5 rounded-xl bg-white text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md"
                      >
                        {updateConfigMutation.isPending && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        <span>Save Brand Styling</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* ─── RIGHT PANEL: LIVE DEVICE SIMULATOR PLAYGROUND ─── */}
        <main className="flex-1 bg-slate-950 flex flex-col items-center justify-start overflow-hidden relative p-3 sm:p-6">
          <div className="w-full flex items-center justify-between pb-2 text-[11px] text-slate-400 font-mono border-b border-slate-900 mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime Live Preview</span>
            </span>
            <span>Viewport: {previewDevice.toUpperCase()}</span>
          </div>

          {/* Interactive Screen Frame with Live Dynamic AST Renderer */}
          <div
            className={`flex-1 overflow-y-auto rounded-2xl shadow-2xl border border-slate-800 bg-white transition-all duration-300 ${previewFrameWidth} max-h-full`}
          >
            <DynamicPortfolioRenderer data={livePreviewData} isInteractivePreview />
          </div>
        </main>
      </div>

      {/* ─── Edit Section Content Modal ─── */}
      <EditSectionContentModal
        isOpen={!!editingSection}
        section={editingSection}
        isBusiness={isBusiness}
        onClose={() => setEditingSection(null)}
        onSaveSuccess={handleSectionContentSaved}
      />

      {/* ─── Reset Confirmation Modal ─── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Reset Theme to Template Defaults?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will discard all your personal section reordering, visibility overrides, and custom color accents.
              Your portfolio will restore the original layout blueprint of{' '}
              <strong className="text-slate-800">{activeTemplate?.name || 'the base template'}</strong>.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetMutation.isPending}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {resetMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Reset Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserThemeStudio;
