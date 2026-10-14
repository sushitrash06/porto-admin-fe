/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Reorder } from 'motion/react';
import {
  ArrowLeft, Save, Globe, Eye, EyeOff, Trash2, GripVertical,
  Plus, Monitor, Tablet, Smartphone, Palette, Layout, Sparkles,
  Loader2, Upload, Copy, Moon, Sun, Layers
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  useAdminTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useUploadTemplateThumbnail,
} from '../../hooks/useTemplates';
import type {
  TemplateCategory,
  BlockType,
  SectionBlock,
  ThemeTokens,
  LayoutConfig,
  Template,
} from '../../types/theme';
import { DynamicPortfolioRenderer } from '../organisms/DynamicPortfolioRenderer';

let blockSeqNumber = 0;
function generateBlockId(type: string): string {
  blockSeqNumber += 1;
  return `sec-${type.toLowerCase()}-${blockSeqNumber}-${Math.random().toString(36).slice(2, 7)}`;
}

// Available Block Definitions for Palette
interface BlockDefinition {
  type: BlockType;
  title: string;
  description: string;
  defaultVariants: string[];
}

const AVAILABLE_BLOCKS: BlockDefinition[] = [
  {
    type: 'HERO_PROFILE',
    title: 'Hero Profile',
    description: 'Header with avatar, name, headline, bio, and social actions',
    defaultVariants: ['MODERN_SPLIT', 'MINIMAL_CENTER', 'CREATIVE_BADGE'],
  },
  {
    type: 'ABOUT_ME',
    title: 'About Me',
    description: 'Detailed career background, biography, and personal manifesto',
    defaultVariants: ['CLASSIC_CARD', 'SIDE_BY_SIDE'],
  },
  {
    type: 'SKILLS_LIST',
    title: 'Skills & Tech Stack',
    description: 'Interactive badges and progress displays of competencies',
    defaultVariants: ['TAG_CLOUD', 'PROGRESS_BARS'],
  },
  {
    type: 'PROJECT_LIST',
    title: 'Projects Showcase',
    description: 'Portfolio cards with thumbnails, tags, and repo/live links',
    defaultVariants: ['BENTO_GRID_3COL', 'MINIMAL_LIST'],
  },
  {
    type: 'EXPERIENCE_TIMELINE',
    title: 'Experience Timeline',
    description: 'Chronological timeline of work milestones and achievements',
    defaultVariants: ['VERTICAL_LINE', 'CARDS_GRID'],
  },
  {
    type: 'SERVICES_GRID',
    title: 'Services Grid',
    description: 'Consulting, contracting, and freelance service offerings',
    defaultVariants: ['CARDS_3COL', 'MINIMAL_LIST'],
  },
  {
    type: 'CONTACT_SECTION',
    title: 'Contact & Hire',
    description: 'Direct call-to-action with email, phone, and form triggers',
    defaultVariants: ['FORM_AND_DETAILS', 'SIMPLE_LINKS'],
  },
  {
    type: 'CUSTOM_BANNER',
    title: 'Custom Banner',
    description: 'High-impact CTA banner for announcements or open availability',
    defaultVariants: ['GRADIENT_ACCENT', 'SUBTLE_CARD'],
  },
];

const AVAILABLE_FONTS = [
  { label: 'Inter (Clean & Versatile)', value: 'Inter, sans-serif' },
  { label: 'Plus Jakarta Sans (Modern Geometric)', value: '"Plus Jakarta Sans", sans-serif' },
  { label: 'Outfit (Tech & Contemporary)', value: 'Outfit, sans-serif' },
  { label: 'Fira Code (Developer Monospace)', value: '"Fira Code", monospace' },
  { label: 'Space Grotesk (Neo-Brutalist)', value: '"Space Grotesk", sans-serif' },
  { label: 'Playfair Display (Editorial Serif)', value: '"Playfair Display", serif' },
];

const PRESET_PALETTES = [
  { name: 'Foliowalaweh Official', primary: '#8B6CF6', secondary: '#4697F5', bg: '#FAF8F5', surface: '#FFFFFF', text: '#202744', dark: false },
  { name: 'Midnight Violet', primary: '#8b5cf6', secondary: '#ec4899', bg: '#0f172a', surface: '#1e293b', text: '#f8fafc', dark: true },
  { name: 'Emerald Minimal', primary: '#10b981', secondary: '#06b6d4', bg: '#ffffff', surface: '#f8fafc', text: '#0f172a', dark: false },
  { name: 'Monochrome Noir', primary: '#000000', secondary: '#64748b', bg: '#ffffff', surface: '#ffffff', text: '#09090b', dark: false },
  { name: 'Cyberpunk Neon', primary: '#06b6d4', secondary: '#f43f5e', bg: '#030712', surface: '#111827', text: '#f9fafb', dark: true },
  { name: 'Warm Amber', primary: '#f59e0b', secondary: '#ea580c', bg: '#fffbeb', surface: '#ffffff', text: '#451a03', dark: false },
];

const DEFAULT_THEME: ThemeTokens = {
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  primaryColor: '#8B6CF6',
  secondaryColor: '#4697F5',
  backgroundColor: '#FAF8F5',
  surfaceColor: '#FFFFFF',
  textColor: '#202744',
  borderRadius: '16px',
  darkMode: false,
};

const DEFAULT_SECTIONS: SectionBlock[] = [
  { id: 'sec-hero', type: 'HERO_PROFILE', title: 'Hero Profile', variant: 'MODERN_SPLIT', isVisible: true },
  { id: 'sec-about', type: 'ABOUT_ME', title: 'About Me', variant: 'CLASSIC_CARD', isVisible: true },
  { id: 'sec-skills', type: 'SKILLS_LIST', title: 'Skills & Stack', variant: 'TAG_CLOUD', isVisible: true },
  { id: 'sec-projects', type: 'PROJECT_LIST', title: 'Featured Projects', variant: 'BENTO_GRID_3COL', isVisible: true },
  { id: 'sec-experience', type: 'EXPERIENCE_TIMELINE', title: 'Career Experience', variant: 'VERTICAL_LINE', isVisible: true },
  { id: 'sec-contact', type: 'CONTACT_SECTION', title: 'Get In Touch', variant: 'FORM_AND_DETAILS', isVisible: true },
];

interface TemplateStudioEditorProps {
  existingTemplate?: Template | null;
  templateId?: string;
}

const TemplateStudioEditor: React.FC<TemplateStudioEditorProps> = ({
  existingTemplate,
  templateId,
}) => {
  const isEditing = !!templateId;
  const navigate = useNavigate();

  // Queries & Mutations
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const uploadThumbnailMutation = useUploadTemplateThumbnail();

  // Template Metadata State initialized directly
  const [name, setName] = useState<string>(existingTemplate?.name || 'Modern Developer Showcase');
  const [slug, setSlug] = useState<string>(existingTemplate?.slug || 'modern-developer');
  const [description, setDescription] = useState<string>(
    existingTemplate?.description || 'Clean and versatile layout for software engineers and architects'
  );
  const [category, setCategory] = useState<TemplateCategory>(existingTemplate?.category || 'DEVELOPER');
  const [isPublished, setIsPublished] = useState<boolean>(existingTemplate?.isPublished || false);
  const [isDefault, setIsDefault] = useState<boolean>(existingTemplate?.isDefault || false);

  // Layout Config State initialized directly
  const [theme, setTheme] = useState<ThemeTokens>(() =>
    existingTemplate?.layoutConfig?.theme
      ? { ...DEFAULT_THEME, ...existingTemplate.layoutConfig.theme }
      : DEFAULT_THEME
  );
  const [sections, setSections] = useState<SectionBlock[]>(() =>
    existingTemplate?.layoutConfig?.sections || DEFAULT_SECTIONS
  );

  // Studio UI State
  const [activeTab, setActiveTab] = useState<'blocks' | 'theme'>('blocks');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Slug generator helper
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Canvas Actions
  const handleAddBlock = (blockDef: BlockDefinition) => {
    const newBlock: SectionBlock = {
      id: generateBlockId(blockDef.type),
      type: blockDef.type,
      title: blockDef.title,
      variant: blockDef.defaultVariants[0] || 'DEFAULT',
      isVisible: true,
    };
    setSections((prev) => [...prev, newBlock]);
    showToast(`Added ${blockDef.title} block to canvas`);
  };

  const handleToggleVisible = (blockId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === blockId ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleRemoveBlock = (blockId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== blockId));
  };

  const handleDuplicateBlock = (block: SectionBlock) => {
    const copy: SectionBlock = {
      ...block,
      id: generateBlockId(block.type),
      title: `${block.title || block.type} (Copy)`,
    };
    const index = sections.findIndex((s) => s.id === block.id);
    const updated = [...sections];
    updated.splice(index + 1, 0, copy);
    setSections(updated);
    showToast(`Duplicated ${block.title || block.type}`);
  };

  const handleVariantChange = (blockId: string, variant: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === blockId ? { ...s, variant } : s))
    );
  };

  const handleTitleChange = (blockId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === blockId ? { ...s, title } : s))
    );
  };

  // Save handler
  const handleSave = (publishState?: boolean) => {
    if (!name.trim()) {
      showToast('Template name is required.');
      return;
    }
    if (!slug.trim()) {
      showToast('Template slug is required.');
      return;
    }

    const payloadLayoutConfig: LayoutConfig = {
      theme,
      sections,
    };

    const targetPublished = publishState !== undefined ? publishState : isPublished;

    if (isEditing && templateId) {
      updateMutation.mutate(
        {
          id: templateId,
          payload: {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            category,
            isPublished: targetPublished,
            isDefault,
            layoutConfig: payloadLayoutConfig,
          },
        },
        {
          onSuccess: () => {
            setIsPublished(targetPublished);
            showToast(`Template "${name}" saved successfully!`);
          },
          onError: (err: AxiosError<{ message?: string }>) => {
            showToast(err.response?.data?.message || err.message || 'Failed to update template.');
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          category,
          isPublished: targetPublished,
          isDefault,
          layoutConfig: payloadLayoutConfig,
        },
        {
          onSuccess: (created) => {
            showToast(`Template "${created.name}" created!`);
            navigate(`/admin/templates/builder/${created.id}`, { replace: true });
          },
          onError: (err: AxiosError<{ message?: string }>) => {
            showToast(err.response?.data?.message || err.message || 'Failed to create template.');
          },
        }
      );
    }
  };

  // Thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && templateId) {
      uploadThumbnailMutation.mutate(
        { id: templateId, file },
        {
          onSuccess: () => {
            showToast('Thumbnail screenshot uploaded successfully!');
          },
          onError: (err: AxiosError<{ message?: string }>) => {
            showToast(err.response?.data?.message || 'Failed to upload thumbnail.');
          },
        }
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Device simulation frame width
  const previewFrameWidth =
    previewDevice === 'mobile'
      ? 'w-[375px]'
      : previewDevice === 'tablet'
      ? 'w-[768px]'
      : 'w-full';

  return (
    <div className="flex flex-col h-screen w-full bg-[#181E35] text-[#FAF8F5] overflow-hidden font-sans">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. TOP APP BAR
         ───────────────────────────────────────────────────────────────────────────── */}
      <header className="h-16 shrink-0 border-b border-[#2A3454] bg-[#202744] px-4 sm:px-6 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/templates"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#FAF8F5]/70 hover:text-white hover:bg-[#2A3454] transition text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Templates</span>
          </Link>

          <div className="h-4 w-px bg-[#2A3454] hidden sm:block" />

          {/* Template Name & Category */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Template Name..."
              className="bg-transparent text-white font-bold text-sm sm:text-base border-b border-transparent hover:border-[#2A3454] focus:border-[#8B6CF6] focus:outline-hidden px-1 py-0.5 max-w-[200px] sm:max-w-[280px]"
            />
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                isPublished
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Center: Device Preview Switcher */}
        <div className="hidden lg:flex items-center gap-1 bg-[#181E35] p-1 rounded-xl border border-[#2A3454]">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1.5 rounded-lg transition ${
              previewDevice === 'desktop'
                ? 'bg-[#8B6CF6] text-white shadow-xs'
                : 'text-[#FAF8F5]/60 hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('tablet')}
            className={`p-1.5 rounded-lg transition ${
              previewDevice === 'tablet'
                ? 'bg-[#8B6CF6] text-white shadow-xs'
                : 'text-[#FAF8F5]/60 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1.5 rounded-lg transition ${
              previewDevice === 'mobile'
                ? 'bg-[#8B6CF6] text-white shadow-xs'
                : 'text-[#FAF8F5]/60 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {isEditing && (
            <label className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2A3454] hover:bg-[#344066] text-[#FAF8F5] text-xs font-semibold cursor-pointer border border-[#344066] transition">
              <Upload className="w-3.5 h-3.5 text-[#8B6CF6]" />
              <span>Thumbnail</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadThumbnailMutation.isPending}
                className="sr-only"
              />
            </label>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A3454] hover:bg-[#344066] text-white text-xs font-bold border border-[#344066] transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(!isPublished)}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-md cursor-pointer ${
              isPublished
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-[#8B6CF6] hover:bg-[#7A5CE6] text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 right-6 z-50 bg-[#8B6CF6] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#FFC45B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. THREE-PANEL STUDIO BODY
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT PANEL: Palette & Theme Styling (320px) ─── */}
        <aside className="w-80 shrink-0 border-r border-[#2A3454] bg-[#202744]/90 flex flex-col overflow-hidden">
          {/* Palette Tabs */}
          <div className="p-3 border-b border-[#2A3454] flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'blocks'
                  ? 'bg-[#8B6CF6] text-white shadow-xs'
                  : 'text-[#FAF8F5]/60 hover:text-white hover:bg-[#2A3454]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Add Blocks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-[#8B6CF6] text-white shadow-xs'
                  : 'text-[#FAF8F5]/60 hover:text-white hover:bg-[#2A3454]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme Tokens</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* TAB: ADD BLOCKS */}
            {activeTab === 'blocks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Block Palette</span>
                  <span>{AVAILABLE_BLOCKS.length} available</span>
                </div>

                <div className="space-y-2.5">
                  {AVAILABLE_BLOCKS.map((block) => (
                    <div
                      key={block.type}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-indigo-500/50 transition group flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          {block.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                          {block.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBlock(block)}
                        className="shrink-0 p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition cursor-pointer"
                        title="Add to canvas"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: THEME TOKENS */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                {/* Preset Palettes */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Quick Color Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_PALETTES.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTheme((prev) => ({
                            ...prev,
                            primaryColor: p.primary,
                            secondaryColor: p.secondary,
                            backgroundColor: p.bg,
                            surfaceColor: p.surface,
                            textColor: p.text,
                            darkMode: p.dark,
                          }));
                          showToast(`Applied preset: ${p.name}`);
                        }}
                        className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/80 text-left transition text-xs font-semibold flex items-center gap-2"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span className="truncate text-[11px] text-slate-300">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Picker */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {AVAILABLE_FONTS.map((f, i) => (
                      <option key={i} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Primary Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-md bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.backgroundColor}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-md bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.backgroundColor}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Surface / Card Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.surfaceColor || '#ffffff'}
                        onChange={(e) => setTheme({ ...theme, surfaceColor: e.target.value })}
                        className="w-8 h-8 rounded-md bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.surfaceColor || '#ffffff'}
                        onChange={(e) => setTheme({ ...theme, surfaceColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.textColor || '#0f172a'}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="w-8 h-8 rounded-md bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.textColor || '#0f172a'}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Border Radius ({theme.borderRadius || '12px'})
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['0px', '8px', '16px', '9999px'].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setTheme({ ...theme, borderRadius: radius })}
                        className={`py-1.5 rounded-md text-[11px] font-mono transition border ${
                          theme.borderRadius === radius
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {radius === '9999px' ? 'Pill' : radius}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode Switch */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span className="text-xs font-semibold text-slate-200">Dark Mode Palette</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!theme.darkMode}
                    onChange={(e) => setTheme({ ...theme, darkMode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {/* Category & Slug Settings */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Template Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="DESIGNER">DESIGNER</option>
                      <option value="BUSINESS">BUSINESS</option>
                      <option value="CREATIVE">CREATIVE</option>
                      <option value="MINIMAL">MINIMAL</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Default Template</span>
                      <span className="text-[10px] text-slate-400">Fallback layout for new users</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── CENTER PANEL: Drag-and-Drop Interactive Canvas (380px) ─── */}
        <section className="w-96 shrink-0 border-r border-[#2A3454] bg-[#202744]/70 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#2A3454] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#8B6CF6]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                Layout Sections ({sections.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#FAF8F5]/60">Drag ⠿ to Reorder</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sections.length === 0 ? (
              <div className="h-64 border-2 border-dashed border-[#2A3454] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-[#FAF8F5]/50">
                <Layers className="w-8 h-8 mb-2 stroke-1 text-[#8B6CF6]" />
                <p className="text-xs font-semibold text-white">Canvas is empty</p>
                <p className="text-[11px] text-[#FAF8F5]/60 mt-1">
                  Choose blocks from the left panel to begin crafting your layout.
                </p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={setSections}
                className="space-y-3"
              >
                {sections.map((section) => {
                  const blockDef = AVAILABLE_BLOCKS.find((b) => b.type === section.type);
                  const variants = blockDef?.defaultVariants || ['DEFAULT'];

                  return (
                    <Reorder.Item
                      key={section.id}
                      value={section}
                      className={`p-3.5 rounded-xl border transition-all shadow-md cursor-grab active:cursor-grabbing select-none ${
                        section.isVisible
                          ? 'bg-[#181E35] border-[#2A3454] hover:border-[#8B6CF6]/70'
                          : 'bg-[#181E35]/40 border-[#2A3454]/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Drag Handle & Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GripVertical className="w-4 h-4 text-[#FAF8F5]/40 shrink-0" />
                          <div className="min-w-0">
                            <input
                              type="text"
                              value={section.title || section.type}
                              onChange={(e) => handleTitleChange(section.id, e.target.value)}
                              className="font-bold text-xs text-white bg-transparent border-b border-transparent hover:border-[#2A3454] focus:border-[#8B6CF6] focus:outline-hidden w-full truncate"
                            />
                            <span className="text-[10px] font-mono text-[#8B6CF6] block mt-0.5">
                              {section.type}
                            </span>
                          </div>
                        </div>

                        {/* Block Action Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleVisible(section.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              section.isVisible
                                ? 'text-emerald-400 hover:bg-[#202744]'
                                : 'text-[#FAF8F5]/40 hover:bg-[#202744]'
                            }`}
                            title={section.isVisible ? 'Hide block' : 'Show block'}
                          >
                            {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(section)}
                            className="p-1.5 rounded-lg text-[#FAF8F5]/60 hover:text-white hover:bg-[#202744] transition cursor-pointer"
                            title="Duplicate block"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(section.id)}
                            className="p-1.5 rounded-lg text-[#FAF8F5]/60 hover:text-rose-400 hover:bg-[#202744] transition cursor-pointer"
                            title="Delete block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Variant Selector Dropdown */}
                      <div className="mt-3 pt-2.5 border-t border-[#2A3454] flex items-center justify-between text-[11px]">
                        <span className="text-[#FAF8F5]/60 font-mono text-[10px]">Variant:</span>
                        <select
                          value={section.variant || variants[0]}
                          onChange={(e) => handleVariantChange(section.id, e.target.value)}
                          className="px-2 py-1 rounded bg-[#202744] border border-[#2A3454] text-white text-[11px] focus:outline-hidden focus:border-[#8B6CF6] font-mono"
                        >
                          {variants.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            )}
          </div>
        </section>

        {/* ─── RIGHT PANEL: Live Device Simulator ─── */}
        <main className="flex-1 bg-[#131726] flex flex-col items-center justify-start overflow-hidden relative p-4 sm:p-6">
          <div className="w-full flex items-center justify-between pb-3 text-xs text-[#FAF8F5]/60 font-mono border-b border-[#2A3454] mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Simulator Preview</span>
            </span>
            <span>Viewport: {previewDevice.toUpperCase()}</span>
          </div>

          {/* Interactive Screen Frame */}
          <div
            className={`flex-1 overflow-y-auto rounded-2xl shadow-2xl border border-[#2A3454] bg-white transition-all duration-300 ${previewFrameWidth} max-h-full`}
          >
            <DynamicPortfolioRenderer
              data={{
                layout: {
                  theme,
                  sections,
                },
              }}
              isInteractivePreview
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export const AdminTemplateBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useAdminTemplate(id || '', {
    enabled: isEditing,
  });

  if (isEditing && isLoadingTemplate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-3" />
        <p className="font-sans text-sm font-semibold">Loading template blueprint...</p>
      </div>
    );
  }

  return (
    <TemplateStudioEditor
      key={existingTemplate?.id || 'new'}
      existingTemplate={existingTemplate}
      templateId={id}
    />
  );
};

export default AdminTemplateBuilder;
