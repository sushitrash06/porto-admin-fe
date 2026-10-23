/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import {
  Building2, Briefcase, Mail, Phone, MapPin,
  Globe, Sparkles, CheckCircle2, ArrowLeft,
  Loader2, AlertCircle, MessageCircle, ShieldCheck
} from 'lucide-react';
import { templateApi } from '../../services/templateApi';
import { Badge } from '../atoms/Badge';

interface ActivateBusinessPageProps {
  currentUser: User;
}

export const ActivateBusinessPage: React.FC<ActivateBusinessPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  // If user already has a business profile, redirect to business dashboard
  React.useEffect(() => {
    if (currentUser?.businessProfile || localStorage.getItem('has_business_profile') === 'true') {
      navigate('/admin/business/dashboard');
    }
  }, [currentUser, navigate]);

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Nama bisnis atau nama agensi wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await templateApi.activateBusinessProfile({
        businessName: businessName.trim(),
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
      });

      localStorage.setItem('has_business_profile', 'true');
      // Redirect to newly activated business dashboard
      navigate('/admin/business/dashboard');
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mengaktifkan profil bisnis. Silakan coba kembali.');
      setLoading(false);
    }
  };

  const previewName = businessName.trim() || 'Nama Agensi / Studio Anda';
  const previewDesc = description.trim() || 'Jelaskan bidang spesialisasi, layanan unggulan, atau value proposition bisnis Anda di sini.';
  const previewLocation = location.trim() || 'Jakarta, Indonesia';

  return (
    <div className="space-y-8 text-[#202744] font-sans admin-page-enter">
      {/* ─── Breadcrumb & Back Action ─── */}
      <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Personal Dashboard</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#69718A]">
          <span>WORKSPACE</span>
          <span>/</span>
          <span className="font-bold text-[#8B6CF6]">CREATE BUSINESS PROFILE</span>
        </div>
      </div>

      {/* ─── Page Hero Banner ─── */}
      <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-8 shadow-3xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8E0FF] border border-[#D5C6FF] text-[#8B6CF6] flex items-center justify-center shadow-3xs">
                <Building2 className="w-5 h-5" />
              </div>
              <Badge variant="blue" dot>
                Commercial Workspace
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202744]">
              Buat Profil Bisnis & Studio Anda
            </h1>

            <p className="text-xs sm:text-sm text-[#69718A] leading-relaxed">
              Tingkatkan portofolio Anda ke level profesional komersial. Siapkan katalog paket layanan,
              estimasi harga, showcase proyek klien, dan terima prospek kerjaan langsung ke WhatsApp bisnis Anda.
            </p>
          </div>

          <div className="hidden lg:flex flex-col gap-2 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DD] text-xs text-[#202744] shrink-0 w-72 shadow-3xs">
            <div className="flex items-center gap-2 font-bold text-xs text-[#8B6CF6]">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Workspace Ready</span>
            </div>
            <p className="text-[11px] text-[#69718A] leading-relaxed">
              Anda tetap dapat beralih antara portofolio personal dan portofolio bisnis kapan saja secara instan.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Two-Column Section: Form vs Live Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Setup Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-8 shadow-3xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-[#202744]">
              Informasi Identitas & Kontak Bisnis
            </h2>
            <p className="text-xs text-[#69718A] mt-0.5">
              Isi data awal agensi Anda. Data ini dapat disunting kapan saja melalui halaman pengaturan bisnis.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Business Name */}
            <div>
              <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                Nama Bisnis / Studio / Agensi <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Briefcase className="absolute left-3.5 h-4 w-4 text-[#69718A] pointer-events-none" />
                <input
                  type="text"
                  placeholder="misal: Azka Digital Labs, Studio Dua Arah, dsb."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs"
                />
              </div>
            </div>

            {/* 2. Tagline / Description */}
            <div>
              <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                Tagline & Deskripsi Singkat
              </label>
              <textarea
                placeholder="Spesialis pembuatan web app, SaaS platform, atau perancangan arsitektur interior berkualitas tinggi."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-3 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs resize-none"
              />
            </div>

            {/* 3. Row: WhatsApp Phone & Contact Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Bisnis
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 h-4 w-4 text-[#69718A] pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="misal: 6281234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs"
                  />
                </div>
                <p className="text-[10px] text-[#69718A] mt-1">
                  Format angka internasional tanpa tanda + (contoh: 62812...)
                </p>
              </div>

              <div>
                <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                  Email Kontak Bisnis
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-[#69718A] pointer-events-none" />
                  <input
                    type="email"
                    placeholder="contact@studio.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs"
                  />
                </div>
                <p className="text-[10px] text-[#69718A] mt-1">
                  Email utama untuk korespondensi resmi dengan calon klien.
                </p>
              </div>
            </div>

            {/* 4. Row: Location & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                  Lokasi / Kota Operasional
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 h-4 w-4 text-[#69718A] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Jakarta, Indonesia"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                  Website Resmi (Opsional)
                </label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3.5 h-4 w-4 text-[#69718A] pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://studio.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs"
                  />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-6 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-[#EAE5DD] bg-white text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] text-xs font-bold transition-all shadow-3xs cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengaktifkan Workspace Bisnis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-violet-200" />
                    <span>Aktifkan Profil Bisnis Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Card Preview & Perks (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Interactive Live Preview Card */}
          <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 shadow-3xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#69718A]">
                LIVE BRAND PREVIEW
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Simulasi</span>
              </span>
            </div>

            {/* Mockup Card */}
            <div className="rounded-2xl border border-[#BFDEFF] bg-[#E7F2FF]/40 p-5 space-y-3.5 shadow-3xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F2FF] border border-[#BFDEFF] text-[#1E6FD6] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-3xs">
                  {previewName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-[#202744] truncate">
                    {previewName}
                  </h3>
                  <p className="text-[11px] text-[#69718A] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#4697F5]" />
                    <span className="truncate">{previewLocation}</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#202744]/80 leading-relaxed line-clamp-2">
                {previewDesc}
              </p>

              <div className="pt-2 border-t border-[#BFDEFF]/60 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Ready</span>
                </div>

                <span className="text-[10px] font-mono text-[#69718A]">
                  Foliowalaweh Business
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Features Included */}
          <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 shadow-3xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#202744] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B6CF6]" />
              <span>Fasilitas Termasuk dalam Profil Bisnis</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DD]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#202744]">Katalog Layanan & Harga</h4>
                  <p className="text-[11px] text-[#69718A] mt-0.5">
                    Publikasikan daftar paket kerjaan dengan harga awal yang jelas untuk calon klien.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DD]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#202744]">Inbound Leads Direct WhatsApp</h4>
                  <p className="text-[11px] text-[#69718A] mt-0.5">
                    Pengunjung dapat mengirim inquiry otomatis dengan tombol WhatsApp 1-klik.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DD]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#202744]">Showcase Studi Kasus Klien</h4>
                  <p className="text-[11px] text-[#69718A] mt-0.5">
                    Pisahkan riwayat proyek komersial dan agensi dari portofolio personal Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DD]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#202744]">Corporate Studio Theme</h4>
                  <p className="text-[11px] text-[#69718A] mt-0.5">
                    Pilihan tata letak dan tema khusus bisnis untuk visual yang mewah dan terpercaya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateBusinessPage;
