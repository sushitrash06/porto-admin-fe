/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AxiosError } from 'axios';

// ─── Request / Response shapes ──────────────────────────────────────

interface RegisterRequest {
    email: string;
    password: string;
    role?: 'USER' | 'BUSINESS';
}

interface RegisterResponse {
    message: string;
}

// ─── Register mutation ──────────────────────────────────────────────

async function registerFn(credentials: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>('/auth/register', credentials);
    return data;
}

/**
 * React Query mutation hook for `/auth/register`.
 *
 * Usage:
 * ```tsx
 * const register = useRegister();
 * register.mutate({ email, password }, {
 *     onSuccess: (data) => { ... },
 *     onError: (err) => { ... },
 * });
 * ```
 */
export function useRegister() {
    return useMutation<RegisterResponse, AxiosError<{ message?: string }>, RegisterRequest>({
        mutationFn: registerFn,
    });
}
