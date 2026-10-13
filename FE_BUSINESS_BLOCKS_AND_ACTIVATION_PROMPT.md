# Panduan Penyesuaian Frontend: Aktivasi Profil Bisnis & Rich Business Content Blocks (Opsi A)

Dokumen ini berisi spesifikasi teknis dan prompt siap pakai untuk frontend (`porto-admin-dev-fe`) guna mengimplementasikan dua fitur utama:
1. **Dual Profile Activation & Workspace Switcher:** Memungkinkan user akun personal mengaktifkan Profil Bisnis/Agensi secara instan (1 akun login memiliki akses ke Personal Portfolio & Business Agency).
2. **Rich Business Content Blocks (Opsi A):** Mendukung kustomisasi visual & data konten bisnis di dalam Theme Studio:
   - `CLIENTS_LOGO` (Logo Klien / Brand Partner)
   - `COMPANY_STATS` (Angka Metrik: "50+ Projects", "99% CSAT")
   - `PROCESS_WORKFLOW` (4 Langkah Cara Kerja: Discovery ➔ UI/UX ➔ Dev ➔ Launch)
   - `TESTIMONIALS` (Testimoni & Rating Bintang Klien)
   - `FAQ_ACCORDION` (Tanya Jawab Seputar Termin, IP, Garansi)
   - `CTA_BANNER` (Banner Konsultasi / Calendly / WhatsApp)

---

## 1. Daftar Endpoint Backend yang Siap Digunakan

| Endpoint | Method | Keterangan |
| :--- | :---: | :--- |
| `/business-profiles` | `POST` | **Aktivasi Profil Bisnis Baru** untuk user yang sedang login. |
| `/business-profiles/me` | `GET` | Ambil detail profil bisnis user yang login. |
| `/templates/business/me` | `GET` | Ambil layout config, tema aktif, dan kustomisasi bisnis. |
| `/templates/business/me/sections/:sectionId` | `PATCH` | **Update props konten section spesifik** (misal edit testimoni / FAQ / stats tanpa menimpa section lain). |
| `/templates/business/me/theme-config` | `PATCH` | Update tema global (primary color, fonts, visibility). |
| `/templates/business/me/reorder-sections` | `PATCH` | Simpan urutan reorder section (Drag & Drop). |
| `/templates/upload-asset` | `POST` | **Upload Gambar Aset** (multipart `file` ke Cloudinary, return `{ url }`) untuk logo klien, foto tim, avatar testimoni. |

---

## 2. Update API Service

Buka file `src/services/templateApi.ts` (atau service API terkait), tambahkan fungsi-fungsi berikut:

```typescript
// src/services/templateApi.ts
import api from './api';

export const templateApi = {
  // ... fungsi yang sudah ada ...

  // Update spesifik 1 section (props, title, isVisible) untuk profil personal
  updateUserSection: async (sectionId: string, payload: {
    title?: string;
    variant?: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }) => {
    const res = await api.patch(`/templates/me/sections/${sectionId}`, payload);
    return res.data;
  },

  // Update spesifik 1 section (props, title, isVisible) untuk profil bisnis
  updateBusinessSection: async (sectionId: string, payload: {
    title?: string;
    variant?: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }) => {
    const res = await api.patch(`/templates/business/me/sections/${sectionId}`, payload);
    return res.data;
  },

  // Upload aset gambar untuk custom blocks (logo klien, foto review, avatar)
  uploadThemeAsset: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/templates/upload-asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Aktivasi profil bisnis untuk user personal yang sedang login
  activateBusinessProfile: async (payload: {
    businessName: string;
    description?: string;
    contactEmail?: string;
    phoneNumber?: string;
    location?: string;
    website?: string;
  }) => {
    const res = await api.post('/business-profiles', payload);
    return res.data;
  },
};
```

---

## 3. Komponen: Workspace & Profile Switcher

Tambahkan komponen switcher di Navbar atau Sidebar agar user bisa berpindah antara mode **Personal Portfolio** dan **Business Agency**, atau mengaktifkan profil bisnis jika belum punya.

### `src/components/organisms/WorkspaceSwitcher.tsx`
```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Plus, ChevronDown, Check } from 'lucide-react';
import { ActivateBusinessModal } from './ActivateBusinessModal';

interface WorkspaceSwitcherProps {
  currentUser: {
    name?: string;
    email: string;
    hasProfile?: boolean;
    hasBusinessProfile?: boolean;
  };
  currentWorkspace: 'PERSONAL' | 'BUSINESS';
  onWorkspaceChange?: (workspace: 'PERSONAL' | 'BUSINESS') => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentUser,
  currentWorkspace,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const navigate = useNavigate();

  const handleSelectWorkspace = (type: 'PERSONAL' | 'BUSINESS') => {
    setIsOpen(false);
    if (type === 'PERSONAL') {
      navigate('/admin/profile');
    } else {
      navigate('/admin/business/dashboard');
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-all text-sm font-medium shadow-sm"
        >
          {currentWorkspace === 'BUSINESS' ? (
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="text-left">
            <p className="text-xs font-semibold leading-tight text-white">
              {currentWorkspace === 'BUSINESS' ? 'Business Studio' : 'Personal Portfolio'}
            </p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Pilih Ruang Kerja (Workspace)
            </div>

            {/* Opsi Personal */}
            <button
              onClick={() => handleSelectWorkspace('PERSONAL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                currentWorkspace === 'PERSONAL'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20'
                  : 'hover:bg-slate-800/70 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-xs font-medium">Personal Developer</p>
                  <p className="text-[10px] text-slate-400">CV, Resume & Proyek Pribadi</p>
                </div>
              </div>
              {currentWorkspace === 'PERSONAL' && <Check className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Opsi Bisnis */}
            {currentUser.hasBusinessProfile ? (
              <button
                onClick={() => handleSelectWorkspace('BUSINESS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl text-left text-sm transition-colors ${
                  currentWorkspace === 'BUSINESS'
                    ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/20'
                    : 'hover:bg-slate-800/70 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-medium">Business / Agency</p>
                    <p className="text-[10px] text-slate-400">Layanan, Portofolio & Klien</p>
                  </div>
                </div>
                {currentWorkspace === 'BUSINESS' && <Check className="w-4 h-4 text-blue-400" />}
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowActivateModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-left text-sm bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-blue-300 border border-blue-500/30 transition-all group"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                  <Plus className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-blue-200">Aktifkan Profil Bisnis</p>
                  <p className="text-[10px] text-blue-300/80">Buat profil software house / agency</p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {showActivateModal && (
        <ActivateBusinessModal
          isOpen={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          onSuccess={() => {
            setShowActivateModal(false);
            navigate('/admin/business/dashboard');
            window.location.reload();
          }}
        />
      )}
    </>
  );
};
```

---

## 4. Modal: Aktivasi Profil Bisnis Baru

### `src/components/organisms/ActivateBusinessModal.tsx`
```tsx
import React, { useState } from 'react';
import { X, Briefcase, Building, Mail, Phone, MapPin, Globe, Loader2 } from 'lucide-react';
import { templateApi } from '../../services/templateApi';

interface ActivateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ActivateBusinessModal: React.FC<ActivateBusinessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Nama bisnis wajib diisi');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await templateApi.activateBusinessProfile({
        businessName,
        description,
        contactEmail,
        phoneNumber,
        location,
        website,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mengaktifkan profil bisnis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Aktifkan Profil Bisnis</h2>
            <p className="text-xs text-slate-400">Siapkan portofolio profesional untuk agensi atau studio software Anda.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Bisnis / Studio <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="misal: Azka Digital Labs"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Singkat / Tagline</label>
            <textarea
              placeholder="Spesialis pembuatan web app, mobile app, dan cloud solutions dengan SLA tinggi."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Kontak Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="contact@studio.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp / No Telpon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+62 812..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lokasi / Kota</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Jakarta, Indonesia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website (Opsional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://studio.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Mengaktifkan...' : 'Aktifkan Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## 5. Implementasi Visual Content Blocks di `DynamicPortfolioRenderer.tsx`

Tambahkan case renderer di `DynamicPortfolioRenderer.tsx` untuk 6 tipe block bisnis baru:

```tsx
// Di dalam switch (section.type) di DynamicPortfolioRenderer.tsx:

case 'CLIENTS_LOGO':
  return (
    <ClientsLogoBlock
      key={section.id}
      title={section.title || section.props?.title || 'Trusted by Innovative Companies'}
      logos={section.props?.logos || []}
      theme={theme}
    />
  );

case 'COMPANY_STATS':
  return (
    <CompanyStatsBlock
      key={section.id}
      title={section.title || 'Track Record'}
      stats={section.props?.stats || []}
      theme={theme}
    />
  );

case 'PROCESS_WORKFLOW':
  return (
    <ProcessWorkflowBlock
      key={section.id}
      title={section.title || 'Our Working Process'}
      steps={section.props?.steps || []}
      theme={theme}
    />
  );

case 'TESTIMONIALS':
  return (
    <TestimonialsBlock
      key={section.id}
      title={section.title || 'Client Testimonials'}
      testimonials={section.props?.testimonials || []}
      theme={theme}
    />
  );

case 'FAQ_ACCORDION':
  return (
    <FaqAccordionBlock
      key={section.id}
      title={section.title || 'Frequently Asked Questions'}
      faqs={section.props?.faqs || []}
      theme={theme}
    />
  );

case 'CTA_BANNER':
  return (
    <CtaBannerBlock
      key={section.id}
      title={section.props?.title || 'Ready to Build?'}
      description={section.props?.description}
      primaryButtonText={section.props?.primaryButtonText || 'Get In Touch'}
      primaryButtonUrl={section.props?.primaryButtonUrl || '#contact'}
      theme={theme}
    />
  );
```

### Kode Komponen Block UI:

#### A. `ClientsLogoBlock.tsx`
```tsx
export const ClientsLogoBlock = ({ title, logos, theme }: any) => {
  if (!logos || logos.length === 0) return null;
  return (
    <div className="py-12 border-y border-slate-800/80 bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {title && <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-8">{title}</p>}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 hover:opacity-100 transition-opacity">
          {logos.map((logo: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-slate-300 font-bold text-base tracking-tight">
              {logo.logoUrl ? (
                <img src={logo.logoUrl} alt={logo.name} className="h-7 w-auto object-contain filter grayscale hover:grayscale-0 transition-all" />
              ) : (
                <span className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### B. `CompanyStatsBlock.tsx`
```tsx
export const CompanyStatsBlock = ({ title, stats, theme }: any) => {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="py-16 bg-slate-900/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((item: any, idx: number) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-sm">
              <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {item.value}
              </h3>
              <p className="mt-2 text-xs md:text-sm font-semibold text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### C. `ProcessWorkflowBlock.tsx`
```tsx
export const ProcessWorkflowBlock = ({ title, steps, theme }: any) => {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="py-20 max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-2">Bagaimana kami mengantarkan proyek Anda dari konsep hingga peluncuran.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step: any, idx: number) => (
          <div key={idx} className="relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-blue-500/50 transition-all">
            <span className="text-4xl font-extrabold text-blue-500/30">{step.step}</span>
            <h4 className="text-base font-bold text-white mt-4">{step.title}</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### D. `TestimonialsBlock.tsx`
```tsx
import { Star } from 'lucide-react';

export const TestimonialsBlock = ({ title, testimonials, theme }: any) => {
  if (!testimonials || testimonials.length === 0) return null;
  return (
    <div className="py-20 bg-slate-900/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item: any, idx: number) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-slate-300 italic leading-relaxed">
                  "{item.content}"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={item.clientName} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-sm border border-blue-500/30">
                    {item.clientName?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">{item.clientName}</h4>
                  <p className="text-[11px] text-slate-400">{item.clientRole} {item.clientCompany && `• ${item.clientCompany}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### E. `FaqAccordionBlock.tsx`
```tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqAccordionBlock = ({ title, faqs, theme }: any) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="py-20 max-w-4xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-3">
        {faqs.map((faq: any, idx: number) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="rounded-2xl bg-slate-800/40 border border-slate-700/60 overflow-hidden transition-colors">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm text-white hover:text-blue-400 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-700/40 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

#### F. `CtaBannerBlock.tsx`
```tsx
export const CtaBannerBlock = ({ title, description, primaryButtonText, primaryButtonUrl }: any) => {
  return (
    <div className="py-16 max-w-6xl mx-auto px-6">
      <div className="rounded-3xl p-8 md:p-14 bg-gradient-to-r from-blue-600 to-indigo-700 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
          {description && <p className="mt-4 text-sm md:text-base text-blue-100/90 leading-relaxed">{description}</p>}
          <div className="mt-8">
            <a
              href={primaryButtonUrl || '#contact'}
              className="inline-block px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
            >
              {primaryButtonText || 'Schedule Consultation'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 6. Edit Konten Langsung dari Theme Studio (Modal Editor)

Di halaman `UserThemeStudio.tsx`, setiap kartu section kini memiliki tombol **"Edit Konten"** (ikon pensil / slider). 
Saat diklik:
1. Muncul modal edit sederhana sesuai dengan tipe block (`TESTIMONIALS`, `FAQ_ACCORDION`, `COMPANY_STATS`, `CLIENTS_LOGO`, dll).
2. User bisa menambah baris baru, mengubah teks, atau mengupload gambar via `templateApi.uploadThemeAsset(file)`.
3. Saat user klik **"Simpan Konten"**, panggil:
   ```typescript
   await templateApi.updateBusinessSection(sectionId, {
     props: updatedProps,
   });
   ```
4. Data di Simulator Playground akan langsung ter-update secara instan!

---

## 7. Checklist Verifikasi Frontend

1. [ ] **Workspace Switcher:** Muncul di Navbar/Sidebar dan membedakan user yang sudah punya profil bisnis vs yang belum.
2. [ ] **Aktivasi Profil Bisnis:** User personal bisa membuka modal, mengisi form singkat, dan otomatis dialihkan ke dashboard bisnis tanpa login ulang.
3. [ ] **Render 6 Block Baru:** `CLIENTS_LOGO`, `COMPANY_STATS`, `PROCESS_WORKFLOW`, `TESTIMONIALS`, `FAQ_ACCORDION`, `CTA_BANNER` ter-render mulus di Device Simulator (Desktop, Tablet, Mobile).
4. [ ] **Prop Isolation:** Mengubah testimoni atau FAQ memanggil `PATCH /templates/business/me/sections/:sectionId`, memastikan section lain tidak tertimpa atau hilang.
5. [ ] **Asset Uploader:** Upload logo klien atau avatar testimoni memanggil `POST /templates/upload-asset` dan mengembalikan URL Cloudinary langsung.
