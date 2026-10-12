# Panduan Implementasi Frontend: Business Theme & Live Simulator Playground

Dokumen ini adalah instruksi kerja dan prompt teknis lengkap untuk penyesuaian frontend (`porto-admin-dev-fe`) agar:
1. **User Profil Bisnis** dapat memilih template, reorder section, dan customize warna brand bisnisnya.
2. **Semua User (Personal & Bisnis)** memiliki fitur **Live Preview Playground (Device Simulator)** saat mengedit tema secara real-time (Desktop, Tablet 768px, Mobile 375px) layaknya Superadmin Theme Builder.

---

## 1. Arsitektur & Gambaran Alur

```
┌────────────────────────────────────────────────────────┐
│             User Theme Customizer Interface            │
├───────────────────────────┬────────────────────────────┤
│ Left Panel: Controls      │ Right / Modal: Playground  │
│ ───────────────────────── │ ────────────────────────── │
│ • Drag ⠿ Reorder Sections │ • Realtime Simulator       │
│ • Toggle Eye (Hide/Show)  │ • Viewport: 🖥️ | 📱 | 📟    │
│ • Color Picker & Palettes │ • Render AST dinamis via   │
│ • Dark Mode Toggle        │   DynamicPortfolioRenderer │
│ • 1-Click Template Picker │ • Instant Feedback (No Save│
│                           │   or Refresh needed!)      │
└───────────────────────────┴────────────────────────────┘
```

---

## 2. Update API Service (`src/services/templateApi.ts`)

Buka file `src/services/templateApi.ts`, lalu tambahkan method untuk profil bisnis di dalam objek `templateApi`:

```typescript
// ─── BUSINESS PROFILE THEME ENDPOINTS ───────────────────────────────────────

// 1. Ambil template aktif, userCustomConfig, dan resolvedLayout untuk profil bisnis
getMyBusinessTheme: async (): Promise<{
  template: Template;
  userCustomConfig: UserCustomConfig | null;
  resolvedLayout: LayoutConfig;
}> => {
  const res = await api.get('/templates/business/me');
  return res.data;
},

// 2. Terapkan template ke profil bisnis (1-click apply)
applyBusinessTemplate: async (templateId: string): Promise<{ message: string; template: Template }> => {
  const res = await api.patch('/templates/business/me/apply', { templateId });
  return res.data;
},

// 3. Reorder section profil bisnis (Drag & Drop)
reorderBusinessSections: async (sectionIds: string[]): Promise<{ message: string; resolvedLayout?: LayoutConfig }> => {
  const res = await api.patch('/templates/business/me/reorder-sections', { sectionIds });
  return res.data;
},

// 4. Update kustomisasi warna aksen / dark mode / visibility profil bisnis
updateBusinessThemeConfig: async (payload: UserCustomConfig): Promise<{ message: string }> => {
  const res = await api.patch('/templates/business/me/theme-config', payload);
  return res.data;
},

// 5. Reset kustomisasi profil bisnis ke default template bawaan
resetBusinessThemeConfig: async (): Promise<{ message: string }> => {
  const res = await api.post('/templates/business/me/reset');
  return res.data;
},
```

---

## 3. Update React Query Hooks (`src/hooks/useTemplates.ts`)

Buka `src/hooks/useTemplates.ts`, lalu daftarkan query keys dan hooks untuk profil bisnis:

```typescript
// Tambahkan ke TEMPLATES_QUERY_KEY:
export const TEMPLATES_QUERY_KEY = {
  // ... existing keys
  myBusinessTheme: () => ['templates', 'business', 'me'] as const,
};

// ─── BUSINESS HOOKS ──────────────────────────────────────────────────────────

/**
 * Hook to retrieve active template, userCustomConfig, and resolvedLayout for current user's business profile.
 */
export function useMyBusinessTheme() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY.myBusinessTheme(),
    queryFn: () => templateApi.getMyBusinessTheme(),
  });
}

/**
 * Hook for business user to apply a template.
 */
export function useApplyBusinessTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => templateApi.applyBusinessTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myBusinessTheme() });
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}

/**
 * Hook for business user to reorder sections (drag-and-drop).
 */
export function useReorderBusinessSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionIds: string[]) => templateApi.reorderBusinessSections(sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myBusinessTheme() });
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}

/**
 * Hook for business user to update custom theme overrides.
 */
export function useUpdateBusinessThemeConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCustomConfig) => templateApi.updateBusinessThemeConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myBusinessTheme() });
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}

/**
 * Hook for business user to reset customizations back to template defaults.
 */
export function useResetBusinessThemeConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => templateApi.resetBusinessThemeConfig(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myBusinessTheme() });
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}
```

---

## 4. Buat Komponen Live Device Simulator Playground (`src/components/molecules/ThemeDeviceSimulator.tsx`)

Buat file baru `src/components/molecules/ThemeDeviceSimulator.tsx`. Komponen ini berfungsi sebagai modal simulator interaktif yang menampilkan live device frame (Desktop, Tablet 768px, Mobile 375px) menggunakan komponen yang sudah ada `DynamicPortfolioRenderer`:

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Sparkles, X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { DynamicPortfolioRenderer, DynamicPortfolioData } from '../organisms/DynamicPortfolioRenderer';

interface ThemeDeviceSimulatorProps {
  data: DynamicPortfolioData;
  title?: string;
  onClose?: () => void;
  publicUrl?: string;
  isModal?: boolean;
}

export const ThemeDeviceSimulator: React.FC<ThemeDeviceSimulatorProps> = ({
  data,
  title = 'Live Simulator Playground',
  onClose,
  publicUrl,
  isModal = true,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const frameWidth =
    device === 'mobile'
      ? 'w-[375px]'
      : device === 'tablet'
      ? 'w-[768px]'
      : 'w-full';

  const containerClasses = isModal
    ? `fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md transition-all duration-200 ${
        isFullscreen ? 'p-0' : 'p-3 sm:p-6'
      }`
    : 'flex flex-col h-[650px] w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl';

  return (
    <div className={containerClasses}>
      {/* ─── Top Control Bar ─── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0 text-xs font-sans text-slate-300 rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">{title}</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold">
              Live Preview
            </span>
          </div>
        </div>

        {/* Viewport Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700/80">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              device === 'desktop'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Resolution (Full Width)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              device === 'tablet'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet Resolution (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              device === 'mobile'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile Resolution (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Window Actions */}
        <div className="flex items-center gap-2">
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Open Live Public URL"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {isModal && (
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/50 transition cursor-pointer"
              title="Close Simulator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Screen Frame Container ─── */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/70">
        <div
          className={`h-full overflow-y-auto bg-white rounded-xl shadow-2xl transition-all duration-300 border border-slate-800 ${frameWidth} max-h-full`}
        >
          <DynamicPortfolioRenderer data={data} isInteractivePreview />
        </div>
      </div>
    </div>
  );
};

export default ThemeDeviceSimulator;
```

---

## 5. Upgrade `ProfileThemeTab.tsx` dengan Live Simulator

Di `src/components/organisms/ProfileThemeTab.tsx`:
1. Import `ThemeDeviceSimulator`:
   ```tsx
   import { ThemeDeviceSimulator } from '../molecules/ThemeDeviceSimulator';
   import { Monitor } from 'lucide-react';
   ```
2. Tambahkan state modal:
   ```tsx
   const [showSimulator, setShowSimulator] = useState<boolean>(false);
   ```
3. Tambahkan tombol **"Live Preview Simulator"** di Hero Header:
   ```tsx
   <button
     type="button"
     onClick={() => setShowSimulator(true)}
     className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer"
     title="Open interactive real-time viewport simulator"
   >
     <Monitor className="w-4 h-4 text-indigo-200" />
     <span>Live Simulator</span>
   </button>
   ```
4. Siapkan objek `livePreviewData`:
   ```tsx
   const livePreviewData = {
     profile: _profile,
     layout: {
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
   ```
5. Di bagian paling bawah return JSX, tambahkan:
   ```tsx
   {showSimulator && (
     <ThemeDeviceSimulator
       data={livePreviewData}
       title="Developer Portfolio Live Simulator"
       publicUrl={userId ? `/portfolio/${userId}` : undefined}
       onClose={() => setShowSimulator(false)}
       isModal
     />
   )}
   ```

---

## 6. Buat Komponen `BusinessThemeTab.tsx`

Buat file baru `src/components/organisms/BusinessThemeTab.tsx`:
Komponen ini khusus untuk mengatur tampilan portofolio bisnis dengan kategori template default `BUSINESS` dan blok bisnis:

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Reorder } from 'motion/react';
import {
  Palette, Check, Loader2, Sparkles, Sliders, Moon, Sun,
  CheckCircle2, Layers, GripVertical, Eye, EyeOff, RotateCcw,
  AlertTriangle, ArrowUpDown, Laptop, ShieldAlert, Monitor, Building2
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
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'ALL'>('BUSINESS');
  const { data: myThemeData, isLoading: isLoadingMyTheme } = useMyBusinessTheme();
  const { data: publishedTemplates = [], isLoading: isLoadingTemplates } = usePublishedTemplates(
    selectedCategory === 'ALL' ? undefined : selectedCategory
  );

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

  const livePreviewData = {
    businessProfile: businessProfile,
    businessServices: businessProfile?.services || [],
    businessProjects: businessProfile?.projects || [],
    layout: {
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Corporate Brand Showcase & Themes</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Business Profile Customizer
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Customize your business portfolio presentation: reorder showcase sections, toggle catalog visibility, and align with your brand guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowSimulator(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md cursor-pointer"
            >
              <Monitor className="w-4 h-4 text-blue-200" />
              <span>Live Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={resetThemeMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Active Template Bar */}
        {activeTemplate && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Active Business Template:</span>
              <strong className="text-white font-bold">{activeTemplate.name}</strong>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] uppercase">
                {activeTemplate.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
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
        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Available Corporate & Business Templates</span>
        </h4>

        {isLoadingTemplates ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedTemplates.map((tpl) => {
              const isActive = activeTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={`rounded-2xl bg-white overflow-hidden border p-5 flex flex-col justify-between ${
                    isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-mono text-[9px] uppercase font-bold text-blue-600">{tpl.category}</span>
                    <h5 className="font-bold text-sm text-slate-900 mt-1">{tpl.name}</h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    disabled={isActive || applyTemplateMutation.isPending}
                    className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold uppercase ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-black text-white hover:bg-slate-800'
                    }`}
                  >
                    {isActive ? 'Current Template' : 'Use This Template'}
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
          publicUrl={userId ? `/business-profiles/${userId}` : undefined}
          onClose={() => setShowSimulator(false)}
          isModal
        />
      )}

      {/* ─── Reset Confirmation Modal ─── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">Reset Business Theme?</h3>
            <p className="text-xs text-slate-500 mt-2">
              This will restore the original layout blueprint for this business template.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessThemeTab;
```

---

## 7. Update `BusinessProfile.tsx` dengan Navigasi Tab

Buka `src/components/pages/BusinessProfile.tsx`:
1. Tambahkan state tab di awal komponen:
   ```tsx
   import { BusinessThemeTab } from '../organisms/BusinessThemeTab';
   import { Building2, Camera, Palette, Globe, Key, ShieldAlert } from 'lucide-react';

   type BusinessTab = 'brand' | 'theme';
   const [activeTab, setActiveTab] = useState<BusinessTab>('brand');
   ```
2. Render bar navigasi tab:
   ```tsx
   <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 mb-6 overflow-x-auto">
     <button
       type="button"
       onClick={() => setActiveTab('brand')}
       className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
         activeTab === 'brand' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
       }`}
     >
       <Building2 className="h-3.5 w-3.5" />
       <span>Identitas Brand & Media</span>
     </button>
     <button
       type="button"
       onClick={() => setActiveTab('theme')}
       className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
         activeTab === 'theme' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
       }`}
     >
       <Palette className="h-3.5 w-3.5 text-blue-600" />
       <span>Theme & Showcase Bisnis</span>
     </button>
   </div>
   ```
3. Bungkus form profil lama di `{activeTab === 'brand' && ( ...form lama... )}`
4. Render tab tema bisnis di `{activeTab === 'theme' && <BusinessThemeTab businessProfile={profile} userId={profile?.userId || ''} />}`

---

## 8. Checklist Verifikasi
- [ ] Endpoint `/templates/business/me` dapat dipanggil dan mengembalikan template aktif + layout.
- [ ] Tab "Theme & Showcase Bisnis" muncul di halaman Business Profile.
- [ ] Tombol "Live Simulator" dapat dibuka dan menampilkan simulasi HP, Tablet, dan Desktop.
- [ ] Perubahan warna aksen atau drag-and-drop urutan kartu langsung terlihat di simulator secara real-time!
