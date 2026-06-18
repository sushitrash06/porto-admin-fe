/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { BusinessProfile } from '../types';
import type { AxiosError } from 'axios';

export interface UpdateBusinessProfilePayload {
  businessName?: string;
  description?: string;
  contactEmail?: string;
  phoneNumber?: string;
  location?: string;
  website?: string;
  isPublic?: boolean;
}

/**
 * Hook to retrieve the current user's business profile.
 * Hits GET /business-profiles/me
 */
export function useBusinessProfile(options?: { enabled?: boolean }) {
  return useQuery<BusinessProfile, AxiosError<{ message?: string }>>({
    queryKey: ['business-profile', 'me'],
    queryFn: async () => {
      const { data } = await api.get<BusinessProfile>('/business-profiles/me');
      return data;
    },
    ...options,
  });
}

/**
 * Hook to update the current user's business profile.
 * Hits PATCH /business-profiles/me
 */
export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProfile, AxiosError<{ message?: string }>, UpdateBusinessProfilePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.patch<BusinessProfile>('/business-profiles/me', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', 'me'] });
    },
  });
}

/**
 * Hook to upload/replace current business's logo.
 * Hits POST /business-profiles/me/logo
 */
export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProfile, AxiosError<{ message?: string }>, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post<BusinessProfile>('/business-profiles/me/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', 'me'] });
    },
  });
}

/**
 * Hook to upload/replace current business's banner image.
 * Hits POST /business-profiles/me/banner
 */
export function useUploadBusinessBanner() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProfile, AxiosError<{ message?: string }>, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post<BusinessProfile>('/business-profiles/me/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', 'me'] });
    },
  });
}
