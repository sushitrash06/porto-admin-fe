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

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
}

// ─── Login mutation ─────────────────────────────────────────────────

async function loginFn(credentials: LoginRequest): Promise<JwtPayload> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);

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
 * React Query mutation hook for `/auth/login`.
 *
 * Usage:
 * ```tsx
 * const login = useLogin();
 * login.mutate({ email, password }, {
 *     onSuccess: (payload) => { ... },
 *     onError: (err) => { ... },
 * });
 * ```
 */
export function useLogin() {
    return useMutation<JwtPayload, AxiosError<{ message?: string }>, LoginRequest>({
        mutationFn: loginFn,
    });
}
