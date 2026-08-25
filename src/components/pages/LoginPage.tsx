/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { useLogin } from '../../hooks/useLogin';
import { ShieldAlert, LogIn, Sparkles, Eye, EyeOff, Lock, Mail, Compass, Loader2 } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const loginMutation = useLogin();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Email and Password are required.');
            return;
        }

        loginMutation.mutate(
            { email: email.trim(), password },
            {
                onSuccess: (payload) => {
                    const user: User = {
                        id: payload.sub,
                        email: payload.email,
                        role: payload.role,
                        businessProfile: payload.hasBusinessProfile ? {} as never : null,
                        createdAt: '',
                        updatedAt: '',
                    };
                    onLoginSuccess(user);
                    // Redirect based on role permissions
                    if (payload.role === Role.ADMIN) {
                        navigate('/admin/dashboard');
                    } else if (payload.hasBusinessProfile) {
                        navigate('/admin/business/dashboard');
                    } else {
                        navigate('/admin/experiences');
                    }
                },
                onError: (err) => {
                    const msg =
                        err.response?.data?.message ||
                        err.message ||
                        'Authentication failed. Please check your credentials.';
                        
                    if (msg === 'Please verify your email address first.') {
                        navigate('/verify-required', { state: { email: email.trim() } });
                        return;
                    }
                    
                    setError(typeof msg === 'string' ? msg : 'Authentication failed.');
                },
            }
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
            {/* Subtle light background mesh grid for premium aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 z-10">
                {/* Brand Line */}
                <div className="h-1 bg-black"></div>

                {/* Form Container */}
                <div className="px-6 py-6.5">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-slate-800">
                            <Sparkles className="h-4 w-4 text-black" />
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">Secure Access</span>
                        </div>

                        <Link
                            id="login-cancel-btn"
                            to="/"
                            className="flex items-center space-x-1 rounded-md px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                        >
                            <Compass className="h-3 w-3" />
                            <span>Showcase</span>
                        </Link>
                    </div>

                    <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-slate-900">
                        Sign In to Portal
                    </h2>
                    <p className="mt-1 font-sans text-xs text-slate-400">
                        Enter secure credentials to administer directory databases.
                    </p>

                    {/* Errors */}
                    {error && (
                        <div className="mt-4 flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-600">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            <p className="font-sans font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="mt-5 space-y-4">
                        <div>
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                id="login-submit-btn"
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4" />
                                        <span>Authenticate Credentials</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Register link */}
                        <div className="text-center pt-1">
                            <p className="font-sans text-xs text-slate-400">
                                Belum punya akun?{' '}
                                <Link
                                    id="login-register-link"
                                    to="/register"
                                    className="font-bold text-slate-700 hover:text-black transition-colors underline underline-offset-2"
                                >
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

