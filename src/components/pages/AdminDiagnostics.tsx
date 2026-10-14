/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { ShieldCheck, Play, CheckCircle2, AlertTriangle, Terminal, Loader2, KeyRound } from 'lucide-react';

export const AdminDiagnostics: React.FC = () => {
    const [authMeResult, setAuthMeResult] = useState<any | null>(null);
    const [authMeLoading, setAuthMeLoading] = useState<boolean>(false);
    const [authMeError, setAuthMeError] = useState<string | null>(null);

    const [authAdminResult, setAuthAdminResult] = useState<any | null>(null);
    const [authAdminLoading, setAuthAdminLoading] = useState<boolean>(false);
    const [authAdminError, setAuthAdminError] = useState<string | null>(null);

    const runAuthMeCheck = async () => {
        setAuthMeLoading(true);
        setAuthMeError(null);
        setAuthMeResult(null);
        try {
            const { data } = await api.get('/auth/me');
            setAuthMeResult(data);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'API Connection Failed';
            setAuthMeError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setAuthMeLoading(false);
        }
    };

    const runAuthAdminCheck = async () => {
        setAuthAdminLoading(true);
        setAuthAdminError(null);
        setAuthAdminResult(null);
        try {
            const { data } = await api.get('/auth/admin');
            setAuthAdminResult(data);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.statusText || err.message || 'API Connection Failed';
            setAuthAdminError(`${err.response?.status || 500}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        } finally {
            setAuthAdminLoading(false);
        }
    };

    return (
        <div className="space-y-6 admin-page-enter font-sans text-[#202744]">
            {/* Self-contained header display */}
            <div className="mb-6">
                <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#202744]">
                    System Diagnostics
                </h2>
                <p className="font-sans text-sm text-[#69718A] mt-1">
                    Run verified security tests and inspect raw JSON outputs for API endpoints.
                </p>
            </div>

            <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-2xs">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-sans text-sm font-bold text-[#202744] uppercase tracking-wider">Backend API Security Diagnostics</h3>
                        <p className="font-sans text-xs text-[#69718A] mt-0.5">
                            Verify connection pathways and request verification mechanisms matching the API collections.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* GET /auth/me Card */}
                <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
                            <span className="inline-flex items-center rounded-md bg-[#FAF8F5] border border-[#EAE5DD] px-2.5 py-1 font-mono text-[10px] font-bold text-[#8B6CF6] uppercase tracking-wider">
                                GET /auth/me
                            </span>
                            <span className="font-sans text-[11px] text-[#69718A]">Current Session Details</span>
                        </div>
                        <p className="mt-3 font-sans text-xs text-[#69718A] leading-relaxed">
                            Calls the auth profile resolver to extract claims from your Bearer token. Confirming this matches the active session.
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        <button
                            id="check-auth-me-btn"
                            onClick={runAuthMeCheck}
                            disabled={authMeLoading}
                            className="w-full flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-[#8B6CF6] hover:bg-[#7A5CE6] px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white transition active:scale-95 disabled:opacity-60 shadow-sm"
                        >
                            {authMeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                            <span>Run Session Check</span>
                        </button>

                        {/* Result Display */}
                        {(authMeResult || authMeError) && (
                            <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
                                <div className="flex items-center space-x-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
                                    <Terminal className="h-3.5 w-3.5 text-[#8B6CF6]" />
                                    <span>Console Output</span>
                                </div>
                                {authMeResult && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold font-sans">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>200 Success</span>
                                        </div>
                                        <pre className="font-mono text-[10px] text-[#202744] bg-white p-3 rounded-lg border border-[#EAE5DD] overflow-x-auto shadow-3xs">
                                            {JSON.stringify(authMeResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {authMeError && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1 text-red-600 text-xs font-bold font-sans">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Session Query Failed</span>
                                        </div>
                                        <div className="font-mono text-[10px] text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                            {authMeError}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* GET /auth/admin Card */}
                <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
                            <span className="inline-flex items-center rounded-md bg-[#FAF8F5] border border-[#EAE5DD] px-2.5 py-1 font-mono text-[10px] font-bold text-[#4697F5] uppercase tracking-wider">
                                GET /auth/admin
                            </span>
                            <span className="font-sans text-[11px] text-[#69718A]">Admin Gate Guard Check</span>
                        </div>
                        <p className="mt-3 font-sans text-xs text-[#69718A] leading-relaxed">
                            Verifies security role restraints. Expects <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded font-mono text-[10px] border border-[#EAE5DD] text-[#8B6CF6]">ADMIN</code> privileges. Standard accounts should be rejected.
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        <button
                            id="check-auth-admin-btn"
                            onClick={runAuthAdminCheck}
                            disabled={authAdminLoading}
                            className="w-full flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-[#202744] hover:bg-[#181E35] px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white transition active:scale-95 disabled:opacity-60 shadow-sm"
                        >
                            {authAdminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-3.5 w-3.5 text-[#8B6CF6]" />}
                            <span>Run Admin Guard Test</span>
                        </button>

                        {/* Result Display */}
                        {(authAdminResult || authAdminError) && (
                            <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
                                <div className="flex items-center space-x-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#69718A] mb-2">
                                    <Terminal className="h-3.5 w-3.5 text-[#8B6CF6]" />
                                    <span>Console Output</span>
                                </div>
                                {authAdminResult && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold font-sans">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>200 Verified Administrator</span>
                                        </div>
                                        <pre className="font-mono text-[10px] text-[#202744] bg-white p-3 rounded-lg border border-[#EAE5DD] overflow-x-auto shadow-3xs">
                                            {JSON.stringify(authAdminResult, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {authAdminError && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1 text-amber-600 text-xs font-bold font-sans">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Forbidden (Access Guard Working)</span>
                                        </div>
                                        <div className="font-mono text-[10px] text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                            {authAdminError}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
