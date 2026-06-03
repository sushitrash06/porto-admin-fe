/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Experience } from '../types';
import type { AxiosError } from 'axios';

export interface CreateExperiencePayload {
  company: string;
  position: string;
  description?: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string | null;   // ISO date string or null
  companyLogo?: string;
  isPublic?: boolean;
}

export interface UpdateExperiencePayload extends Partial<CreateExperiencePayload> {
  id: string;
}

export interface AdminExperiencesParams {
  userId?: string;
  company?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook to retrieve logged-in user's own experiences.
 * Hits GET /experiences/me
 */
export function useMyExperiences(options?: { enabled?: boolean }) {
  return useQuery<Experience[], AxiosError<{ message?: string }>>({
    queryKey: ['experiences', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Experience[]>('/experiences/me');
      return data;
    },
    ...options,
  });
}

/**
 * Hook for SUPER_ADMIN to query all experiences on the platform.
 * Hits GET /admin/experiences
 */
export function useAdminExperiences(params: AdminExperiencesParams, options?: { enabled?: boolean }) {
  return useQuery<Experience[], AxiosError<{ message?: string }>>({
    queryKey: ['experiences', 'admin', params],
    queryFn: async () => {
      const { data } = await api.get<Experience[]>('/admin/experiences', {
        params,
      });
      return data;
    },
    ...options,
  });
}

/**
 * Hook to create a new experience.
 * Hits POST /experiences
 */
export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation<Experience, AxiosError<{ message?: string }>, CreateExperiencePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Experience>('/experiences', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

/**
 * Hook to update an existing experience.
 * Hits PATCH /experiences/:id
 */
export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation<Experience, AxiosError<{ message?: string }>, UpdateExperiencePayload>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch<Experience>(`/experiences/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

/**
 * Hook to delete an experience.
 * Hits DELETE /experiences/:id
 */
export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      await api.delete(`/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
