/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Profile } from '../types';
import type { AxiosError } from 'axios';

export interface UpdateProfilePayload {
  fullName?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  services?: string[];
  contactEmail?: string;
  phoneNumber?: string;
  location?: string;
  isPublic?: boolean;
}

/**
 * Hook to retrieve the current user's profile.
 * Hits GET /profiles/me
 */
export function useProfile(options?: { enabled?: boolean }) {
  return useQuery<Profile, AxiosError<{ message?: string }>>({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/profiles/me');
      return data;
    },
    ...options,
  });
}

/**
 * Hook to update the current user's profile.
 * Hits PATCH /profiles/me
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<Profile, AxiosError<{ message?: string }>, UpdateProfilePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.patch<Profile>('/profiles/me', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Hook to upload/replace current user's profile image.
 * Hits POST /profiles/me/image
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation<Profile, AxiosError<{ message?: string }>, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post<Profile>('/profiles/me/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
