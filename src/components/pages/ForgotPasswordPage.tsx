/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useLogin';
import {
  ShieldAlert, Send, Mail, ArrowLeft, CheckCircle2, KeyRound
} from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { DotGridPattern, FlowRibbonPattern } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] text-[#202744] p-4 relative overflow-hidden font-sans">
      <DotGridPattern dotColor="#8B6CF6" spacing={24} />
      <FlowRibbonPattern position="top-right" intensity="subtle" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#EAE5DD] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
        <div className="h-1.5 bg-gradient-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />

        <div className="p-7 sm:p-9">
          <div className="flex items-center justify-between mb-6">
            <BrandLogo size="md" to="/" showTagline={false} />
            <Link
              id="forgot-pw-showcase-btn"
              to="/"
              className="flex items-center space-x-1 rounded-full px-3 py-1 font-sans text-xs font-semibold text-[#69718A] hover:text-[#202744] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E1DA] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back Home</span>
            </Link>
          </div>

          {submitted ? (
            <div className="mt-4 flex flex-col items-center text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-bold tracking-tight text-[#202744]">
                  Check Your Inbox
                </h2>
                <p className="font-sans text-xs text-[#69718A] leading-relaxed max-w-xs mt-1.5">
                  A password reset link has been dispatched to{' '}
                  <strong className="text-[#202744]">{email.trim()}</strong>. Please check your inbox or spam folder.
                </p>
              </div>

              <div className="pt-4 w-full">
                <Button
                  id="forgot-pw-back-login-btn"
                  variant="primary"
                  fullWidth
                  onClick={() => window.location.href = '/login'}
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h2 className="font-sans text-xl font-extrabold tracking-tight text-[#202744]">
                  Reset Password
                </h2>
              </div>
              <p className="mt-1 font-sans text-xs text-[#69718A]">
                Enter the email address registered with Foliowalaweh to receive a reset link.
              </p>

              {error && (
                <div className="mt-4 flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="font-sans font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                    <input
                      id="forgot-pw-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#E5E1DA] bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    id="forgot-pw-submit-btn"
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={forgotMutation.isPending}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send Reset Link
                  </Button>
                </div>

                <div className="text-center pt-3 border-t border-[#F0EBE3] mt-4">
                  <p className="font-sans text-xs text-[#69718A]">
                    Remembered your password?{' '}
                    <Link
                      id="forgot-pw-login-link"
                      to="/login"
                      className="font-bold text-[#8B6CF6] hover:text-[#7A56F4] hover:underline"
                    >
                      Back to Sign In
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
