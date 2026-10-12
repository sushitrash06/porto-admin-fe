/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Palette, Check, Loader2, ExternalLink, Sparkles,
  Sliders, Moon, Sun, CheckCircle2, Layers
} from 'lucide-react';
import {
  usePublishedTemplates,
  useApplyTemplate,
  useUpdateUserThemeConfig,
} from '../../hooks/useTemplates';
import type { Profile } from '../../types';
import type { UserCustomConfig, Template } from '../../types/theme';

interface PersonalThemeCustomizerProps {
  initialAccentColor: string;
  initialDarkMode: boolean;
  onSave: (payload: UserCustomConfig) => void;
  isSaving: boolean;
}

const PersonalThemeCustomizer: React.FC<PersonalThemeCustomizerProps> = ({
  initialAccentColor,
  initialDarkMode,
  onSave,
  isSaving,
}) => {
  const [accentColor, setAccentColor] = useState<string>(initialAccentColor);
  const [darkMode, setDarkMode] = useState<boolean>(initialDarkMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      theme: {
        primaryColor: accentColor,
        darkMode,
      },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Personal Theme Customizer</span>
        </h4>
        <span className="text-[11px] text-slate-400">Personal overrides for your portfolio</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Custom Accent Color */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Personal Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg bg-transparent border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Overrides the primary buttons, highlights, and link colors on your chosen template.
            </p>
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Color Scheme Preference
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span className="text-xs font-semibold text-slate-700">
                  {darkMode ? 'Dark Mode Surface' : 'Light Mode Surface'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Toggle dark contrast background across your portfolio page.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSaving && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>Save Theme Customization</span>
          </button>
        </div>
      </form>
    </div>
  );
};

interface ProfileThemeTabProps {
  profile?: Profile | null;
  userId: string;
}

export const ProfileThemeTab: React.FC<ProfileThemeTabProps> = ({ profile, userId }) => {
  // Published templates query
  const { data: publishedTemplates = [], isLoading: isLoadingTemplates } = usePublishedTemplates();

  // Mutations
  const applyTemplateMutation = useApplyTemplate();
  const updateCustomConfigMutation = useUpdateUserThemeConfig();

  // Active template resolution
  const activeTemplateId = profile?.templateId || null;
  const [statusMessage, setStatusMessage] = useState<string>('');

  const showFeedback = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleApplyTemplate = (template: Template) => {
    applyTemplateMutation.mutate(template.id, {
      onSuccess: () => {
        showFeedback(`Theme template "${template.name}" applied successfully!`);
      },
      onError: (err) => {
        showFeedback(err.response?.data?.message || 'Failed to apply theme template.');
      },
    });
  };

  const handleSaveCustomization = (payload: UserCustomConfig) => {
    updateCustomConfigMutation.mutate(payload, {
      onSuccess: () => {
        showFeedback('Personal theme overrides saved successfully!');
      },
      onError: (err) => {
        showFeedback(err.response?.data?.message || 'Failed to save theme overrides.');
      },
    });
  };

  const activeTemplate = publishedTemplates.find((t) => t.id === activeTemplateId);

  return (
    <div className="space-y-8 font-sans">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. HEADER & PREVIEW LINK
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 font-mono text-[9px] font-bold uppercase tracking-wider mb-2 backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Theme & Section Blueprint</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight">
            Personal Portfolio Layout & Styling
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Select a verified template layout and personalize your custom accent color.
          </p>
        </div>

        {userId && (
          <a
            href={`/portfolio/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition active:scale-95 shadow-sm shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Portfolio</span>
          </a>
        )}
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 shadow-md animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. MINI CUSTOMIZER (PERSONAL ACCENT & DARK MODE)
         ───────────────────────────────────────────────────────────────────────────── */}
      <PersonalThemeCustomizer
        key={`${userId}-${profile?.userCustomConfig?.theme?.primaryColor || ''}-${profile?.userCustomConfig?.theme?.darkMode}`}
        initialAccentColor={profile?.userCustomConfig?.theme?.primaryColor || '#000000'}
        initialDarkMode={profile?.userCustomConfig?.theme?.darkMode ?? false}
        onSave={handleSaveCustomization}
        isSaving={updateCustomConfigMutation.isPending}
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. TEMPLATE SELECTOR GRID
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Available Portfolio Templates</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose the architectural layout that best fits your career goals.
            </p>
          </div>

          {activeTemplate && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <Check className="w-3.5 h-3.5" />
              <span>Active: {activeTemplate.name}</span>
            </span>
          )}
        </div>

        {isLoadingTemplates ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600 mb-2" />
            <p className="text-xs font-semibold">Loading available templates...</p>
          </div>
        ) : publishedTemplates.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 bg-white">
            <p className="text-xs">No published templates available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedTemplates.map((tpl) => {
              const isActive = tpl.id === activeTemplateId;
              const primary = tpl.layoutConfig?.theme?.primaryColor || '#000000';
              const bg = tpl.layoutConfig?.theme?.backgroundColor || '#ffffff';
              const sectionCount = tpl.layoutConfig?.sections?.length || 0;

              return (
                <div
                  key={tpl.id}
                  className={`rounded-2xl bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Thumbnail / Swatch Banner */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      {tpl.thumbnail ? (
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                          style={{ backgroundColor: bg }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm mb-1.5"
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
                        <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active Theme</span>
                        </div>
                      )}

                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[9px] font-bold uppercase">
                        {sectionCount} Sections
                      </span>
                    </div>

                    <div className="p-4">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {tpl.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5 leading-snug">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {tpl.description || 'Verified AST portfolio template blueprint.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      disabled={isActive || applyTemplateMutation.isPending}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileThemeTab;
