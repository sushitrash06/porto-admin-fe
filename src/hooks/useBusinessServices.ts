/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { BusinessService } from '../types';
import type { AxiosError } from 'axios';

export interface CreateBusinessServicePayload {
  name: string;
  description?: string;
  priceStartFrom?: number;
  isPublic?: boolean;
}

export interface UpdateBusinessServicePayload extends Partial<CreateBusinessServicePayload> {
  id: string;
}

/**
 * Hook to retrieve logged-in user's own business services.
 * Hits GET /business-services/me
 */
export function useBusinessServices(options?: { enabled?: boolean }) {
  return useQuery<BusinessService[], AxiosError<{ message?: string }>>({
    queryKey: ['business-services', 'me'],
    queryFn: async () => {
      const { data } = await api.get<BusinessService[]>('/business-services/me');
      return data;
    },
    ...options,
  });
}

/**
 * Hook to retrieve a single business service detail.
 * Hits GET /business-services/me/:id
 */
export function useBusinessServiceDetail(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<BusinessService, AxiosError<{ message?: string }>>({
    queryKey: ['business-services', 'me', id],
    queryFn: async () => {
      const { data } = await api.get<BusinessService>(`/business-services/me/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled !== false),
    ...options,
  });
}

/**
 * Hook to create a new business service.
 * Hits POST /business-services
 */
export function useCreateBusinessService() {
  const queryClient = useQueryClient();
  return useMutation<BusinessService, AxiosError<{ message?: string }>, CreateBusinessServicePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<BusinessService>('/business-services', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-services'] });
    },
  });
}

/**
 * Hook to update an existing business service.
 * Hits PATCH /business-services/:id
 */
export function useUpdateBusinessService() {
  const queryClient = useQueryClient();
  return useMutation<BusinessService, AxiosError<{ message?: string }>, UpdateBusinessServicePayload>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch<BusinessService>(`/business-services/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-services'] });
    },
  });
}

/**
 * Hook to delete a business service.
 * Hits DELETE /business-services/:id
 */
export function useDeleteBusinessService() {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      await api.delete(`/business-services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-services'] });
    },
  });
}
