/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { getAccessToken } from './auth';

/**
 * Pre-configured Axios instance pointing at the backend API.
 * - Base URL pulled from VITE_API_BASE_URL env var.
 * - Authorization header is injected automatically when a token exists.
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
