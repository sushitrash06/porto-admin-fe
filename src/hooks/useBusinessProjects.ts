/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { BusinessProject } from '../types';
import type { AxiosError } from 'axios';

export interface CreateBusinessProjectPayload {
  title: string;
  location?: string;
  year?: number;
  description?: string;
  projectType: string;
  clientName?: string;
  thumbnail?: string;
  images?: string[];
  isPublic?: boolean;
}

export interface UpdateBusinessProjectPayload extends Partial<CreateBusinessProjectPayload> {
  id: string;
}

/**
 * Hook to retrieve logged-in user's own business projects.
 * Hits GET /business-projects/me
 */
export function useBusinessProjects(options?: { enabled?: boolean }) {
  return useQuery<BusinessProject[], AxiosError<{ message?: string }>>({
    queryKey: ['business-projects', 'me'],
    queryFn: async () => {
      const { data } = await api.get<BusinessProject[]>('/business-projects/me');
      return data;
    },
    ...options,
  });
}

/**
 * Hook to retrieve a single business project detail.
 * Hits GET /business-projects/me/:id
 */
export function useBusinessProjectDetail(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<BusinessProject, AxiosError<{ message?: string }>>({
    queryKey: ['business-projects', 'me', id],
    queryFn: async () => {
      const { data } = await api.get<BusinessProject>(`/business-projects/me/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled !== false),
    ...options,
  });
}

/**
 * Hook to create a new business project.
 * Hits POST /business-projects
 */
export function useCreateBusinessProject() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProject, AxiosError<{ message?: string }>, CreateBusinessProjectPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<BusinessProject>('/business-projects', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}

/**
 * Hook to update an existing business project.
 * Hits PATCH /business-projects/:id
 */
export function useUpdateBusinessProject() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProject, AxiosError<{ message?: string }>, UpdateBusinessProjectPayload>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch<BusinessProject>(`/business-projects/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}

/**
 * Hook to delete a business project.
 * Hits DELETE /business-projects/:id
 */
export function useDeleteBusinessProject() {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      await api.delete(`/business-projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}

/**
 * Hook to upload/replace a business project's thumbnail image.
 * Hits POST /business-projects/:id/thumbnail
 */
export function useUploadBusinessProjectThumbnail() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProject, AxiosError<{ message?: string }>, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<BusinessProject>(`/business-projects/${id}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}

/**
 * Hook to upload/add an image to a business project's screenshots list.
 * Hits POST /business-projects/:id/images
 */
export function useUploadBusinessProjectImage() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProject, AxiosError<{ message?: string }>, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<BusinessProject>(`/business-projects/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}

/**
 * Hook to remove a business project image.
 * Hits DELETE /business-projects/:id/images
 */
export function useDeleteBusinessProjectImage() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProject, AxiosError<{ message?: string }>, { id: string; imageUrl: string }>({
    mutationFn: async ({ id, imageUrl }) => {
      const { data } = await api.delete<BusinessProject>(`/business-projects/${id}/images`, {
        data: { imageUrl },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}

/**
 * Hook to convert a personal project into a business case study.
 * Hits POST /business-projects/import-personal/:personalProjectId?deleteOriginal=true/false
 */
export function useConvertPersonalProject() {
  const queryClient = useQueryClient();
  return useMutation<BusinessProject, AxiosError<{ message?: string }>, { personalProjectId: string; deleteOriginal: boolean }>({
    mutationFn: async ({ personalProjectId, deleteOriginal }) => {
      const { data } = await api.post<BusinessProject>(
        `/business-projects/import-personal/${personalProjectId}?deleteOriginal=${deleteOriginal}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['business-projects'] });
    },
  });
}
