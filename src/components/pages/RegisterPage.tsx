/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { useRegister } from '../../hooks/useRegister';
import {
  ShieldAlert, Eye, EyeOff, CheckCircle2, User as UserIcon, Building2, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { AuthShowcaseCard } from '../organisms/AuthShowcaseCard';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [role, setRole] = useState<'USER' | 'BUSINESS'>('USER');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const registerMutation = useRegister();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Password strength indicator
  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: '', color: '', width: '0%' };
    if (pw.length < 6) return { label: 'Terlalu pendek', color: 'bg-red-500', width: '25%' };
    if (pw.length < 8) return { label: 'Cukup', color: 'bg-amber-500', width: '50%' };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw))
      return { label: 'Sangat Kuat', color: 'bg-emerald-500', width: '100%' };
    return { label: 'Bagus', color: 'bg-[#3B6BF5]', width: '75%' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setStep(2);
  };

  const handleRegister = () => {
    setError('');

    registerMutation.mutate(
      { email: email.trim(), password, role },
      {
        onSuccess: () => {
          setStep(3);
        },
        onError: (err) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Pendaftaran gagal. Silakan coba lagi.';
          setError(typeof msg === 'string' ? msg : 'Pendaftaran gagal.');
        },
      }
    );
  };


  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#202744] font-sans flex flex-col justify-between selection:bg-[#3B6BF5] selection:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Form Area */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-lg mx-auto lg:max-w-none flex flex-col justify-between py-2">
            <div>
              {/* Header: Logo and Back Home Link */}
              <div className="flex items-center justify-between mb-8">
                <BrandLogo size="md" to="/" showTagline={false} monochromeWordmark={true} />
                <Link
                  id="register-back-home"
                  to="/"
                  className="text-xs font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>← Beranda</span>
                </Link>
              </div>

              {/* Title Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#3B6BF5]">
                    {step === 3 ? 'PENDAFTARAN BERHASIL' : 'MULAI SEKARANG'}
                  </span>
                  {step < 3 && (
                    <span className="text-[10px] font-bold text-[#69718A] bg-[#EFEAE2] px-2 py-0.5 rounded-full">
                      Langkah {step} dari 2
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#202744] tracking-tight mb-2">
                  {step === 3
                    ? 'Verifikasi email kamu.'
                    : step === 2
                    ? 'Pilih tipe profil kamu.'
                    : 'Mulai ceritamu.'}
                </h1>
                <p className="text-xs sm:text-sm text-[#69718A]">
                  {step === 3
                    ? 'Akunmu sudah dibuat. Silakan periksa kotak masuk untuk konfirmasi.'
                    : step === 2
                    ? 'Tentukan tujuan utama portofoliomu agar kami bisa menyiapkan template terbaik.'
                    : 'Daftar gratis untuk mulai memamerkan karya dan portofoliomu.'}
                </p>
              </div>

              {/* Tab Switcher: Masuk / Daftar (shown on steps 1 and 2) */}
              {step < 3 && (
                <div className="bg-[#EFEAE2] p-1 rounded-2xl flex items-center mb-6">
                  <Link
                    to="/login"
                    className="flex-1 py-2 text-center text-xs sm:text-sm font-semibold text-[#69718A] hover:text-[#202744] rounded-xl transition-colors cursor-pointer"
                  >
                    Masuk
                  </Link>
                  <span className="flex-1 py-2 text-center text-xs sm:text-sm font-bold text-[#3B6BF5] bg-white rounded-xl shadow-3xs cursor-default">
                    Daftar
                  </span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-4 flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && (
                <div className="rounded-3xl border border-[#EAE5DD] bg-white p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#202744]">
                    Periksa Kotak Masuk Kamu
                  </h3>
                  <p className="text-xs sm:text-sm text-[#69718A] max-w-sm mx-auto leading-relaxed">
                    Kami telah mengirimkan tautan verifikasi ke <strong className="text-[#202744]">{email}</strong>. Silakan klik tautan di email tersebut untuk mengaktifkan akunmu.
                  </p>
                  <div className="pt-4">
                    <Link
                      to="/login"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#3B6BF5] hover:bg-[#2F56D2] py-3.5 text-sm font-semibold text-white transition shadow-sm cursor-pointer"
                    >
                      <span>Masuk ke Akun</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: Role Selection */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-[#202744] mb-3">
                      Fokus Utama Profil <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Personal / Individual */}
                      <button
                        type="button"
                        onClick={() => setRole('USER')}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                          role === 'USER'
                            ? 'border-[#3B6BF5] bg-[#E7F2FF]/60 text-[#202744] ring-2 ring-[#3B6BF5]/30 shadow-xs'
                            : 'border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] text-[#69718A]'
                        }`}
                      >
                        <div
                          className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                            role === 'USER' ? 'bg-[#3B6BF5] text-white' : 'bg-slate-100 text-[#69718A]'
                          }`}
                        >
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#202744] block">
                          Individu / Kreator
                        </span>
                        <span className="text-[11px] text-[#69718A] leading-snug mt-1">
                          Desainer, developer, penulis & portofolio karya pribadi.
                        </span>
                      </button>

                      {/* Business / Studio */}
                      <button
                        type="button"
                        onClick={() => setRole('BUSINESS')}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                          role === 'BUSINESS'
                            ? 'border-[#3B6BF5] bg-[#E7F2FF]/60 text-[#202744] ring-2 ring-[#3B6BF5]/30 shadow-xs'
                            : 'border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] text-[#69718A]'
                        }`}
                      >
                        <div
                          className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                            role === 'BUSINESS' ? 'bg-[#3B6BF5] text-white' : 'bg-slate-100 text-[#69718A]'
                          }`}
                        >
                          <Building2 className="h-5 w-5" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#202744] block">
                          Studio / Bisnis
                        </span>
                        <span className="text-[11px] text-[#69718A] leading-snug mt-1">
                          Agensi, jasa kreatif komersial & prospek klien.
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 rounded-full border border-[#E5E1DA] bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-[#69718A] hover:text-[#202744] transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Kembali</span>
                    </button>
                    <button
                      id="register-submit-btn"
                      type="button"
                      onClick={handleRegister}
                      disabled={registerMutation.isPending}
                      className="flex-[2] py-3.5 rounded-full bg-[#3B6BF5] hover:bg-[#2F56D2] text-xs sm:text-sm font-bold text-white transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{registerMutation.isPending ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Input Credentials */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#202744] mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="register-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="naya@contoh.id"
                        className="w-full rounded-2xl border border-[#E5E1DA] bg-white py-3 pr-10 pl-4 text-xs sm:text-sm text-[#202744] placeholder-[#A0A6B8] focus:border-[#3B6BF5] focus:outline-hidden focus:ring-2 focus:ring-[#3B6BF5]/20 transition-all shadow-3xs"
                      />
                      {isEmailValid && (
                        <CheckCircle2 className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#202744] mb-1.5">
                      Kata sandi
                    </label>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full rounded-2xl border border-[#E5E1DA] bg-white py-3 pr-10 pl-4 text-xs sm:text-sm text-[#202744] placeholder-[#A0A6B8] focus:border-[#3B6BF5] focus:outline-hidden focus:ring-2 focus:ring-[#3B6BF5]/20 transition-all shadow-3xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#69718A] hover:text-[#202744] cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <div className="mt-1.5">
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: passwordStrength.width }}
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-[#69718A]">
                          Kekuatan kata sandi:{' '}
                          <span className="font-bold text-[#202744]">{passwordStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#202744] mb-1.5">
                      Konfirmasi kata sandi
                    </label>
                    <div className="relative">
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi"
                        className={`w-full rounded-2xl border bg-white py-3 pr-10 pl-4 text-xs sm:text-sm text-[#202744] placeholder-[#A0A6B8] focus:outline-hidden transition-all shadow-3xs ${
                          confirmPassword.length > 0 && confirmPassword === password
                            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : confirmPassword.length > 0 && confirmPassword !== password
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-[#E5E1DA] focus:border-[#3B6BF5] focus:ring-2 focus:ring-[#3B6BF5]/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#69718A] hover:text-[#202744] cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && confirmPassword === password && (
                      <div className="mt-1 flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <p className="text-[10px] text-emerald-600 font-semibold">Kata sandi cocok</p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#3B6BF5] hover:bg-[#2F56D2] py-3.5 text-sm sm:text-base font-semibold text-white transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                    >
                      <span>Lanjutkan ke Pilihan Akun</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Login Link below */}
              {step !== 3 && (
                <div className="text-center pt-4">
                  <p className="text-xs text-[#69718A]">
                    Sudah punya akun?{' '}
                    <Link
                      id="register-login-link"
                      to="/login"
                      className="font-bold text-[#3B6BF5] hover:underline"
                    >
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Left Column Footer */}
            <div className="pt-10 flex items-center justify-between text-xs text-[#69718A]">
              <span>© {new Date().getFullYear()} foliowalaweh</span>
              <div className="flex items-center space-x-3 text-xs">
                <span className="hover:text-[#202744] cursor-pointer transition-colors">Butuh bantuan?</span>
                <span>·</span>
                <span className="hover:text-[#202744] cursor-pointer transition-colors">Privasi</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lavender Feature Showcase Card */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-full">
            <AuthShowcaseCard
              eyebrow="RUANG UNTUK KARYAMU"
              title={
                <>
                  Karyamu punya<br />
                  cerita. Mulai, yuk.
                </>
              }
              subtitle="Buat portofolio, pamerkan karya terbaikmu, dan raih kesempatan impianmu."
            />
          </div>

        </div>
      </div>
    </div>
  );
};
