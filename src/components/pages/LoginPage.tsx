/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { useLogin } from '../../hooks/useLogin';
import { ShieldAlert, Eye, EyeOff, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { AuthShowcaseCard } from '../organisms/AuthShowcaseCard';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const loginMutation = useLogin();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (payload) => {
          const user: User = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            businessProfile: payload.hasBusinessProfile ? ({} as never) : null,
            createdAt: '',
            updatedAt: '',
          };
          onLoginSuccess(user);
          // Redirect based on role permissions
          if (payload.role === Role.ADMIN) {
            navigate('/admin/dashboard');
          } else if (payload.hasBusinessProfile) {
            navigate('/admin/business/dashboard');
          } else {
            navigate('/admin/experiences');
          }
        },
        onError: (err) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Autentikasi gagal. Periksa kembali email dan kata sandi kamu.';

          if (msg === 'Please verify your email address first.') {
            navigate('/verify-required', { state: { email: email.trim() } });
            return;
          }

          setError(typeof msg === 'string' ? msg : 'Autentikasi gagal.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#202744] font-sans flex flex-col justify-between selection:bg-[#3B6BF5] selection:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Auth Form */}
          <div className="lg:col-span-6 xl:col-span-6 w-full max-w-lg mx-auto lg:max-w-none flex flex-col justify-between py-2">
            <div>
              {/* Header: Logo and Back Home Link */}
              <div className="flex items-center justify-between mb-8">
                <BrandLogo size="md" to="/" showTagline={false} monochromeWordmark={true} />
                <Link
                  id="login-back-home"
                  to="/"
                  className="text-xs font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>← Beranda</span>
                </Link>
              </div>

              {/* Title Header */}
              <div className="mb-6">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#3B6BF5] mb-2">
                  SELAMAT DATANG LAGI
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#202744] tracking-tight mb-2">
                  Lanjutkan ceritamu.
                </h1>
                <p className="text-xs sm:text-sm text-[#69718A]">
                  Masuk untuk mengelola karya dan portofoliomu.
                </p>
              </div>

              {/* Tab Switcher: Masuk / Daftar */}
              <div className="bg-[#EFEAE2] p-1 rounded-2xl flex items-center mb-6">
                <span className="flex-1 py-2 text-center text-xs sm:text-sm font-bold text-[#3B6BF5] bg-white rounded-xl shadow-3xs cursor-default">
                  Masuk
                </span>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center text-xs sm:text-sm font-semibold text-[#69718A] hover:text-[#202744] rounded-xl transition-colors cursor-pointer"
                >
                  Daftar
                </Link>
              </div>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EAE5DD]" />
                </div>
                <span className="relative bg-[#FAF8F5] px-4 text-[11px] font-medium text-[#69718A]">
                  atau pakai email
                </span>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#202744] mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
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
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
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
                </div>

                {/* Options: Remember me & Forgot password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-[#202744] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded-md border-[#E5E1DA] text-[#3B6BF5] focus:ring-[#3B6BF5] cursor-pointer accent-[#3B6BF5]"
                    />
                    <span className="font-medium">Ingat saya</span>
                  </label>
                  <Link
                    id="login-forgot-pw-link"
                    to="/forgot-password"
                    className="font-semibold text-[#3B6BF5] hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#3B6BF5] hover:bg-[#2F56D2] py-3.5 text-sm sm:text-base font-semibold text-white transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loginMutation.isPending ? 'Memproses...' : 'Masuk'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Register Link */}
                <div className="text-center pt-3">
                  <p className="text-xs text-[#69718A]">
                    Belum punya akun?{' '}
                    <Link
                      id="login-register-link"
                      to="/register"
                      className="font-bold text-[#3B6BF5] hover:underline"
                    >
                      Daftar di sini
                    </Link>
                  </p>
                </div>
              </form>
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
            <AuthShowcaseCard />
          </div>

        </div>
      </div>
    </div>
  );
};
