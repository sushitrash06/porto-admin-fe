/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService, type AnalyticsDashboardResponse } from '../services/analytics.service';
import type { AxiosError } from 'axios';

/**
 * Hook to retrieve the current user's portfolio analytics dashboard.
 * Hits GET /analytics/dashboard?days={days}
 */
export function useDashboardAnalytics(days: number = 30, options?: { enabled?: boolean }) {
  return useQuery<AnalyticsDashboardResponse, AxiosError<{ message?: string }>>({
    queryKey: ['analytics', 'dashboard', days],
    queryFn: () => analyticsService.getDashboardAnalytics(days),
    staleTime: 1000 * 60, // 1 minute fresh
    refetchOnWindowFocus: false,
    ...options,
  });
}
