/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X, Save, Plus, Trash2, Upload, Loader2, Sparkles,
  HelpCircle, BarChart3, MessageSquare, Layers, Image as ImageIcon
} from 'lucide-react';
import { templateApi } from '../../services/templateApi';
import type { SectionBlock } from '../../types/theme';

interface EditSectionContentModalProps {
  isOpen: boolean;
  section: SectionBlock | null;
  isBusiness: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedSection: SectionBlock) => void;
}

export const EditSectionContentModal: React.FC<EditSectionContentModalProps> = ({
  isOpen,
  section,
  isBusiness,
  onClose,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [props, setProps] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state when section opens
  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setProps(section.props ? JSON.parse(JSON.stringify(section.props)) : {});
      setError(null);
    }
  }, [section]);

  if (!isOpen || !section) return null;

  // ─── UPLOAD HELPER ──────────────────────────────────────────────────────────
  const handleFileUpload = async (
    file: File,
    onUrlReceived: (url: string) => void,
    indexKey?: number
  ) => {
    if (indexKey !== undefined) setUploadingIndex(indexKey);
    try {
      const res = await templateApi.uploadThemeAsset(file);
      onUrlReceived(res.url);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mengupload aset gambar');
    } finally {
      if (indexKey !== undefined) setUploadingIndex(null);
    }
  };

  // ─── SAVE HANDLER ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      title,
      variant: section.variant,
      isVisible: section.isVisible,
      props,
    };

    try {
      if (isBusiness) {
        await templateApi.updateBusinessSection(section.id, payload);
      } else {
        await templateApi.updateUserSection(section.id, payload);
      }

      const updatedSection: SectionBlock = {
        ...section,
        title,
        props,
      };

      onSaveSuccess(updatedSection);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan konfigurasi konten section');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── RENDER SPECIFIC BLOCK EDITORS ──────────────────────────────────────────

  // 1. CLIENTS_LOGO
  const renderClientsLogoEditor = () => {
    const logos = Array.isArray(props.logos) ? props.logos : [];

    const handleAddLogo = () => {
      setProps({
        ...props,
        logos: [...logos, { name: 'Partner Company', logoUrl: '' }],
      });
    };

    const handleRemoveLogo = (idx: number) => {
      setProps({
        ...props,
        logos: logos.filter((_: any, i: number) => i !== idx),
      });
    };

    const handleUpdateLogo = (idx: number, field: string, val: string) => {
      const updated = [...logos];
      updated[idx] = { ...updated[idx], [field]: val };
      setProps({ ...props, logos: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Logo Partner / Klien ({logos.length})</h4>
            <p className="text-[11px] text-slate-400">Tambahkan brand logo atau nama perusahaan yang pernah bekerja sama.</p>
          </div>
          <button
            type="button"
            onClick={handleAddLogo}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Logo</span>
          </button>
        </div>

        {logos.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada logo klien ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {logos.map((logo: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">Logo #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLogo(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Hapus Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Nama Perusahaan / Brand</label>
                    <input
                      type="text"
                      value={logo.name || ''}
                      onChange={(e) => handleUpdateLogo(idx, 'name', e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Logo Image URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={logo.logoUrl || ''}
                        onChange={(e) => handleUpdateLogo(idx, 'logoUrl', e.target.value)}
                        placeholder="https://... atau upload file"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white truncate"
                      />
                      <label className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white cursor-pointer shrink-0 transition" title="Upload File Image">
                        {uploadingIndex === idx ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => handleUpdateLogo(idx, 'logoUrl', url), idx);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {logo.logoUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    <img src={logo.logoUrl} alt={logo.name} className="h-6 w-auto object-contain bg-slate-900 p-1 rounded border border-slate-700" />
                    <span className="text-[10px] text-slate-400">Preview logo berhasil dimuat</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 2. COMPANY_STATS
  const renderCompanyStatsEditor = () => {
    const stats = Array.isArray(props.stats) ? props.stats : [];

    const handleAddStat = () => {
      setProps({
        ...props,
        stats: [...stats, { value: '100+', label: 'Metrik Pencapaian' }],
      });
    };

    const handleRemoveStat = (idx: number) => {
      setProps({
        ...props,
        stats: stats.filter((_: any, i: number) => i !== idx),
      });
    };

    const handleUpdateStat = (idx: number, field: string, val: string) => {
      const updated = [...stats];
      updated[idx] = { ...updated[idx], [field]: val };
      setProps({ ...props, stats: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Statistik & Key Metrics ({stats.length})</h4>
            <p className="text-[11px] text-slate-400">Tampilkan angka pencapaian seperti "50+ Proyek", "99% CSAT", "24/7 SLA".</p>
          </div>
          <button
            type="button"
            onClick={handleAddStat}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Metrik</span>
          </button>
        </div>

        {stats.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada statistik ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {stats.map((stat: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <div className="w-1/3">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Angka / Value</label>
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                    placeholder="misal: 50+ atau 99%"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-blue-400 font-bold"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Label Keterangan</label>
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                    placeholder="misal: Proyek Berhasil Selesai"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStat(idx)}
                  className="p-2 mt-4 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Hapus Metrik"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 3. PROCESS_WORKFLOW
  const renderProcessWorkflowEditor = () => {
    const steps = Array.isArray(props.steps) ? props.steps : [];

    const handleAddStep = () => {
      const stepNum = steps.length + 1 < 10 ? `0${steps.length + 1}` : `${steps.length + 1}`;
      setProps({
        ...props,
        steps: [...steps, { step: stepNum, title: 'Langkah Baru', description: 'Deskripsi singkat mengenai tahap kerja ini.' }],
      });
    };

    const handleRemoveStep = (idx: number) => {
      setProps({
        ...props,
        steps: steps.filter((_: any, i: number) => i !== idx),
      });
    };

    const handleUpdateStep = (idx: number, field: string, val: string) => {
      const updated = [...steps];
      updated[idx] = { ...updated[idx], [field]: val };
      setProps({ ...props, steps: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tahapan Kerja (Workflow Steps) ({steps.length})</h4>
            <p className="text-[11px] text-slate-400">Jelaskan alur kerja dari audit, desain, coding hingga peluncuran sistem.</p>
          </div>
          <button
            type="button"
            onClick={handleAddStep}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Langkah</span>
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada langkah kerja ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {steps.map((step: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={step.step || `0${idx + 1}`}
                      onChange={(e) => handleUpdateStep(idx, 'step', e.target.value)}
                      className="w-12 px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-blue-400 font-bold text-center"
                    />
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                      placeholder="Judul Tahap (e.g. Discovery & UI/UX)"
                      className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Hapus Langkah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={step.description || ''}
                    onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                    placeholder="Deskripsi langkah ini..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 4. TESTIMONIALS
  const renderTestimonialsEditor = () => {
    const testimonials = Array.isArray(props.testimonials) ? props.testimonials : [];

    const handleAddTestimonial = () => {
      setProps({
        ...props,
        testimonials: [
          ...testimonials,
          {
            clientName: 'Nama Klien',
            clientRole: 'CEO / Founder',
            clientCompany: 'Tech Studio',
            rating: 5,
            content: 'Layanan sangat memuaskan dengan kualitas arsitektur tinggi dan selesai tepat waktu.',
          },
        ],
      });
    };

    const handleRemoveTestimonial = (idx: number) => {
      setProps({
        ...props,
        testimonials: testimonials.filter((_: any, i: number) => i !== idx),
      });
    };

    const handleUpdateTestimonial = (idx: number, field: string, val: any) => {
      const updated = [...testimonials];
      updated[idx] = { ...updated[idx], [field]: val };
      setProps({ ...props, testimonials: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Testimoni Klien ({testimonials.length})</h4>
            <p className="text-[11px] text-slate-400">Ulasan, rekomendasi, dan feedback bintang 5 dari partner & klien.</p>
          </div>
          <button
            type="button"
            onClick={handleAddTestimonial}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Testimoni</span>
          </button>
        </div>

        {testimonials.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada ulasan testimoni ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {testimonials.map((t: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">Testimoni #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Rating:</span>
                      <select
                        value={t.rating || 5}
                        onChange={(e) => handleUpdateTestimonial(idx, 'rating', Number(e.target.value))}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} Bintang ★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestimonial(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Hapus Testimoni"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Nama Klien</label>
                    <input
                      type="text"
                      value={t.clientName || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'clientName', e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Jabatan / Role</label>
                    <input
                      type="text"
                      value={t.clientRole || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'clientRole', e.target.value)}
                      placeholder="e.g. CTO"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Perusahaan</label>
                    <input
                      type="text"
                      value={t.clientCompany || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'clientCompany', e.target.value)}
                      placeholder="e.g. Fintech Global"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Isi Ulasan Testimoni</label>
                  <textarea
                    rows={2}
                    value={t.content || ''}
                    onChange={(e) => handleUpdateTestimonial(idx, 'content', e.target.value)}
                    placeholder="Kalimat testimoni dari klien..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Avatar / Foto Klien</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={t.avatarUrl || ''}
                      onChange={(e) => handleUpdateTestimonial(idx, 'avatarUrl', e.target.value)}
                      placeholder="URL Foto atau upload file"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <label className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white cursor-pointer shrink-0 transition" title="Upload Avatar">
                      {uploadingIndex === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => handleUpdateTestimonial(idx, 'avatarUrl', url), idx);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 5. FAQ_ACCORDION
  const renderFaqAccordionEditor = () => {
    const faqs = Array.isArray(props.faqs) ? props.faqs : [];

    const handleAddFaq = () => {
      setProps({
        ...props,
        faqs: [
          ...faqs,
          {
            question: 'Berapa lama estimasi pengerjaan proyek?',
            answer: 'Tergantung pada ruang lingkup, MVP standar rata-rata memakan waktu 2 hingga 4 minggu.',
          },
        ],
      });
    };

    const handleRemoveFaq = (idx: number) => {
      setProps({
        ...props,
        faqs: faqs.filter((_: any, i: number) => i !== idx),
      });
    };

    const handleUpdateFaq = (idx: number, field: string, val: string) => {
      const updated = [...faqs];
      updated[idx] = { ...updated[idx], [field]: val };
      setProps({ ...props, faqs: updated });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tanya Jawab (FAQ Accordion) ({faqs.length})</h4>
            <p className="text-[11px] text-slate-400">Jawab pertanyaan umum mengenai termin pembayaran, garansi, atau metodologi.</p>
          </div>
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pertanyaan</span>
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Belum ada tanya jawab ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">FAQ #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Hapus FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Pertanyaan (Question)</label>
                  <input
                    type="text"
                    value={faq.question || ''}
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                    placeholder="misal: Apakah ada garansi maintenance bug?"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Jawaban (Answer)</label>
                  <textarea
                    rows={2}
                    value={faq.answer || ''}
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                    placeholder="misal: Ya, kami menyediakan masa retensi garansi gratis selama 30 hari pasca launch."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 6. CTA_BANNER
  const renderCtaBannerEditor = () => {
    return (
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Banner Call-To-Action</label>
          <input
            type="text"
            value={props.title || title || ''}
            onChange={(e) => {
              setTitle(e.target.value);
              setProps({ ...props, title: e.target.value });
            }}
            placeholder="e.g. Ready to Build Your Next Product?"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi / Sub-heading</label>
          <textarea
            rows={2}
            value={props.description || ''}
            onChange={(e) => setProps({ ...props, description: e.target.value })}
            placeholder="Jadwalkan konsultasi arsitektur 30 menit bersama lead software architect kami."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 resize-none leading-relaxed focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teks Tombol Aksi</label>
            <input
              type="text"
              value={props.primaryButtonText || ''}
              onChange={(e) => setProps({ ...props, primaryButtonText: e.target.value })}
              placeholder="e.g. Schedule Consultation"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL Target (Link)</label>
            <input
              type="text"
              value={props.primaryButtonUrl || ''}
              onChange={(e) => setProps({ ...props, primaryButtonUrl: e.target.value })}
              placeholder="e.g. #contact atau https://wa.me/..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  // Generic fallback editor
  const renderGenericEditor = () => {
    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Ubah judul tampilan section ini pada layout aktif Anda:
        </p>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Section</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Edit Konten: {section.title || section.type}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] uppercase font-bold">
                  {section.type}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kustomisasi teks dan data khusus untuk section ini tanpa mengubah section lain.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Main Title Field */}
          {section.type !== 'CTA_BANNER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Heading Section</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={section.type}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Type-specific inputs */}
          {section.type === 'CLIENTS_LOGO' && renderClientsLogoEditor()}
          {section.type === 'COMPANY_STATS' && renderCompanyStatsEditor()}
          {section.type === 'PROCESS_WORKFLOW' && renderProcessWorkflowEditor()}
          {section.type === 'TESTIMONIALS' && renderTestimonialsEditor()}
          {section.type === 'FAQ_ACCORDION' && renderFaqAccordionEditor()}
          {section.type === 'CTA_BANNER' && renderCtaBannerEditor()}
          {!['CLIENTS_LOGO', 'COMPANY_STATS', 'PROCESS_WORKFLOW', 'TESTIMONIALS', 'FAQ_ACCORDION', 'CTA_BANNER'].includes(section.type) && renderGenericEditor()}
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Perubahan langsung terlihat di Device Simulator Playground
          </span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Konten'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSectionContentModal;
