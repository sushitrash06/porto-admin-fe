/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  User,
  Palette,
  FolderGit2,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Copy,
  Rocket
} from 'lucide-react';
import type { User as UserType, Profile } from '../../types';

interface UserOnboardingGuideProps {
  currentUser: UserType;
  profile?: Profile | null;
  projectsCount: number;
  experiencesCount: number;
}

export const UserOnboardingGuide: React.FC<UserOnboardingGuideProps> = ({
  currentUser,
  profile,
  projectsCount,
  experiencesCount,
}) => {
  const navigate = useNavigate();

  // Storage keys for preferences
  const WELCOME_MODAL_DISMISSED_KEY = `folio_welcome_modal_dismissed_${currentUser.id}`;
  const GUIDE_COLLAPSED_KEY = `folio_onboarding_guide_collapsed_${currentUser.id}`;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(GUIDE_COLLAPSED_KEY) === 'true';
  });
  const [copied, setCopied] = useState(false);

  // ─── Calculate Steps Completion ─────────────────────────────────────────────
  const step1Complete = Boolean(profile?.fullName && profile.fullName.trim().length > 0);
  const step2Complete = Boolean(profile?.templateId);
  const step3Complete = projectsCount > 0 || experiencesCount > 0;
  const step4Complete = Boolean(profile?.isPublic && step1Complete);

  const steps = [
    {
      id: 1,
      title: 'Biodata & Foto Profil',
      subtitle: 'Nama, headline jabatan, bio singkat & foto.',
      isCompleted: step1Complete,
      buttonText: step1Complete ? 'Edit Profil' : 'Lengkapi Profil',
      link: '/admin/profile',
      icon: User,
      accentColor: '#8B6CF6',
    },
    {
      id: 2,
      title: 'Pilih Tema & Tampilan',
      subtitle: 'Pilih layout HTML & atur palet warna favoritmu.',
      isCompleted: step2Complete,
      buttonText: step2Complete ? 'Ganti Desain' : 'Pilih Template',
      link: '/admin/theme-studio',
      icon: Palette,
      accentColor: '#4697F5',
    },
    {
      id: 3,
      title: 'Pamerkan Proyek / Karya',
      subtitle: 'Unggah showcase karya terbaik, tech stack, & demo.',
      isCompleted: step3Complete,
      buttonText: step3Complete ? 'Kelola Proyek' : 'Tambah Proyek',
      link: '/admin/projects',
      icon: FolderGit2,
      accentColor: '#FFC45B',
    },
    {
      id: 4,
      title: 'Publikasi & Bagikan Link',
      subtitle: 'Dapatkan link portofolio dan bagikan ke klien / CV.',
      isCompleted: step4Complete,
      buttonText: 'Lihat & Salin Link',
      link: `/portfolio/${currentUser.id}`,
      icon: Globe,
      accentColor: '#10b981',
      isPublicLink: true,
    },
  ];

  const completedSteps = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);
  const isAllComplete = completedSteps === steps.length;

  // ─── Welcome Modal Trigger on First Login ──────────────────────────────────
  useEffect(() => {
    // If user has not completed step 1 (has no name) and never dismissed the welcome modal
    const hasDismissed = localStorage.getItem(WELCOME_MODAL_DISMISSED_KEY);
    if (!step1Complete && !hasDismissed) {
      setIsModalOpen(true);
    }
  }, [step1Complete, WELCOME_MODAL_DISMISSED_KEY]);

  const handleDismissModal = () => {
    localStorage.setItem(WELCOME_MODAL_DISMISSED_KEY, 'true');
    setIsModalOpen(false);
  };

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem(GUIDE_COLLAPSED_KEY, String(nextState));
  };

  const handleCopyLink = async () => {
    try {
      const fullUrl = `${window.location.origin}/portfolio/${currentUser.id}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <>
      {/* ─── 1. INTERACTIVE DASHBOARD ONBOARDING GUIDE ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white p-5 sm:p-6 shadow-3xs transition-all">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EBE3]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B6CF6] border border-violet-100 text-[11px] font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Panduan Memulai</span>
              </span>
              {isAllComplete && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Siap Dibagikan!</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#202744]">
              {isAllComplete
                ? 'Portofolio Profesionalmu Sudah Aktif! 🎉'
                : 'Langkah Menyiapkan Portofolio Kamu'}
            </h2>
            <p className="text-xs text-[#69718A]">
              {isAllComplete
                ? 'Semua langkah persiapan dasar telah selesai. Kamu bisa terus memperbarui karya kapan saja.'
                : 'Ikuti 4 langkah mudah di bawah ini agar portofoliomu siap diluncurkan dan dibagikan.'}
            </p>
          </div>

          {/* Progress Widget & Collapse Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-bold text-[#202744]">
                {completedSteps} dari {steps.length} Selesai
              </span>
              <span className="text-xs font-semibold text-[#8B6CF6] ml-1.5">
                ({progressPercent}%)
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg border border-[#EAE5DD] text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
              title={isCollapsed ? 'Buka panduan' : 'Ciutkan panduan'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden my-4 border border-[#EAE5DD]/60">
          <div
            className="h-full bg-gradient-to-r from-[#8B6CF6] via-[#7A56F4] to-[#4697F5] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Cards Grid (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                    step.isCompleted
                      ? 'bg-[#FAF8F5]/60 border-[#EAE5DD] hover:border-[#8B6CF6]/40'
                      : 'bg-white border-[#EAE5DD] hover:border-[#8B6CF6] shadow-3xs hover:shadow-xs ring-1 ring-violet-500/5'
                  }`}
                >
                  <div>
                    {/* Top Step Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-3xs"
                        style={{ backgroundColor: step.accentColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {step.isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#69718A] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">
                          <Circle className="w-2.5 h-2.5" />
                          <span>Langkah {step.id}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans text-xs font-bold text-[#202744] mb-1 leading-snug">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[11px] text-[#69718A] leading-relaxed mb-4">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div>
                    {step.isPublicLink ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => window.open(step.link, '_blank')}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EBE3] text-[#202744] border border-[#EAE5DD] text-xs font-bold transition cursor-pointer"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3 text-[#69718A]" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-[#8B6CF6] hover:bg-[#7A56F4] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          title="Salin Link Portofolio"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(step.link)}
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          step.isCompleted
                            ? 'bg-[#FAF8F5] hover:bg-[#F0EBE3] text-[#69718A] hover:text-[#202744] border border-[#EAE5DD]'
                            : 'bg-[#8B6CF6] hover:bg-[#7A56F4] text-white shadow-xs active:scale-[0.98]'
                        }`}
                      >
                        <span>{step.buttonText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 2. WELCOME MODAL POPUP FOR FIRST TIME USERS ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#EAE5DD] p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismissModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#8B6CF6] to-[#4697F5] flex items-center justify-center text-white shadow-md">
                <Rocket className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#202744]">
                Selamat Datang di Foliowalaweh! 👋
              </h2>
              <p className="text-xs sm:text-sm text-[#69718A] max-w-md mx-auto leading-relaxed">
                Akunmu sudah aktif! Yuk siapkan portofolio profesionalmu dalam 4 langkah cepat agar siap dibagikan ke klien atau perekrut.
              </p>
            </div>

            {/* Quick Steps Overview */}
            <div className="space-y-2.5 bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DD]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-[#8B6CF6] text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p className="text-xs font-semibold text-[#202744]">
                  Isi Nama, Headline, & Foto Profil terbaikmu
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#4697F5] text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p className="text-xs font-semibold text-[#202744]">
                  Pilih desain template portofolio & palet warna
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-[#FFC45B] text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <p className="text-xs font-semibold text-[#202744]">
                  Tambahkan showcase proyek / pengalaman kerja
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <p className="text-xs font-semibold text-[#202744]">
                  Bagikan link portofoliomu ke LinkedIn atau CV!
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleDismissModal();
                  navigate('/admin/profile');
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#8B6CF6] hover:bg-[#7A56F4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <span>Mulai Sekarang (Langkah 1)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDismissModal}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Lewati & Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
