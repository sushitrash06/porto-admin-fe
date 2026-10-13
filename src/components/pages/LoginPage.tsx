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
        <div className="min-h-screen w-full flex items-center justify-center bg-[#08090d] text-white p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#101218]/90 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
                {/* Brand Top Highlight */}
                <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"></div>

                {/* Form Container */}
                <div className="p-7">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-zinc-400">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Secure Access</span>
                        </div>

                        <Link
                            id="login-cancel-btn"
                            to="/"
                            className="flex items-center space-x-1.5 rounded-lg px-2.5 py-1 font-sans text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
                        >
                            <Compass className="h-3.5 w-3.5" />
                            <span>Showcase</span>
                        </Link>
                    </div>

                    <h2 className="mt-5 font-sans text-2xl font-bold tracking-tight text-white">
                        Sign In to Foliowalaweh
                    </h2>
                    <p className="mt-1 font-sans text-xs text-zinc-400">
                        Enter your credentials to access your portfolio & console.
                    </p>

                    {/* Errors */}
                    {error && (
                        <div className="mt-4 flex items-start space-x-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <p className="font-sans font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="mt-6 space-y-4">
                        <div>
                            <label className="block font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full rounded-xl border border-zinc-800 bg-[#0d0f14] py-2.5 pr-3.5 pl-10 font-sans text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-[#12151c] focus:outline-hidden transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                Password <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-800 bg-[#0d0f14] py-2.5 pr-10 pl-10 font-sans text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-[#12151c] focus:outline-hidden transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
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
                                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl bg-white text-zinc-950 font-bold py-2.5 font-sans text-xs hover:bg-zinc-200 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4 text-zinc-950" />
                                        <span>Authenticate Credentials</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Forgot password link */}
                        <div className="text-center pt-2">
                            <Link
                                id="login-forgot-pw-link"
                                to="/forgot-password"
                                className="font-sans text-xs font-medium text-zinc-400 hover:text-purple-400 transition-colors underline underline-offset-2"
                            >
                                Lupa password?
                            </Link>
                        </div>

                        {/* Register link */}
                        <div className="text-center pt-1 border-t border-zinc-800/60 mt-3 pt-3">
                            <p className="font-sans text-xs text-zinc-400">
                                Belum punya akun?{' '}
                                <Link
                                    id="login-register-link"
                                    to="/register"
                                    className="font-bold text-white hover:text-purple-400 transition-colors underline underline-offset-2"
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

