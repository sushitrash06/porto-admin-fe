/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '../../lib/api';
import { DynamicPortfolioRenderer, type DynamicPortfolioData } from '../organisms/DynamicPortfolioRenderer';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

export const PublicPortfolioPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading, isError, error } = useQuery<DynamicPortfolioData>({
    queryKey: ['portfolio', userId],
    queryFn: async () => {
      const res = await api.get(`/portfolio/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-slate-800 mb-4" />
        <p className="font-sans text-sm font-semibold">Resolving portfolio blueprint...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Portfolio Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          {(error as AxiosError<{ message?: string }>)?.response?.data?.message ||
            'This user profile is either private, unconfigured, or does not exist.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return <DynamicPortfolioRenderer data={data} />;
};

export default PublicPortfolioPage;
