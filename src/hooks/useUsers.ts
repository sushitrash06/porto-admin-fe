/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User, PaginatedResponse } from '../types';
import type { AxiosError } from 'axios';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateUserPayload {
  email: string;
  role: string;
  password?: string;
}

/**
 * Hook to fetch paginated users list with search option
 */
export function useUsers(params: GetUsersParams) {
  return useQuery<PaginatedResponse<User>, AxiosError<{ message?: string }>>({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>('/users', {
        params,
      });
      return data;
    },
  });
}

/**
 * Hook to register/create a new user (for SUPER_ADMIN only)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<User, AxiosError<{ message?: string }>, CreateUserPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<User>('/users', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
