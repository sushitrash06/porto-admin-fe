/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { useLogin } from '../../hooks/useLogin';
import { ShieldAlert, LogIn, Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { DotGridPattern, FlowRibbonPattern } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and Password are required.');
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
            'Authentication failed. Please check your credentials.';

          if (msg === 'Please verify your email address first.') {
            navigate('/verify-required', { state: { email: email.trim() } });
            return;
          }

          setError(typeof msg === 'string' ? msg : 'Authentication failed.');
        },
      }
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] text-[#202744] p-4 relative overflow-hidden font-sans">
      {/* Decorative patterns */}
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
              id="login-cancel-btn"
              to="/"
              className="flex items-center space-x-1 rounded-full px-3 py-1 font-sans text-xs font-semibold text-[#69718A] hover:text-[#202744] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E1DA] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back Home</span>
            </Link>
          </div>

          <div>
            <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#202744]">
              Welcome back
            </h2>
            <p className="mt-1 font-sans text-xs text-[#69718A]">
              Sign in to manage your portfolio, case studies, or business services.
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
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#E5E1DA] bg-white py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-sans text-xs font-bold text-[#202744]">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  id="login-forgot-pw-link"
                  to="/forgot-password"
                  className="font-sans text-xs font-medium text-[#8B6CF6] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <div className="pt-2">
              <Button
                id="login-submit-btn"
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loginMutation.isPending}
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </div>

            {/* Register link */}
            <div className="text-center pt-3 border-t border-[#F0EBE3] mt-4">
              <p className="font-sans text-xs text-[#69718A]">
                Don't have an account yet?{' '}
                <Link
                  id="login-register-link"
                  to="/register"
                  className="font-bold text-[#8B6CF6] hover:text-[#7A56F4] hover:underline"
                >
                  Create your portfolio free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
