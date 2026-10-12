# Panduan & Spesifikasi Lengkap Implementasi Frontend: Theme & Section Builder

Dokumen ini berisi spesifikasi teknis, kontrak API, tipe data TypeScript, arsitektur komponen, dan panduan implementasi untuk tim Frontend (`porto-admin-dev-fe`).

---

## 1. Ringkasan & Tech Stack Frontend

Backend (NestJS + Prisma) telah selesai mengimplementasikan **Drag-and-Drop Theme & Section Builder**. Layout template disimpan sebagai **JSON AST Blueprint** dan di-resolve secara dinamis pada endpoint portofolio publik.

### Stack yang Digunakan di `porto-admin-dev-fe`:
* **Framework**: React 19 + Vite + TypeScript
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
* **Animasi & Drag-and-Drop**: `motion/react` (Framer Motion v12 sudah terpasang — gunakan komponen bawaan `<Reorder.Group>` & `<Reorder.Item>`)
* **Icons**: `lucide-react`
* **Data Fetching**: `@tanstack/react-query` & `axios`
* **Design Pattern**: Atomic Design (`components/atoms`, `molecules`, `organisms`, `pages`)

---

## 2. Definisi Tipe Data TypeScript (`src/types/theme.ts`)

Simpan kontrak tipe data berikut di frontend:

```typescript
export type TemplateCategory =
  | 'DEVELOPER'
  | 'DESIGNER'
  | 'BUSINESS'
  | 'CREATIVE'
  | 'MINIMAL'
  | 'OTHER';

export type BlockType =
  | 'HERO_PROFILE'
  | 'ABOUT_ME'
  | 'PROJECT_LIST'
  | 'EXPERIENCE_TIMELINE'
  | 'SKILLS_LIST'
  | 'SERVICES_GRID'
  | 'CONTACT_SECTION'
  | 'CUSTOM_BANNER';

export interface ThemeTokens {
  fontFamily: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  surfaceColor?: string;
  textColor?: string;
  borderRadius?: string;
  darkMode?: boolean;
}

export interface SectionBlock {
  id: string;
  type: BlockType | string;
  title?: string;
  variant?: string;
  isVisible: boolean;
  props?: Record<string, any>;
}

export interface LayoutConfig {
  theme: ThemeTokens;
  sections: SectionBlock[];
}

export interface UserCustomConfig {
  theme?: Partial<ThemeTokens>;
  sections?: Array<{
    id: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }>;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: TemplateCategory;
  isPublished: boolean;
  isDefault: boolean;
  version: number;
  layoutConfig: LayoutConfig;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    profiles: number;
  };
}

export interface CreateTemplatePayload {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: TemplateCategory;
  isPublished?: boolean;
  isDefault?: boolean;
  layoutConfig: LayoutConfig;
}

export interface UpdateTemplatePayload {
  slug?: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  category?: TemplateCategory;
  isPublished?: boolean;
  isDefault?: boolean;
  layoutConfig?: LayoutConfig;
}
```

---

## 3. Integrasi API Service (`src/services/templateApi.ts`)

Gunakan instance axios yang sudah terkonfigurasi token autentikasi di frontend:

```typescript
import api from '@/lib/api'; // sesuaikan dengan path instance axios kamu
import {
  Template,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  UserCustomConfig,
  TemplateCategory,
} from '@/types/theme';

export const templateApi = {
  // ─── ADMIN ENDPOINTS (Require Role: ADMIN) ───────────────────────────────────

  // 1. Ambil semua template (draft & published) dengan pagination & filter
  getAllAdmin: async (params?: {
    search?: string;
    category?: TemplateCategory;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get('/admin/templates', { params });
    return res.data; // { data: Template[], meta: { total, page, limit, totalPages } }
  },

  // 2. Ambil detail template untuk di-load ke Builder canvas
  getByIdAdmin: async (id: string): Promise<Template> => {
    const res = await api.get(`/admin/templates/${id}`);
    return res.data;
  },

  // 3. Simpan template baru hasil builder
  create: async (payload: CreateTemplatePayload): Promise<Template> => {
    const res = await api.post('/admin/templates', payload);
    return res.data;
  },

  // 4. Update susunan layout / config template
  update: async (id: string, payload: UpdateTemplatePayload): Promise<Template> => {
    const res = await api.patch(`/admin/templates/${id}`, payload);
    return res.data;
  },

  // 5. Toggle publish/unpublish
  togglePublish: async (id: string, isPublished: boolean): Promise<Template> => {
    const res = await api.patch(`/admin/templates/${id}/publish`, { isPublished });
    return res.data;
  },

  // 6. Duplikasi / Clone template
  clone: async (id: string): Promise<Template> => {
    const res = await api.post(`/admin/templates/${id}/clone`);
    return res.data;
  },

  // 7. Upload thumbnail screenshot template
  uploadThumbnail: async (id: string, file: File): Promise<Template> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/admin/templates/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 8. Hapus template
  delete: async (id: string) => {
    const res = await api.delete(`/admin/templates/${id}`);
    return res.data;
  },

  // ─── USER & PUBLIC ENDPOINTS ────────────────────────────────────────────────

  // Ambil list template yang siap dipakai user
  getPublishedTemplates: async (category?: TemplateCategory): Promise<Template[]> => {
    const res = await api.get('/templates', { params: { category } });
    return res.data;
  },

  // Detail preview template publik
  getPublishedDetail: async (idOrSlug: string): Promise<Template> => {
    const res = await api.get(`/templates/${idOrSlug}`);
    return res.data;
  },

  // User mengadopsi template ke profilnya
  applyTemplate: async (templateId: string) => {
    const res = await api.patch('/templates/me/apply', { templateId });
    return res.data;
  },

  // User kustomisasi warna aksen / sembunyikan section
  updateUserThemeConfig: async (payload: UserCustomConfig) => {
    const res = await api.patch('/templates/me/theme-config', payload);
    return res.data;
  },
};
```

---

## 4. Rincian Fitur yang Perlu Diimplementasikan di Frontend

### Fitur A: Admin Theme Builder Studio (`AdminTemplateBuilder.tsx`)
**Lokasi**: `src/components/pages/AdminTemplateBuilder.tsx` (Route: `/admin/templates/builder` atau `/admin/templates/builder/:id`)

1. **Struktur Layout Studio (3 Kolom / Split Screen)**:
   * **Left Panel (Settings & Palette)**:
     - Block Palette: Tombol untuk menambahkan blok baru (`Hero`, `Skills`, `Projects`, `Experiences`, `Contact`).
     - Global Theme Styling: Color picker (`primaryColor`, `backgroundColor`, `surfaceColor`, `textColor`), font picker dropdown (`Plus Jakarta Sans`, `Inter`, `Outfit`, `Fira Code`), border radius slider (`0px`, `8px`, `16px`, `9999px`), dan toggle Dark Mode.
   * **Center Panel (Interactive Canvas)**:
     - Menggunakan `<Reorder.Group values={sections} onReorder={setSections}>` dari `motion/react`.
     - Setiap blok dirender dalam `<Reorder.Item key={section.id} value={section}>`.
     - Kontrol pada setiap kartu blok:
       - ⠿ Drag handle icon
       - Switch `isVisible` (tampilkan/sembunyikan)
       - Dropdown varian (misal `PROJECT_LIST` punya varian: `BENTO_GRID_3COL`, `CAROUSEL`, `MINIMAL_LIST`)
       - Tombol Hapus blok
   * **Right Panel (Live Device Preview)**:
     - Tampilan simulasi website portofolio secara real-time berdasarkan susunan blok dan tema yang sedang diatur di canvas.
     - Switch view: Desktop, Tablet, Mobile.
2. **Top Header**:
   - Input `name`, `slug`, dan `category`.
   - Tombol "Save Draft" & "Publish".
   - Tombol "Capture/Upload Thumbnail".

---

### Fitur B: Halaman Manajemen Template Admin (`AdminTemplates.tsx`)
**Lokasi**: `src/components/pages/AdminTemplates.tsx` (Route: `/admin/templates`)

1. **Header & Filter Bar**:
   - Tombol "+ Create New Template" $\rightarrow$ mengarah ke Builder Studio.
   - Search input (cari berdasarkan nama/slug).
   - Filter dropdown kategori (`DEVELOPER`, `DESIGNER`, `BUSINESS`, dll).
   - Filter status (`All`, `Published`, `Draft`).
2. **Template Grid View**:
   - Card menampilkan thumbnail gambar preview.
   - Badge Status: `Published` (hijau) atau `Draft` (kuning), serta badge `Default`.
   - Nama template, kategori, versi, dan jumlah user aktif yang menggunakan template tersebut (`_count.profiles`).
   - Aksi per kartu:
     - "Edit in Builder"
     - "Clone / Duplicate"
     - "Toggle Publish"
     - "Delete"

---

### Fitur C: Tab "Theme Portofolio" di Profil User (`AdminProfile.tsx`)
**Lokasi**: Tambahkan tab/section baru di `src/components/pages/AdminProfile.tsx`

1. **Card Selector Template**:
   - Fetch template aktif dengan `useQuery` memanggil `templateApi.getPublishedTemplates()`.
   - Tampilkan kartu-kartu template dalam format grid.
   - Template yang sedang aktif ditandai dengan border highlight & badge "Active Theme".
   - Tombol **"Use This Template"** $\rightarrow$ memanggil `templateApi.applyTemplate(template.id)`.
2. **Mini Customizer (Personal Accent)**:
   - User dapat mengatur warna aksen custom (`primaryColor`) atau toggle dark/light mode miliknya sendiri tanpa mengubah template dasar orang lain.
   - Menyimpan via `templateApi.updateUserThemeConfig()`.

---

### Fitur D: Dynamic Portfolio Renderer (`DynamicPortfolioRenderer.tsx`)
**Lokasi**: `src/components/organisms/DynamicPortfolioRenderer.tsx`

Komponen ini digunakan di halaman publik portofolio pengunjung (`/portfolio/:userId`):
1. Mengambil data dari endpoint publik yang sudah ada: `GET /portfolio/:userId`.
2. Endpoint tersebut kini mengembalikan objek:
   ```json
   {
     "profile": { ... },
     "experiences": [ ... ],
     "projects": [ ... ],
     "layout": {
       "theme": { ... },
       "sections": [ ... ]
     }
   }
   ```
3. Komponen me-looping `layout.sections`:
   ```tsx
   {layout.sections
     .filter((section) => section.isVisible)
     .map((section) => {
       switch (section.type) {
         case 'HERO_PROFILE':
           return <HeroBlock key={section.id} variant={section.variant} profile={profile} props={section.props} />;
         case 'SKILLS_LIST':
           return <SkillsBlock key={section.id} variant={section.variant} skills={profile.skills} props={section.props} />;
         case 'PROJECT_LIST':
           return <ProjectsBlock key={section.id} variant={section.variant} projects={projects} props={section.props} />;
         case 'EXPERIENCE_TIMELINE':
           return <ExperienceBlock key={section.id} variant={section.variant} experiences={experiences} props={section.props} />;
         case 'CONTACT_SECTION':
           return <ContactBlock key={section.id} variant={section.variant} profile={profile} props={section.props} />;
         default:
           return null;
       }
     })}
   ```
4. Warna tema diaplikasikan via inline CSS variables pada root container:
   ```tsx
   <div
     style={{
       '--primary': layout.theme.primaryColor,
       '--bg': layout.theme.backgroundColor,
       '--surface': layout.theme.surfaceColor,
       '--text': layout.theme.textColor,
       fontFamily: layout.theme.fontFamily,
     } as React.CSSProperties}
   >
     {/* Render dynamic blocks */}
   </div>
   ```

---

## 5. Contoh Implementasi Drag & Drop dengan `motion/react`

Karena di `porto-admin-dev-fe` sudah terinstall package `motion: ^12.23.24`, implementasi drag-and-drop sangat ringkas:

```tsx
import { Reorder } from 'motion/react';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { SectionBlock } from '@/types/theme';

interface CanvasProps {
  sections: SectionBlock[];
  onChange: (sections: SectionBlock[]) => void;
  onRemove: (id: string) => void;
  onToggleVisible: (id: string) => void;
}

export const BuilderCanvas = ({
  sections,
  onChange,
  onRemove,
  onToggleVisible,
}: CanvasProps) => {
  return (
    <Reorder.Group
      axis="y"
      values={sections}
      onReorder={onChange}
      className="space-y-3"
    >
      {sections.map((section) => (
        <Reorder.Item
          key={section.id}
          value={section}
          className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl shadow-lg cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-slate-400" />
            <div>
              <p className="font-semibold text-white text-sm">{section.title || section.type}</p>
              <span className="text-xs text-indigo-400 font-mono">
                {section.variant || 'DEFAULT'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleVisible(section.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {section.isVisible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
            </button>
            <button
              type="button"
              onClick={() => onRemove(section.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
```

---

## 6. Checklist Eksekusi Frontend

- [ ] Simpan tipe data di `src/types/theme.ts`.
- [ ] Buat API service di `src/services/templateApi.ts`.
- [ ] Buat halaman katalog admin `AdminTemplates.tsx`.
- [ ] Buat halaman studio drag-and-drop `AdminTemplateBuilder.tsx`.
- [ ] Tambahkan tab "Theme Portofolio" di `AdminProfile.tsx`.
- [ ] Buat `DynamicPortfolioRenderer.tsx` untuk render portofolio publik.
- [ ] Daftarkan route baru di `App.tsx` / router configuration.
