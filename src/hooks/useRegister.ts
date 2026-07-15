/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { saveAccessToken, decodeToken } from '../lib/auth';
import type { JwtPayload } from '../lib/auth';
import type { AxiosError } from 'axios';

// ─── Request / Response shapes ──────────────────────────────────────

interface RegisterRequest {
    email: string;
    password: string;
    role?: 'USER' | 'BUSINESS';
}

interface RegisterResponse {
    access_token: string;
}

// ─── Register mutation ──────────────────────────────────────────────

async function registerFn(credentials: RegisterRequest): Promise<JwtPayload> {
    const { data } = await api.post<RegisterResponse>('/auth/register', credentials);

    // Persist the raw JWT
    saveAccessToken(data.access_token);

    // Decode payload so the caller gets structured user data
    const payload = decodeToken(data.access_token);
    if (!payload) {
        throw new Error('Received an invalid or expired token from the server.');
    }

    return payload;
}

/**
 * React Query mutation hook for `/auth/register`.
 *
 * Usage:
 * ```tsx
 * const register = useRegister();
 * register.mutate({ email, password }, {
 *     onSuccess: (payload) => { ... },
 *     onError: (err) => { ... },
 * });
 * ```
 */
export function useRegister() {
    return useMutation<JwtPayload, AxiosError<{ message?: string }>, RegisterRequest>({
        mutationFn: registerFn,
    });
}
