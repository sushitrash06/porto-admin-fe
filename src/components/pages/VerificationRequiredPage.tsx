/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useResendVerification } from '../../hooks/useResendVerification';
import { BrandLogo } from '../atoms/BrandLogo';
import { DotGridPattern, FlowRibbonPattern } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

export const VerificationRequiredPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const resendVerification = useResendVerification();
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // If there is no email in state, redirect to login
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = () => {
    if (!email || cooldown > 0 || resendVerification.isPending) return;

    setStatus('idle');
    setMessage('');

    resendVerification.mutate(
      { email },
      {
        onSuccess: (data) => {
          setStatus('success');
          setMessage(data.message || 'Verification email resent successfully. Please check your inbox.');
          setCooldown(60);
        },
        onError: (error) => {
          setStatus('error');
          setMessage(
            error.response?.data?.message ||
              error.message ||
              'Failed to resend verification email. Please try again.'
          );
        },
      }
    );
  };

  if (!email) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] text-[#202744] p-4 relative overflow-hidden font-sans">
      <DotGridPattern dotColor="#8B6CF6" spacing={24} />
      <FlowRibbonPattern position="top-right" intensity="subtle" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#EAE5DD] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
        <div className="h-1.5 bg-gradient-to-r from-[#FFC45B] via-[#8B6CF6] to-[#4697F5]" />

        <div className="p-7 sm:p-9 text-center">
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

          <div className="flex flex-col items-center">
            {/* Icon orb */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF6E3] border border-[#FFE19E] mb-5 text-[#FFC45B]">
              <Mail className="h-8 w-8 text-[#E09A10]" />
            </div>

            <h2 className="font-sans text-xl font-extrabold tracking-tight text-[#202744] mb-2">
              Verification Required
            </h2>

            <p className="font-sans text-xs text-[#69718A] mb-5 leading-relaxed max-w-xs">
              Your account has not been verified yet. Please check your inbox for the activation link we sent.
            </p>

            <div className="w-full rounded-2xl bg-[#FAF8F5] border border-[#E5E1DA] p-3.5 mb-5 text-left">
              <p className="font-sans text-[11px] font-semibold text-[#69718A]">Registered Email:</p>
              <p className="font-mono text-xs font-bold text-[#202744] mt-0.5 break-all">{email}</p>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="w-full flex items-start space-x-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 mb-5 text-left">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="font-sans text-xs font-medium text-emerald-700 leading-relaxed">
                  {message}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="w-full flex items-start space-x-2 rounded-2xl border border-red-200 bg-red-50 p-3 mb-5 text-left">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <p className="font-sans text-xs font-medium text-red-700 leading-relaxed">
                  {message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="w-full space-y-2.5">
              <Button
                variant="primary"
                fullWidth
                onClick={handleResendEmail}
                disabled={resendVerification.isPending || cooldown > 0}
                isLoading={resendVerification.isPending}
                leftIcon={<Send className="h-4 w-4" />}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
              </Button>

              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E5E1DA] bg-white hover:bg-[#FAF8F5] py-2.5 font-sans text-xs font-bold text-[#69718A] hover:text-[#202744] transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
