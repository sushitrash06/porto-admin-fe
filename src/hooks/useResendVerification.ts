/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AxiosError } from 'axios';

interface ResendVerificationRequest {
    email: string;
}

interface ResendVerificationResponse {
    message: string;
}

async function resendVerificationFn(payload: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    const { data } = await api.post<ResendVerificationResponse>('/auth/resend-verification', payload);
    return data;
}

export function useResendVerification() {
    return useMutation<ResendVerificationResponse, AxiosError<{ message?: string }>, ResendVerificationRequest>({
        mutationFn: resendVerificationFn,
    });
}
