/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reorder } from 'motion/react';
import {
  Palette, Check, Loader2, Sliders, Moon, Sun,
  CheckCircle2, Layers, GripVertical, Eye, EyeOff, RotateCcw,
  ArrowUpDown, ShieldAlert, Monitor, Building2
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  usePublishedTemplates,
  useMyBusinessTheme,
  useApplyBusinessTemplate,
  useUpdateBusinessThemeConfig,
  useReorderBusinessSections,
  useResetBusinessThemeConfig,
} from '../../hooks/useTemplates';
import type { BusinessProfile } from '../../types';
import type { Template, TemplateCategory, SectionBlock } from '../../types/theme';
import { ThemeDeviceSimulator } from '../molecules/ThemeDeviceSimulator';

interface BusinessThemeTabProps {
  businessProfile?: BusinessProfile | null;
  userId: string;
}

const PRESET_ACCENT_COLORS = [
  { name: 'Corporate Blue', color: '#2563eb' },
  { name: 'Emerald Trust', color: '#059669' },
  { name: 'Indigo Modern', color: '#4f46e5' },
  { name: 'Amber Gold', color: '#d97706' },
  { name: 'Rose Prestige', color: '#e11d48' },
  { name: 'Slate Executive', color: '#0f172a' },
];

export const BusinessThemeTab: React.FC<BusinessThemeTabProps> = ({ businessProfile, userId }) => {
  const selectedCategory: TemplateCategory = 'BUSINESS';
  const { data: myThemeData, isLoading: isLoadingMyTheme } = useMyBusinessTheme();
  const { data: publishedTemplates = [], isLoading: isLoadingTemplates } = usePublishedTemplates(selectedCategory);

  const applyTemplateMutation = useApplyBusinessTemplate();
  const updateCustomConfigMutation = useUpdateBusinessThemeConfig();
  const reorderSectionsMutation = useReorderBusinessSections();
  const resetThemeMutation = useResetBusinessThemeConfig();

  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [accentColor, setAccentColor] = useState<string>('#2563eb');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [hasUnsavedReorder, setHasUnsavedReorder] = useState<boolean>(false);

  useEffect(() => {
    if (myThemeData?.resolvedLayout?.sections) {
      setSections(myThemeData.resolvedLayout.sections);
      setHasUnsavedReorder(false);
    }
    if (myThemeData?.resolvedLayout?.theme) {
      const activeColor =
        myThemeData.userCustomConfig?.theme?.primaryColor ||
        myThemeData.resolvedLayout.theme.primaryColor ||
        '#2563eb';
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

  const handleApplyTemplate = (tpl: Template) => {
    applyTemplateMutation.mutate(tpl.id, {
      onSuccess: () => {
        showFeedback(`Template "${tpl.name}" applied to corporate catalog!`);
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
        showFeedback('Business section order saved successfully!');
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
    updateCustomConfigMutation.mutate(
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
          showFeedback('Corporate brand colors updated!');
        },
        onError: (err: AxiosError<{ message?: string }>) => {
          showFeedback(err.response?.data?.message || 'Failed to save appearance.', 'error');
        },
      }
    );
  };

  const handleConfirmReset = () => {
    resetThemeMutation.mutate(undefined, {
      onSuccess: () => {
        setShowResetConfirm(false);
        showFeedback('Reset back to base business template layout!');
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        showFeedback(err.response?.data?.message || 'Reset failed.', 'error');
      },
    });
  };

  const activeTemplate = myThemeData?.template;
  const layoutConfig = myThemeData?.resolvedLayout || activeTemplate?.layoutConfig;

  const livePreviewData = {
    businessProfile: businessProfile,
    businessServices: [],
    businessProjects: [],
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
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#202744] p-6 text-white shadow-md border border-[#202744]">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#8B6CF6]/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-[#4697F5]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-violet-200 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-[#FFC45B]" />
              <span>Corporate Brand Showcase & Themes</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Business Profile Customizer
            </h3>
            <p className="text-xs text-white/70 max-w-xl leading-relaxed">
              Customize your business portfolio presentation: reorder showcase sections, toggle catalog visibility, and align with your brand guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/admin/business/theme-studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A5CE0] text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-xs cursor-pointer"
              title="Open full-screen side-by-side studio playground"
            >
              <Building2 className="w-4 h-4 text-white" />
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

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={resetThemeMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95 cursor-pointer"
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
              <span className="text-white/70">Active Business Template:</span>
              <strong className="text-white font-bold">{activeTemplate.name}</strong>
              <span className="px-2 py-0.5 rounded-md bg-[#8B6CF6]/30 text-violet-200 font-mono text-[10px] uppercase border border-violet-400/30">
                {activeTemplate.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-white/60">
              <span>{sections.length} Sections Active</span>
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

      {/* ─── Two-Column Reordering & Appearance ─── */}
      {isLoadingMyTheme ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2" />
          <p className="text-xs font-semibold">Loading corporate theme configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Reorder Business Sections (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-blue-600" />
                    <span>Business Sections Layout</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Drag the handle ⠿ to arrange company sections (Overview, Services, Projects, Contact).
                  </p>
                </div>

                {hasUnsavedReorder && (
                  <button
                    type="button"
                    onClick={handleSaveReorder}
                    disabled={reorderSectionsMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm cursor-pointer"
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
                  <p className="text-xs">No sections configured for this template.</p>
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
                          ? 'bg-slate-50/80 border-slate-200 hover:border-blue-400/80 hover:bg-white'
                          : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1 rounded text-slate-400 hover:text-slate-600">
                          <GripVertical className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {section.title || section.type}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.2 rounded">
                              {section.type}
                            </span>
                            {!section.isVisible && (
                              <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(section.id)}
                        className={`p-2 rounded-lg border transition cursor-pointer ${
                          section.isVisible
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                      >
                        {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-rose-500" />}
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>

          {/* Right: Brand Colors & Dark Mode (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Corporate Brand Palette</span>
                </h4>
              </div>

              <form onSubmit={handleSaveAppearance} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Quick Brand Accents
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_ACCENT_COLORS.map((preset) => {
                      const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setAccentColor(preset.color)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer ${
                            isSelected ? 'ring-2 ring-black ring-offset-2 scale-110' : 'hover:scale-105'
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

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Custom Hex Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-11 h-11 rounded-xl bg-transparent border border-slate-200 cursor-pointer shadow-3xs"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 font-bold"
                    />
                  </div>
                </div>

                {/* Dark Mode Preference */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    {darkMode ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {darkMode ? 'Dark Executive Surface' : 'Clean Light Surface'}
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
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
                  </label>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateCustomConfigMutation.isPending}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {updateCustomConfigMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Save Corporate Theme</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Business Template Selector Grid ─── */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Available Corporate & Business Templates</span>
          </h4>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Category: {selectedCategory}
          </span>
        </div>

        {isLoadingTemplates ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2" />
          </div>
        ) : publishedTemplates.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 bg-white">
            <p className="text-xs">No business templates published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedTemplates.map((tpl) => {
              const isActive = activeTemplate?.id === tpl.id;
              const primary = tpl.layoutConfig?.theme?.primaryColor || '#2563eb';
              const bg = tpl.layoutConfig?.theme?.backgroundColor || '#ffffff';
              const sectionCount = tpl.layoutConfig?.sections?.length || 0;

              return (
                <div
                  key={tpl.id}
                  className={`group rounded-2xl bg-white overflow-hidden border p-5 flex flex-col justify-between transition-all duration-300 ${
                    isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Thumbnail / Swatch Banner */}
                    <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-100">
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
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs mb-1.5"
                            style={{ backgroundColor: primary }}
                          >
                            <Palette className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {tpl.slug}
                          </span>
                        </div>
                      )}

                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      )}

                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[9px] font-bold uppercase backdrop-blur-xs">
                        {sectionCount} Sections
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                      <span className="font-bold text-blue-600">{tpl.category}</span>
                      <span>v{tpl.version}</span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition leading-snug">
                      {tpl.name}
                    </h5>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {tpl.description || 'Corporate showcase AST blueprint.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    disabled={isActive || applyTemplateMutation.isPending}
                    className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-black text-white hover:bg-slate-800 shadow-xs'
                    }`}
                  >
                    {applyTemplateMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>{isActive ? 'Current Template' : 'Use This Template'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Live Simulator Modal ─── */}
      {showSimulator && (
        <ThemeDeviceSimulator
          data={livePreviewData}
          title="Corporate Showcase Live Simulator"
          publicUrl={userId ? `/portfolio/${userId}` : undefined}
          onClose={() => setShowSimulator(false)}
          isModal
        />
      )}

      {/* ─── Reset Confirmation Modal ─── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-slate-900">Reset Business Theme?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will restore the original layout blueprint for this business template. All custom section reordering and color accents will be reset.
            </p>
            <div className="flex justify-end gap-3 mt-6">
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
    </div>
  );
};

export default BusinessThemeTab;
