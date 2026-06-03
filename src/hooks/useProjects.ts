/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Project, ProjectType } from '../types';
import type { AxiosError } from 'axios';

export interface CreateProjectPayload {
  title: string;
  description?: string;
  type: ProjectType;
  experienceId?: string | null;
  thumbnail?: string;
  images?: string[];
  techStacks: string[];
  projectUrl?: string;
  githubUrl?: string;
  role?: string;
  isPublic?: boolean;
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {
  id: string;
}

export interface AdminProjectsParams {
  userId?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook to retrieve logged-in user's own projects.
 * Hits GET /projects/me
 */
export function useMyProjects(options?: { enabled?: boolean }) {
  return useQuery<Project[], AxiosError<{ message?: string }>>({
    queryKey: ['projects', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Project[]>('/projects/me');
      return data;
    },
    ...options,
  });
}

/**
 * Hook for SUPER_ADMIN to query all projects on the platform.
 * Hits GET /admin/projects
 */
export function useAdminProjects(params: AdminProjectsParams, options?: { enabled?: boolean }) {
  return useQuery<Project[], AxiosError<{ message?: string }>>({
    queryKey: ['projects', 'admin', params],
    queryFn: async () => {
      const { data } = await api.get<Project[]>('/admin/projects', {
        params,
      });
      return data;
    },
    ...options,
  });
}

/**
 * Hook to create a new project.
 * Hits POST /projects
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, AxiosError<{ message?: string }>, CreateProjectPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Project>('/projects', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook to update an existing project.
 * Hits PATCH /projects/:id
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, AxiosError<{ message?: string }>, UpdateProjectPayload>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch<Project>(`/projects/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook to delete a project.
 * Hits DELETE /projects/:id
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook to upload/replace a project's thumbnail image.
 * Hits POST /projects/:id/thumbnail
 */
export function useUploadProjectThumbnail() {
  const queryClient = useQueryClient();
  return useMutation<Project, AxiosError<{ message?: string }>, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<Project>(`/projects/${id}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook to upload/add an image to a project's screenshots list.
 * Hits POST /projects/:id/images
 */
export function useUploadProjectImage() {
  const queryClient = useQueryClient();
  return useMutation<Project, AxiosError<{ message?: string }>, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<Project>(`/projects/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Hook to remove a project image.
 * Hits DELETE /projects/:id/images
 */
export function useDeleteProjectImage() {
  const queryClient = useQueryClient();
  return useMutation<Project, AxiosError<{ message?: string }>, { id: string; imageUrl: string }>({
    mutationFn: async ({ id, imageUrl }) => {
      const { data } = await api.delete<Project>(`/projects/${id}/images`, {
        data: { imageUrl },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
