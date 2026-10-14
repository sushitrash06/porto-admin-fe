/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { useRegister } from '../../hooks/useRegister';
import {
  ShieldAlert, UserPlus, Eye, EyeOff, Lock, Mail,
  CheckCircle2, User as UserIcon, Building2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { DotGridPattern, FlowRibbonPattern } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

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

  // Password strength indicator
  const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: '', color: '', width: '0%' };
    if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (pw.length < 8) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw))
      return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
    return { label: 'Good', color: 'bg-[#4697F5]', width: '75%' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and Password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
            'Registration failed. Please try again.';
          setError(typeof msg === 'string' ? msg : 'Registration failed.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] text-[#202744] p-4 relative overflow-hidden font-sans">
      {/* Decorative Brand Patterns */}
      <DotGridPattern dotColor="#8B6CF6" spacing={24} />
      <FlowRibbonPattern position="top-right" intensity="subtle" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#EAE5DD] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
        {/* Top brand accent ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />

        <div className="p-7 sm:p-9">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <BrandLogo size="md" to="/" showTagline={false} />
            <Link
              id="register-cancel-btn"
              to="/"
              className="flex items-center space-x-1 rounded-full px-3 py-1 font-sans text-xs font-semibold text-[#69718A] hover:text-[#202744] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E1DA] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back Home</span>
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8B6CF6]">
                Step {step} of 3
              </span>
            </div>
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#202744]">
              {step === 1 ? 'Create your account' : step === 2 ? 'Choose account type' : 'Verification required'}
            </h2>
            <p className="mt-1 font-sans text-xs text-[#69718A]">
              {step === 1
                ? 'Join thousands of creators, engineers, and businesses.'
                : step === 2
                ? 'Choose the profile focus that matches your goals.'
                : 'Your account has been created successfully.'}
            </p>
          </div>

          {/* Errors */}
          {error && (
            <div className="mt-4 flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-sans font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={
              step === 1
                ? handleNextStep
                : (e) => {
                    e.preventDefault();
                    handleRegister();
                  }
            }
            className="mt-6 space-y-4"
          >
            {/* Step 3: Success Message */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center py-6 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-1">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-sans text-base font-bold text-[#202744]">
                  Please Check Your Inbox
                </h3>
                <p className="font-sans text-xs text-[#69718A] max-w-[280px] mx-auto leading-relaxed">
                  We've sent a verification link to <strong className="text-[#202744]">{email}</strong>. Please confirm your email address to sign in.
                </p>
                <div className="pt-4 w-full">
                  <Link to="/login" className="w-full block">
                    <Button
                      variant="primary"
                      fullWidth
                    >
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#202744] mb-2">
                    Primary Profile Focus <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* User Role Card */}
                    <button
                      type="button"
                      onClick={() => setRole('USER')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                        role === 'USER'
                          ? 'border-[#8B6CF6] bg-[#E8E0FF]/40 text-[#202744] ring-2 ring-[#8B6CF6]/30 shadow-xs'
                          : 'border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] text-[#69718A]'
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 ${
                          role === 'USER' ? 'bg-[#8B6CF6] text-white' : 'bg-slate-100 text-[#69718A]'
                        }`}
                      >
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <span className="font-sans text-xs font-bold text-[#202744] block">Individual</span>
                      <span className="font-sans text-[10px] text-[#69718A] leading-snug mt-1">
                        Developer, designer & personal projects.
                      </span>
                    </button>

                    {/* Business Role Card */}
                    <button
                      type="button"
                      onClick={() => setRole('BUSINESS')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer select-none ${
                        role === 'BUSINESS'
                          ? 'border-[#4697F5] bg-[#E7F2FF]/50 text-[#202744] ring-2 ring-[#4697F5]/30 shadow-xs'
                          : 'border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] text-[#69718A]'
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 ${
                          role === 'BUSINESS' ? 'bg-[#4697F5] text-white' : 'bg-slate-100 text-[#69718A]'
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="font-sans text-xs font-bold text-[#202744] block">Studio / Business</span>
                      <span className="font-sans text-[10px] text-[#69718A] leading-snug mt-1">
                        Agencies, commercial services & WhatsApp leads.
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 cursor-pointer rounded-xl border border-[#E5E1DA] bg-white py-2.5 font-sans text-xs font-bold text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] transition"
                  >
                    Back
                  </button>
                  <Button
                    id="register-submit-btn"
                    type="submit"
                    variant="primary"
                    className="flex-[2]"
                    isLoading={registerMutation.isPending}
                    leftIcon={<UserPlus className="h-4 w-4" />}
                  >
                    Complete Registration
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Email and Password */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Email */}
                <div>
                  <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#E5E1DA] bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  {/* Password strength bar */}
                  {password.length > 0 && (
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

                {/* Confirm Password */}
                <div>
                  <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:outline-hidden transition-all ${
                        confirmPassword.length > 0 && confirmPassword === password
                          ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : confirmPassword.length > 0 && confirmPassword !== password
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-[#E5E1DA] focus:border-[#8B6CF6] focus:ring-2 focus:ring-[#8B6CF6]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#69718A] hover:text-[#202744] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && confirmPassword === password && (
                    <div className="mt-1 flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <p className="font-sans text-[10px] text-emerald-600 font-semibold">Passwords match</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue to Profile Setup
                  </Button>
                </div>
              </div>
            )}

            {/* Login link */}
            {step !== 3 && (
              <div className="text-center pt-3 border-t border-[#F0EBE3] mt-4">
                <p className="font-sans text-xs text-[#69718A]">
                  Already have an account?{' '}
                  <Link
                    id="register-login-link"
                    to="/login"
                    className="font-bold text-[#8B6CF6] hover:text-[#7A56F4] hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
