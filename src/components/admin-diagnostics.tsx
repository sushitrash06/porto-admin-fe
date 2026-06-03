/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../lib/api';
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
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-slate-800" />
                    <h3 className="font-sans text-sm font-bold text-slate-900 uppercase">Backend API Security Diagnostics</h3>
                </div>
                <p className="mt-2 font-sans text-xs text-slate-500 leading-relaxed">
                    Verify connection pathways and request verification mechanisms matching the API collections.
                    Test user session decodes and role restrictions directly against the NestJS backend gateway.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* GET /auth/me Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                                GET /auth/me
                            </span>
                            <span className="font-sans text-[10px] text-slate-400">Current Session Details</span>
                        </div>
                        <p className="mt-3 font-sans text-xs text-slate-500 leading-relaxed">
                            Calls the auth profile resolver to extract claims from your Bearer token. Confirming this matches the active session.
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        <button
                            id="check-auth-me-btn"
                            onClick={runAuthMeCheck}
                            disabled={authMeLoading}
                            className="w-full flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-60"
                        >
                            {authMeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                            <span>Run Session Check</span>
                        </button>

                        {/* Result Display */}
                        {(authMeResult || authMeError) && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                                <div className="flex items-center space-x-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    <Terminal className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Console Output</span>
                                </div>
                                {authMeResult && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold font-sans">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>200 Success</span>
                                        </div>
                                        <pre className="font-mono text-[10px] text-slate-700 bg-white p-2.5 rounded-md border border-slate-100 overflow-x-auto">
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
                                        <div className="font-mono text-[10px] text-red-650 bg-red-50 p-2.5 rounded-md border border-red-100">
                                            {authMeError}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* GET /auth/admin Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                                GET /auth/admin
                            </span>
                            <span className="font-sans text-[10px] text-slate-400">Admin Gate Guard Check</span>
                        </div>
                        <p className="mt-3 font-sans text-xs text-slate-500 leading-relaxed">
                            Verifies security role restraints. Expects <code className="bg-slate-50 px-1 py-0.5 rounded font-mono text-[10px] border border-slate-100">SUPER_ADMIN</code> privileges. Standard accounts should be rejected.
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        <button
                            id="check-auth-admin-btn"
                            onClick={runAuthAdminCheck}
                            disabled={authAdminLoading}
                            className="w-full flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition active:scale-95 disabled:opacity-60"
                        >
                            {authAdminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                            <span>Run Admin Guard Test</span>
                        </button>

                        {/* Result Display */}
                        {(authAdminResult || authAdminError) && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                                <div className="flex items-center space-x-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    <Terminal className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Console Output</span>
                                </div>
                                {authAdminResult && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold font-sans">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>200 Verified Administrator</span>
                                        </div>
                                        <pre className="font-mono text-[10px] text-slate-700 bg-white p-2.5 rounded-md border border-slate-100 overflow-x-auto">
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
                                        <div className="font-mono text-[10px] text-amber-700 bg-amber-50/50 p-2.5 rounded-md border border-amber-200">
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
