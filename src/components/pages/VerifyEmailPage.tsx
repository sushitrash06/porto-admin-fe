/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyEmail } from '../../hooks/useVerifyEmail';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '../atoms/BrandLogo';
import { DotGridPattern, FlowRibbonPattern } from '../atoms/BrandPatterns';
import { Button } from '../atoms/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { data, isLoading, isError, error } = useVerifyEmail(token);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] text-[#202744] p-4 relative overflow-hidden font-sans">
      <DotGridPattern dotColor="#8B6CF6" spacing={24} />
      <FlowRibbonPattern position="top-right" intensity="subtle" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#EAE5DD] bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
        <div className="h-1.5 bg-gradient-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />

        <div className="p-7 sm:p-9 text-center">
          <div className="flex items-center justify-between mb-6">
            <BrandLogo size="md" to="/" showTagline={false} />
            <Link
              to="/"
              className="flex items-center space-x-1 rounded-full px-3 py-1 font-sans text-xs font-semibold text-[#69718A] hover:text-[#202744] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5E1DA] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back Home</span>
            </Link>
          </div>

          {!token ? (
            <div className="flex flex-col items-center py-4">
              <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600">
                <XCircle className="h-7 w-7" />
              </div>
              <h2 className="font-sans text-xl font-bold tracking-tight text-[#202744] mb-2">
                Token Not Found
              </h2>
              <p className="font-sans text-xs text-[#69718A] mb-6 leading-relaxed">
                The email verification link is invalid or incomplete. Please check that you copied the complete link from your email.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.location.href = '/login'}
              >
                Return to Sign In
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-9 w-9 text-[#8B6CF6] animate-spin mb-4" />
              <h2 className="font-sans text-xl font-bold tracking-tight text-[#202744] mb-2">
                Verifying Email...
              </h2>
              <p className="font-sans text-xs text-[#69718A]">
                Please wait a moment while we confirm your credentials.
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-4">
              <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600">
                <XCircle className="h-7 w-7" />
              </div>
              <h2 className="font-sans text-xl font-bold tracking-tight text-[#202744] mb-2">
                Verification Failed
              </h2>
              <p className="font-sans text-xs text-[#69718A] mb-6 leading-relaxed">
                {error?.response?.data?.message ||
                  error?.message ||
                  'The verification link has expired or has already been used.'}
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.location.href = '/login'}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="font-sans text-xl font-bold tracking-tight text-[#202744] mb-2">
                Email Verified!
              </h2>
              <p className="font-sans text-xs text-[#69718A] mb-6 leading-relaxed">
                {data?.message || 'Your email address has been confirmed. You can now access your workspace.'}
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.location.href = '/login'}
              >
                Sign In to Workspace
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
