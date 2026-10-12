/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../hooks/useLogin';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Compass,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const resetMutation = useResetPassword();

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: 'bg-emerald-400', width: '80%' };
    return { label: 'Excellent', color: 'bg-emerald-500', width: '100%' };
  }, [newPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Password baru wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    resetMutation.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Failed to reset password. The link may have expired.';
          setError(typeof msg === 'string' ? msg : 'An unexpected error occurred.');
        },
      }
    );
  };

  // ── No token in URL → invalid link ──
  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

        <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 z-10">
          <div className="h-1 bg-red-500"></div>
          <div className="px-6 py-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                Invalid Reset Link
              </h2>
              <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-xs">
                Link reset password tidak valid atau sudah kedaluwarsa. Silakan request ulang dari halaman Forgot Password.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                id="reset-pw-forgot-link"
                to="/forgot-password"
                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98]"
              >
                <KeyRound className="h-4 w-4" />
                <span>Request New Link</span>
              </Link>
              <Link
                id="reset-pw-login-link-invalid"
                to="/login"
                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md border border-slate-200 bg-white py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-slate-600 shadow-xs hover:bg-slate-50 transition active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
      {/* Subtle light background mesh grid for premium aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 z-10">
        {/* Brand Line */}
        <div className={`h-1 ${success ? 'bg-emerald-500' : 'bg-black'}`}></div>

        {/* Form Container */}
        <div className="px-6 py-6.5">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <Sparkles className="h-4 w-4 text-black" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">Password Reset</span>
            </div>

            <Link
              id="reset-pw-showcase-btn"
              to="/"
              className="flex items-center space-x-1 rounded-md px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <Compass className="h-3 w-3" />
              <span>Showcase</span>
            </Link>
          </div>

          {/* ── Success State ── */}
          {success ? (
            <div className="mt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                  Password Berhasil Direset!
                </h2>
                <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-xs">
                  Password kamu telah berhasil diperbarui. Silakan login dengan password baru kamu.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  id="reset-pw-go-login-btn"
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Go to Login</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── Form State ── */}
              <div className="mt-4 flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-slate-400" />
                <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                  Set New Password
                </h2>
              </div>
              <p className="mt-1 font-sans text-xs text-slate-400">
                Masukkan password baru untuk akun kamu. Pastikan password cukup kuat.
              </p>

              {/* Errors */}
              {error && (
                <div className="mt-4 flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-600">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="font-sans font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* New Password */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-pw-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password Strength Bar */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                      <p className="font-sans text-[10px] text-slate-400">
                        Strength: <span className="font-semibold">{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-pw-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <p className={`mt-1 font-sans text-[10px] ${newPassword === confirmPassword ? 'text-emerald-500' : 'text-red-400'}`}>
                      {newPassword === confirmPassword ? '✓ Password match' : '✗ Password tidak cocok'}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    id="reset-pw-submit-btn"
                    type="submit"
                    disabled={resetMutation.isPending}
                    className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resetMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Reset Password</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Back to login link */}
                <div className="text-center pt-1">
                  <p className="font-sans text-xs text-slate-400">
                    Ingat password kamu?{' '}
                    <Link
                      id="reset-pw-login-link"
                      to="/login"
                      className="font-bold text-slate-700 hover:text-black transition-colors underline underline-offset-2"
                    >
                      Kembali ke Login
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
