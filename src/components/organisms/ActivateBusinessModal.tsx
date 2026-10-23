/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X, Briefcase, Building2, Mail, Phone,
  MapPin, Globe, Loader2, Sparkles, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { templateApi } from '../../services/templateApi';
import { Badge } from '../atoms/Badge';

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
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mengaktifkan profil bisnis. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202744]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-[#EAE5DD] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-[#202744] font-sans animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE5DD] transition-all cursor-pointer"
          title="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] border border-[#D5C6FF] text-[#8B6CF6] flex items-center justify-center shadow-xs shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold tracking-tight text-[#202744]">
                Aktifkan Profil Bisnis
              </h2>
              <Badge variant="blue" dot>
                Commercial Hub
              </Badge>
            </div>
            <p className="text-xs text-[#69718A] leading-relaxed">
              Buka fitur katalog layanan komersial, portofolio proyek bisnis, dan tombol pemesanan langsung ke WhatsApp.
            </p>
          </div>
        </div>

        {/* Highlight Perks Banner */}
        <div className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5 mb-5 space-y-2 shadow-3xs">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A] block">
            KEUNTUNGAN WORKSPACE BISNIS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#202744] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Katalog Layanan & Price Packages</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Inbound Leads Direct ke WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Showcase Studi Kasus Proyek Klien</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Theme Studio Khusus Corporate</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Activation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
              Nama Bisnis / Studio / Agensi <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Briefcase className="absolute left-3.5 h-4 w-4 text-[#69718A] pointer-events-none" />
              <input
                type="text"
                placeholder="misal: Azka Digital Labs / Studio Arsitek"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs"
              />
            </div>
          </div>

          {/* Tagline / Description */}
          <div>
            <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
              Tagline / Deskripsi Singkat
            </label>
            <textarea
              placeholder="Spesialis pembuatan web app, mobile app, atau desain arsitektur dengan pengerjaan terstandar."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-3 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all shadow-3xs resize-none"
            />
          </div>

          {/* Row 1: Email & WhatsApp Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
            </div>

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
            </div>
          </div>

          {/* Row 2: Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-sans text-[11px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                Lokasi / Kota
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
                Website (Opsional)
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
          <div className="pt-4 border-t border-[#F0EBE1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-[#EAE5DD] bg-white text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] text-xs font-bold transition-all shadow-3xs cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengaktifkan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-200" />
                  <span>Aktifkan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivateBusinessModal;
