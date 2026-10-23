/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reorder } from 'motion/react';
import {
  Palette, Check, Loader2, ExternalLink, Sparkles,
  Sliders, Moon, Sun, CheckCircle2, Layers, GripVertical,
  Eye, EyeOff, RotateCcw, AlertTriangle, ArrowUpDown,
  Laptop, ShieldAlert, Monitor
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  usePublishedTemplates,
  useMyTheme,
  useApplyTemplate,
  useUpdateUserThemeConfig,
  useReorderSections,
  useResetThemeConfig,
} from '../../hooks/useTemplates';
import type { Profile } from '../../types';
import type {
  Template,
  TemplateCategory,
  SectionBlock,
} from '../../types/theme';
import { ThemeDeviceSimulator } from '../molecules/ThemeDeviceSimulator';

interface ProfileThemeTabProps {
  profile?: Profile | null;
  userId: string;
}

const PRESET_ACCENT_COLORS = [
  { name: 'Brand Violet', color: '#8B6CF6' },
  { name: 'Brand Blue', color: '#4697F5' },
  { name: 'Warm Amber', color: '#FFC45B' },
  { name: 'Emerald Spark', color: '#10b981' },
  { name: 'Rose Velvet', color: '#f43f5e' },
  { name: 'Ocean Cyan', color: '#06b6d4' },
  { name: 'Deep Navy', color: '#202744' },
];

const CATEGORY_TABS: Array<{ label: string; value: TemplateCategory | 'ALL' }> = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Developer', value: 'DEVELOPER' },
  { label: 'Designer', value: 'DESIGNER' },
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Creative', value: 'CREATIVE' },
  { label: 'Minimal', value: 'MINIMAL' },
];

export const ProfileThemeTab: React.FC<ProfileThemeTabProps> = ({ profile: _profile, userId }) => {
  // ─── 1. API QUERIES & MUTATIONS ───────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'ALL'>('ALL');
  const { data: myThemeData, isLoading: isLoadingMyTheme } = useMyTheme();
  const { data: publishedTemplates = [], isLoading: isLoadingTemplates } = usePublishedTemplates(
    selectedCategory === 'ALL' ? undefined : selectedCategory
  );

  const applyTemplateMutation = useApplyTemplate();
  const updateCustomConfigMutation = useUpdateUserThemeConfig();
  const reorderSectionsMutation = useReorderSections();
  const resetThemeMutation = useResetThemeConfig();

  // ─── 2. LOCAL STATE FOR SECTIONS & CUSTOMIZER ─────────────────────────────
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [accentColor, setAccentColor] = useState<string>('#000000');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [hasUnsavedReorder, setHasUnsavedReorder] = useState<boolean>(false);

  // Sync state when backend returns myThemeData
  useEffect(() => {
    if (myThemeData?.resolvedLayout?.sections) {
      setSections(myThemeData.resolvedLayout.sections);
      setHasUnsavedReorder(false);
    }
    if (myThemeData?.resolvedLayout?.theme) {
      const activeColor =
        myThemeData.userCustomConfig?.theme?.primaryColor ||
        myThemeData.resolvedLayout.theme.primaryColor ||
        '#000000';
      const activeDark =
        myThemeData.userCustomConfig?.theme?.darkMode ??
        myThemeData.resolvedLayout.theme.darkMode ??
        false;
      setAccentColor(activeColor);
      setDarkMode(activeDark);
    }
  }, [myThemeData]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // ─── 3. ACTIONS ────────────────────────────────────────────────────────────

  // Apply new template
  const handleApplyTemplate = (tpl: Template) => {
    applyTemplateMutation.mutate(tpl.id, {
      onSuccess: () => {
        showFeedback(`Template "${tpl.name}" successfully applied to your portfolio!`);
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showFeedback(err.response?.data?.message || 'Failed to apply template.', 'error');
      },
    });
  };

  // Drag-and-drop Reorder
  const handleReorder = (newSections: SectionBlock[]) => {
    setSections(newSections);
    setHasUnsavedReorder(true);
  };

  // Save reordered sections
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

  // Toggle Visibility of a Section
  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = sections.map((s) =>
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    );
    setSections(updatedSections);

    // Save visibility override to backend
    updateCustomConfigMutation.mutate(
      {
        sections: updatedSections.map((s) => ({
          id: s.id,
          isVisible: s.isVisible,
        })),
      },
      {
        onSuccess: () => {
          const toggled = updatedSections.find((s) => s.id === sectionId);
          showFeedback(
            `Section "${toggled?.title || toggled?.type}" is now ${
              toggled?.isVisible ? 'visible' : 'hidden'
            } on your portfolio.`
          );
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          showFeedback(err.response?.data?.message || 'Failed to update section visibility.', 'error');
        },
      }
    );
  };

  // Save Accent Color & Dark Mode
  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomConfigMutation.mutate(
      {
        theme: {
          primaryColor: accentColor,
          darkMode,
        },
      },
      {
        onSuccess: () => {
          showFeedback('Personal theme accent color and styling saved!');
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          showFeedback(err.response?.data?.message || 'Failed to save appearance settings.', 'error');
        },
      }
    );
  };

  // Reset to default template layout
  const handleConfirmReset = () => {
    resetThemeMutation.mutate(undefined, {
      onSuccess: () => {
        setShowResetConfirm(false);
        showFeedback('All customizations reset back to default template layout!');
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showFeedback(err.response?.data?.message || 'Failed to reset theme.', 'error');
      },
    });
  };

  const activeTemplate = myThemeData?.template;
  const layoutConfig = myThemeData?.resolvedLayout || activeTemplate?.layoutConfig;

  const livePreviewData = {
    profile: _profile,
    layout: {
      templateType: layoutConfig?.templateType || 'BUILDER',
      customHtml: layoutConfig?.customHtml,
      customCss: layoutConfig?.customCss,
      theme: {
        fontFamily: myThemeData?.resolvedLayout?.theme?.fontFamily || 'Inter, sans-serif',
        primaryColor: accentColor,
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        surfaceColor: darkMode ? '#1e293b' : '#ffffff',
        textColor: darkMode ? '#f8fafc' : '#0f172a',
        borderRadius: myThemeData?.resolvedLayout?.theme?.borderRadius || '12px',
        darkMode,
      },
      sections,
    },
  };

  return (
    <div className="space-y-8 font-sans">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HERO HEADER WITH ACTIVE TEMPLATE STATUS & LIVE PREVIEW LINK
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#202744] via-[#2a3359] to-[#202744] p-6 text-white shadow-md border border-[#202744]">
        {/* Subtle decorative ribbons */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#8B6CF6]/20 to-transparent pointer-events-none -mr-20 -mt-20 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-radial from-[#4697F5]/20 to-transparent pointer-events-none -mb-20 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E8E0FF] font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC45B]" />
              <span>Theme Studio & Section Reorder</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Portfolio Customizer
            </h3>
            <p className="text-xs text-[#E8E0FF]/80 max-w-xl leading-relaxed">
              Choose your favorite blueprint template, reorder sections with drag & drop,
              toggle visibility, and pick your personal color accent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/admin/theme-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7857ED] text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer"
              title="Open full-screen side-by-side studio playground"
            >
              <Sparkles className="w-4 h-4 text-[#FFC45B]" />
              <span>Open Theme Studio</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowSimulator(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 border border-white/15 cursor-pointer backdrop-blur-xs"
              title="Open quick simulator modal"
            >
              <Monitor className="w-4 h-4 text-[#4697F5]" />
              <span>Simulator</span>
            </button>

            {userId && (
              <a
                href={`/portfolio/${userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#202744] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] transition active:scale-95 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#8B6CF6]" />
                <span>View Live</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={resetThemeMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Reset all customized sections and colors to template defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#FFC45B]" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Active Template Bar */}
        {activeTemplate && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70">Current Active Template:</span>
              <strong className="text-white font-bold">{activeTemplate.name}</strong>
              <span className="px-2 py-0.5 rounded bg-[#8B6CF6]/30 text-[#E8E0FF] font-mono text-[10px] uppercase border border-[#8B6CF6]/30">
                {activeTemplate.category}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-white/70">
              <span>{sections.length} Sections Configured</span>
              <span>{sections.filter((s) => s.isVisible).length} Visible</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-800'
              : 'bg-rose-900/90 text-white border border-rose-800'
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. TWO-COLUMN WORKSPACE: PERSONAL CUSTOMIZER & SECTION REORDER
         ───────────────────────────────────────────────────────────────────────────── */}
      {isLoadingMyTheme ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2" />
          <p className="text-xs font-semibold">Loading your portfolio configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT: PERSONAL SECTION REORDER & VISIBILITY (7 Cols) ─── */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                    <span>Personal Section Reordering</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Drag the handle ⠿ to arrange sections in your preferred order, or toggle eye icon to hide/show.
                  </p>
                </div>

                {hasUnsavedReorder && (
                  <button
                    type="button"
                    onClick={handleSaveReorder}
                    disabled={reorderSectionsMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    {reorderSectionsMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Save Order</span>
                  </button>
                )}
              </div>

              {sections.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs">No sections found for this template.</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={sections}
                  onReorder={handleReorder}
                  className="space-y-2.5"
                >
                  {sections.map((section, index) => (
                    <Reorder.Item
                      key={section.id}
                      value={section}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 select-none shadow-2xs cursor-grab active:cursor-grabbing ${
                        section.isVisible
                          ? 'bg-slate-50/80 border-slate-200 hover:border-indigo-400/80 hover:bg-white'
                          : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Drag Handle */}
                        <div className="p-1 rounded text-slate-400 hover:text-slate-600">
                          <GripVertical className="w-4 h-4 shrink-0" />
                        </div>

                        {/* Order Badge */}
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {section.title || section.type}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.2 rounded">
                              {section.type}
                            </span>
                            {section.variant && (
                              <span className="font-mono text-[9px] text-slate-400">
                                {section.variant}
                              </span>
                            )}
                            {!section.isVisible && (
                              <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Visibility Toggle Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(section.id)}
                          disabled={updateCustomConfigMutation.isPending}
                          className={`p-2 rounded-lg border transition cursor-pointer ${
                            section.isVisible
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                          }`}
                          title={section.isVisible ? 'Hide this section' : 'Show this section'}
                        >
                          {section.isVisible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-rose-500" />
                          )}
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {hasUnsavedReorder && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveReorder}
                    disabled={reorderSectionsMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6CF6] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7857ED] transition active:scale-95 shadow-xs cursor-pointer"
                  >
                    {reorderSectionsMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Save New Section Order</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: COLOR ACCENT PICKER & PREFERENCE (5 Cols) ─── */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-[#EAE5DD] pb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#202744] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#8B6CF6]" />
                  <span>Personal Accent & Colors</span>
                </h4>
                <span className="text-[10px] font-mono text-[#69718A]">User Overrides</span>
              </div>

              <form onSubmit={handleSaveAppearance} className="space-y-5">
                {/* Preset Palettes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#202744] mb-2">
                    Quick Preset Accents
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {PRESET_ACCENT_COLORS.map((preset) => {
                      const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setAccentColor(preset.color)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-[#8B6CF6] ring-offset-2 scale-110'
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

                {/* Custom Color Picker Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#202744] mb-2">
                    Custom Hex Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-11 h-11 rounded-xl bg-transparent border border-[#EAE5DD] cursor-pointer shadow-3xs"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] font-mono text-xs text-[#202744] focus:bg-white focus:outline-hidden focus:border-[#8B6CF6] font-bold"
                    />
                  </div>
                  <p className="text-[11px] text-[#69718A] mt-1.5 leading-relaxed">
                    This color will apply to primary call-to-actions, badges, and highlights on your portfolio.
                  </p>
                </div>

                {/* Dark Mode Preference Toggle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#202744] mb-2">
                    Color Scheme Preference
                  </label>
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5]">
                    <div className="flex items-center gap-2.5">
                      {darkMode ? (
                        <Moon className="w-4 h-4 text-[#8B6CF6]" />
                      ) : (
                        <Sun className="w-4 h-4 text-[#FFC45B]" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-[#202744] block">
                          {darkMode ? 'Dark Mode Surface' : 'Light Mode Surface'}
                        </span>
                        <span className="text-[10px] text-[#69718A]">
                          Overrides default background contrast
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]" />
                    </label>
                  </div>
                </div>

                {/* Save Appearance Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateCustomConfigMutation.isPending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6CF6] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7857ED] transition active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    {updateCustomConfigMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Save Theme Customization</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. TEMPLATE SELECTOR GRID (1-CLICK APPLY)
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-[#202744] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#8B6CF6]" />
              <span>Available Portfolio Templates</span>
            </h4>
            <p className="text-xs text-[#69718A] mt-0.5">
              Select any of the master templates created by our design team. Click "Use This Template" to adopt it instantly.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-[#8B6CF6] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#69718A] hover:bg-[#E8E0FF]/50 hover:text-[#202744] border border-[#EAE5DD]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingTemplates ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#69718A]">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B6CF6] mb-2" />
            <p className="text-xs font-semibold">Loading available blueprints...</p>
          </div>
        ) : publishedTemplates.length === 0 ? (
          <div className="py-16 border-2 border-dashed border-[#EAE5DD] rounded-2xl p-8 text-center text-[#69718A] bg-white">
            <Laptop className="w-8 h-8 mx-auto mb-2 text-[#8B6CF6]/40" />
            <p className="text-sm font-semibold text-[#202744]">No published templates found</p>
            <p className="text-xs mt-1 text-[#69718A]">
              There are currently no published templates in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedTemplates.map((tpl) => {
              const isActive = activeTemplate?.id === tpl.id;
              const primary = tpl.layoutConfig?.theme?.primaryColor || '#8B6CF6';
              const bg = tpl.layoutConfig?.theme?.backgroundColor || '#ffffff';
              const sectionCount = tpl.layoutConfig?.sections?.length || 0;

              return (
                <div
                  key={tpl.id}
                  className={`group rounded-2xl bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
                    isActive
                      ? 'border-[#8B6CF6] ring-2 ring-[#8B6CF6]/20 shadow-md'
                      : 'border-[#EAE5DD] hover:border-[#8B6CF6]/40 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Thumbnail / Swatch Banner */}
                    <div className="relative aspect-video w-full bg-[#FAF8F5] overflow-hidden border-b border-[#EAE5DD]">
                      {tpl.thumbnail ? (
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                          style={{ backgroundColor: bg }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-xs mb-2"
                            style={{ backgroundColor: primary }}
                          >
                            <Palette className="w-6 h-6 text-white" />
                          </div>
                          <span className="font-mono text-[9px] font-bold text-[#69718A] uppercase tracking-widest">
                            {tpl.slug}
                          </span>
                        </div>
                      )}

                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute top-3 left-3 bg-[#8B6CF6] text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active Template</span>
                        </div>
                      )}

                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-[#202744]/70 text-white font-mono text-[9px] font-bold uppercase backdrop-blur-xs">
                        {sectionCount} Sections
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#69718A] uppercase mb-1">
                        <span>{tpl.category}</span>
                        <span>v{tpl.version}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#202744] group-hover:text-[#8B6CF6] transition leading-snug">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-[#69718A] line-clamp-2 mt-1.5 leading-relaxed">
                        {tpl.description || 'Modern AST portfolio template blueprint.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      disabled={isActive || applyTemplateMutation.isPending}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#E8E0FF]/60 text-[#8B6CF6] border border-[#8B6CF6]/30 cursor-default'
                          : 'bg-[#8B6CF6] text-white hover:bg-[#7857ED] shadow-xs'
                      }`}
                    >
                      {applyTemplateMutation.isPending && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span>{isActive ? 'Current Template' : 'Use This Template'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. RESET CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Reset to Template Defaults?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will remove all your personal section reordering, section visibility overrides, and
              custom accent colors. Your portfolio will restore the exact default blueprint of{' '}
              <strong className="text-slate-800">{activeTemplate?.name || 'the base template'}</strong>.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetThemeMutation.isPending}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                {resetThemeMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Reset Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. LIVE DEVICE SIMULATOR PLAYGROUND
         ───────────────────────────────────────────────────────────────────────────── */}
      {showSimulator && (
        <ThemeDeviceSimulator
          data={livePreviewData}
          title="Developer Portfolio Live Simulator"
          publicUrl={userId ? `/portfolio/${userId}` : undefined}
          onClose={() => setShowSimulator(false)}
          isModal
        />
      )}
    </div>
  );
};

export default ProfileThemeTab;
