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
import { analyticsService } from '../../services/analytics.service';

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

  // Track profile visit when loaded
  React.useEffect(() => {
    if (userId && data) {
      analyticsService.trackEvent({
        userId,
        eventType: 'PROFILE_VIEW',
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      });
    }
  }, [userId, data]);

  const handleProjectClick = (projectId: string, title?: string) => {
    if (userId) {
      analyticsService.trackEvent({
        userId,
        eventType: 'PROJECT_VIEW',
        targetId: projectId,
        targetTitle: title,
      });
    }
  };

  const handleSocialClick = (platform: string, label?: string) => {
    if (userId) {
      analyticsService.trackEvent({
        userId,
        eventType: 'SOCIAL_CLICK',
        targetId: platform,
        targetTitle: label || platform,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-[#69718A]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-[#8B6CF6] border border-violet-100 shadow-xs mb-3">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <p className="font-sans text-sm font-bold text-[#202744]">Loading Portfolio Showcase...</p>
        <p className="font-sans text-xs text-[#69718A] mt-1">Resolving creative layout blueprint</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#202744] mb-2">Portfolio Not Found</h1>
        <p className="text-sm text-[#69718A] max-w-md mb-6 leading-relaxed">
          {(error as AxiosError<{ message?: string }>)?.response?.data?.message ||
            'This portfolio profile is either private, unconfigured, or does not exist.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B6CF6] text-white text-xs font-bold hover:bg-[#7A5CE0] transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return (
    <DynamicPortfolioRenderer
      data={data}
      onProjectClick={handleProjectClick}
      onSocialClick={handleSocialClick}
    />
  );
};

export default PublicPortfolioPage;
