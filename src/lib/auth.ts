/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Role } from '../types';

const TOKEN_KEY = 'access_token';

/** Shape of the decoded JWT payload from the backend */
export interface JwtPayload {
    sub: string;       // user id
    email: string;
    role: Role;
    hasBusinessProfile: boolean;
    iat: number;
    exp: number;
}

// ─── Token persistence ──────────────────────────────────────────────

export function saveAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// ─── JWT decoding (no external lib needed) ──────────────────────────

/**
 * Decode a JWT token without verification (client-side only).
 * Returns null when the token is malformed or expired.
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1])) as JwtPayload;

        // Check expiration (exp is in seconds, Date.now() is ms)
        if (payload.exp * 1000 < Date.now()) {
            clearAccessToken();
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

/**
 * Read the stored token, decode it, and return the payload.
 * Returns null if no token or if it's expired.
 */
export function getSessionPayload(): JwtPayload | null {
    const token = getAccessToken();
    if (!token) return null;
    return decodeToken(token);
}
