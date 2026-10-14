/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from '../lib/api';

export type AnalyticsEventType = 'PROFILE_VIEW' | 'PROJECT_VIEW' | 'SOCIAL_CLICK' | 'CV_DOWNLOAD';

export interface TrackEventPayload {
  userId: string;
  eventType: AnalyticsEventType;
  targetId?: string;
  targetTitle?: string;
  referrer?: string;
}

export interface AnalyticsSummary {
  totalProfileViews: number;
  uniqueVisitors: number;
  totalProjectViews: number;
  totalSocialClicks: number;
  days: number;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  profileViews: number;
  projectViews: number;
  socialClicks: number;
}

export interface TopProjectItem {
  projectId: string;
  title: string;
  views: number;
}

export interface SocialClickItem {
  platform: string;
  clicks: number;
}

export interface RecentActivityItem {
  id: string;
  eventType: AnalyticsEventType;
  targetId?: string;
  targetTitle?: string;
  referrer?: string;
  createdAt: string;
}

export interface AnalyticsDashboardResponse {
  summary: AnalyticsSummary;
  viewsTrend: DailyTrendPoint[];
  topProjects: TopProjectItem[];
  socialClicksBreakdown: SocialClickItem[];
  recentActivity: RecentActivityItem[];
}

export const analyticsService = {
  /**
   * Track public visitor interactions (page view, project click, social link click)
   */
  trackEvent: async (payload: TrackEventPayload): Promise<{ success: boolean; id?: string }> => {
    try {
      const res = await api.post('/analytics/track', {
        ...payload,
        referrer: payload.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      });
      return res.data;
    } catch (err) {
      // Silently fail for tracking calls to avoid interrupting user UX
      console.warn('Analytics tracking error:', err);
      return { success: false };
    }
  },

  /**
   * Get authenticated user's portfolio analytics dashboard metrics
   */
  getDashboardAnalytics: async (days: number = 30): Promise<AnalyticsDashboardResponse> => {
    const res = await api.get('/analytics/dashboard', {
      params: { days },
    });
    return res.data;
  },
};
