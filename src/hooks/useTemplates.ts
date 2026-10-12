/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi, type AdminTemplateQueryParams } from '../services/templateApi';
import type {
  CreateTemplatePayload,
  UpdateTemplatePayload,
  UserCustomConfig,
  TemplateCategory,
  Template,
} from '../types/theme';
import type { AxiosError } from 'axios';

export const TEMPLATES_QUERY_KEY = {
  adminList: (params?: AdminTemplateQueryParams) => ['templates', 'admin', params] as const,
  adminDetail: (id: string) => ['templates', 'admin', 'detail', id] as const,
  publishedList: (category?: TemplateCategory) => ['templates', 'published', category] as const,
  publishedDetail: (idOrSlug: string) => ['templates', 'published', 'detail', idOrSlug] as const,
  myTheme: () => ['templates', 'me'] as const,
};

/**
 * Hook to retrieve all templates for admin management.
 */
export function useAdminTemplates(params?: AdminTemplateQueryParams) {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY.adminList(params),
    queryFn: () => templateApi.getAllAdmin(params),
  });
}

/**
 * Hook to retrieve a single template for the Builder Studio.
 */
export function useAdminTemplate(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY.adminDetail(id),
    queryFn: () => templateApi.getByIdAdmin(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Hook to create a new template blueprint.
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation<Template, AxiosError<{ message?: string }>, CreateTemplatePayload>({
    mutationFn: (payload: CreateTemplatePayload) => templateApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Hook to update an existing template.
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation<
    Template,
    AxiosError<{ message?: string }>,
    { id: string; payload: UpdateTemplatePayload }
  >({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      templateApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.adminDetail(variables.id) });
    },
  });
}

/**
 * Hook to toggle publish/draft status of a template.
 */
export function useTogglePublishTemplate() {
  const queryClient = useQueryClient();
  return useMutation<
    Template,
    AxiosError<{ message?: string }>,
    { id: string; isPublished: boolean }
  >({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      templateApi.togglePublish(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Hook to clone an existing template.
 */
export function useCloneTemplate() {
  const queryClient = useQueryClient();
  return useMutation<Template, AxiosError<{ message?: string }>, string>({
    mutationFn: (id: string) => templateApi.clone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Hook to upload a thumbnail screenshot.
 */
export function useUploadTemplateThumbnail() {
  const queryClient = useQueryClient();
  return useMutation<
    Template,
    AxiosError<{ message?: string }>,
    { id: string; file: File }
  >({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      templateApi.uploadThumbnail(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.adminDetail(variables.id) });
    },
  });
}

/**
 * Hook to delete a template.
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation<{ message?: string }, AxiosError<{ message?: string }>, string>({
    mutationFn: (id: string) => templateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

/**
 * Hook to fetch published templates for user template selection.
 */
export function usePublishedTemplates(category?: TemplateCategory) {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY.publishedList(category),
    queryFn: () => templateApi.getPublishedTemplates(category),
  });
}

/**
 * Hook to fetch single published template detail.
 */
export function usePublishedTemplateDetail(idOrSlug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY.publishedDetail(idOrSlug),
    queryFn: () => templateApi.getPublishedDetail(idOrSlug),
    enabled: !!idOrSlug && (options?.enabled ?? true),
  });
}

/**
 * Hook to retrieve active template, userCustomConfig, and resolvedLayout for current user.
 */
export function useMyTheme() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY.myTheme(),
    queryFn: () => templateApi.getMyTheme(),
  });
}

/**
 * Hook for user to apply a template to their profile.
 */
export function useApplyTemplate() {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; template: unknown },
    AxiosError<{ message?: string }>,
    string
  >({
    mutationFn: (templateId: string) => templateApi.applyTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myTheme() });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

/**
 * Hook for user to reorder sections in their portfolio (drag-and-drop).
 */
export function useReorderSections() {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; resolvedLayout?: unknown },
    AxiosError<{ message?: string }>,
    string[]
  >({
    mutationFn: (sectionIds: string[]) => templateApi.reorderSections(sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myTheme() });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

/**
 * Hook for user to update personal theme overrides (accent color, section visibility).
 */
export function useUpdateUserThemeConfig() {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<{ message?: string }>,
    UserCustomConfig
  >({
    mutationFn: (payload: UserCustomConfig) => templateApi.updateUserThemeConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myTheme() });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

/**
 * Hook for user to reset theme customizations back to template defaults.
 */
export function useResetThemeConfig() {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<{ message?: string }>,
    void
  >({
    mutationFn: () => templateApi.resetThemeConfig(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY.myTheme() });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
