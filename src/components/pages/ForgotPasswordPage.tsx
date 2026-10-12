/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useLogin';
import {
  ShieldAlert,
  Send,
  Sparkles,
  Mail,
  Compass,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const forgotMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email address is required.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    forgotMutation.mutate(
      { email: trimmed },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: (err) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Failed to send reset link. Please try again.';
          setError(typeof msg === 'string' ? msg : 'An unexpected error occurred.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
      {/* Subtle light background mesh grid for premium aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 z-10">
        {/* Brand Line */}
        <div className="h-1 bg-black"></div>

        {/* Form Container */}
        <div className="px-6 py-6.5">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-800">
              <Sparkles className="h-4 w-4 text-black" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">Account Recovery</span>
            </div>

            <Link
              id="forgot-pw-showcase-btn"
              to="/"
              className="flex items-center space-x-1 rounded-md px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <Compass className="h-3 w-3" />
              <span>Showcase</span>
            </Link>
          </div>

          {/* ── Success State ── */}
          {submitted ? (
            <div className="mt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                  Check Your Inbox
                </h2>
                <p className="font-sans text-xs text-slate-500 leading-relaxed max-w-xs">
                  Link reset password telah dikirim ke <span className="font-semibold text-slate-700">{email.trim()}</span>. 
                  Silakan periksa inbox atau folder spam kamu.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  id="forgot-pw-back-login-btn"
                  to="/login"
                  className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Form State ── */}
              <div className="mt-4 flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-slate-400" />
                <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                  Forgot Password?
                </h2>
              </div>
              <p className="mt-1 font-sans text-xs text-slate-400">
                Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password kamu.
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
                <div>
                  <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="forgot-pw-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="forgot-pw-submit-btn"
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {forgotMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Back to login link */}
                <div className="text-center pt-1">
                  <p className="font-sans text-xs text-slate-400">
                    Ingat password kamu?{' '}
                    <Link
                      id="forgot-pw-login-link"
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
