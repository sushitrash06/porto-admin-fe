/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../hooks/useLogin';
import {
  ShieldAlert, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft,
  CheckCircle2, KeyRound, AlertTriangle
} from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { DotGridPattern, FlowRibbonPattern } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

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
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-[#4697F5]', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%' };
    return { label: 'Excellent', color: 'bg-emerald-600', width: '100%' };
  }, [newPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] text-[#202744] p-4 relative overflow-hidden font-sans">
        <DotGridPattern dotColor="#8B6CF6" spacing={24} />
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#EAE5DD] bg-white shadow-xl p-8 text-center z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="font-sans text-xl font-bold text-[#202744] mb-2">Invalid Reset Link</h2>
          <p className="font-sans text-xs text-[#69718A] mb-6 leading-relaxed">
            This password recovery link is missing its security token or has expired. Please request a new one.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/forgot-password')}
          >
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

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
              to="/login"
              className="flex items-center space-x-1 rounded-full px-3 py-1 font-sans text-xs font-semibold text-[#69718A] hover:text-[#202744] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E1DA] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Sign In</span>
            </Link>
          </div>

          {success ? (
            <div className="mt-4 flex flex-col items-center text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-bold tracking-tight text-[#202744]">
                  Password Successfully Reset
                </h2>
                <p className="font-sans text-xs text-[#69718A] leading-relaxed max-w-xs mt-1.5">
                  Your credentials have been securely updated. You can now log into your account.
                </p>
              </div>

              <div className="pt-4 w-full">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Proceed to Sign In
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
                  Set New Password
                </h2>
              </div>
              <p className="mt-1 font-sans text-xs text-[#69718A]">
                Create a strong password to secure your portfolio and services.
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
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-[#E5E1DA] bg-white py-2.5 pr-10 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#69718A] hover:text-[#202744] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-1.5">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                      <p className="mt-1 font-sans text-[10px] text-[#69718A]">
                        Password strength:{' '}
                        <span className="font-bold text-[#202744]">{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:outline-hidden transition-all ${
                        confirmPassword.length > 0 && confirmPassword === newPassword
                          ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : confirmPassword.length > 0 && confirmPassword !== newPassword
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-[#E5E1DA] focus:border-[#8B6CF6] focus:ring-2 focus:ring-[#8B6CF6]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#69718A] hover:text-[#202744] cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    id="reset-submit-btn"
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={resetMutation.isPending}
                    leftIcon={<ShieldCheck className="h-4 w-4" />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
