import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AxiosError } from 'axios';

interface VerifyEmailResponse {
    message: string;
}

async function verifyEmailFn(token: string): Promise<VerifyEmailResponse> {
    const { data } = await api.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
    return data;
}

export function useVerifyEmail(token: string | null) {
    return useQuery<VerifyEmailResponse, AxiosError<{ message?: string }>>({
        queryKey: ['verifyEmail', token],
        queryFn: () => verifyEmailFn(token!),
        enabled: !!token,
        retry: false, // Don't retry if token is invalid or expired
    });
}
