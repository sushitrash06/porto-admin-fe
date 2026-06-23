/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { useRegister } from '../../hooks/useRegister';
import { ShieldAlert, UserPlus, Sparkles, Eye, EyeOff, Lock, Mail, Compass, Loader2, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
    onRegisterSuccess: (user: User) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const registerMutation = useRegister();

    // Password strength indicator
    const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
        if (pw.length === 0) return { label: '', color: '', width: '0%' };
        if (pw.length < 6) return { label: 'Lemah', color: 'bg-red-500', width: '25%' };
        if (pw.length < 8) return { label: 'Cukup', color: 'bg-amber-500', width: '50%' };
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw)) return { label: 'Kuat', color: 'bg-emerald-500', width: '100%' };
        return { label: 'Baik', color: 'bg-sky-500', width: '75%' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('Email dan Password wajib diisi.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        registerMutation.mutate(
            { email: email.trim(), password },
            {
                onSuccess: (payload) => {
                    const user: User = {
                        id: payload.sub,
                        email: payload.email,
                        role: payload.role,
                        createdAt: '',
                        updatedAt: '',
                    };
                    onRegisterSuccess(user);
                    // Redirect based on role permissions
                    if (payload.role === Role.SUPER_ADMIN) {
                        navigate('/admin/users');
                    } else if (payload.role === Role.BUSINESS) {
                        navigate('/admin/business/dashboard');
                    } else {
                        navigate('/admin/experiences');
                    }
                },
                onError: (err) => {
                    const msg =
                        err.response?.data?.message ||
                        err.message ||
                        'Registrasi gagal. Silakan coba lagi.';
                    setError(typeof msg === 'string' ? msg : 'Registrasi gagal.');
                },
            }
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
            {/* Subtle light background mesh grid for premium aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 z-10">
                {/* Brand Line — accent gradient to visually differentiate from login */}
                <div className="h-1 bg-gradient-to-r from-black via-slate-700 to-black"></div>

                {/* Form Container */}
                <div className="px-6 py-6.5">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-slate-800">
                            <Sparkles className="h-4 w-4 text-black" />
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">Create Account</span>
                        </div>

                        <Link
                            id="register-cancel-btn"
                            to="/"
                            className="flex items-center space-x-1 rounded-md px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                        >
                            <Compass className="h-3 w-3" />
                            <span>Showcase</span>
                        </Link>
                    </div>

                    <h2 className="mt-4 font-sans text-xl font-bold tracking-tight text-slate-900">
                        Buat Akun Baru
                    </h2>
                    <p className="mt-1 font-sans text-xs text-slate-400">
                        Daftarkan akun untuk mengakses panel admin portfolio.
                    </p>

                    {/* Errors */}
                    {error && (
                        <div className="mt-4 flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-600">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            <p className="font-sans font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="mt-5 space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@contoh.com"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
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
                            {/* Password strength bar */}
                            {password.length > 0 && (
                                <div className="mt-1.5">
                                    <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: passwordStrength.width }}
                                        />
                                    </div>
                                    <p className="mt-0.5 font-sans text-[10px] text-slate-400">
                                        Kekuatan password: <span className="font-bold">{passwordStrength.label}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Konfirmasi Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password"
                                    className={`w-full rounded-md border bg-slate-50 py-2 pr-10 pl-9.5 font-sans text-xs focus:bg-white focus:outline-hidden text-slate-900 ${
                                        confirmPassword.length > 0 && confirmPassword === password
                                            ? 'border-emerald-300 focus:border-emerald-400'
                                            : confirmPassword.length > 0 && confirmPassword !== password
                                              ? 'border-red-300 focus:border-red-400'
                                              : 'border-slate-200 focus:border-slate-400'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {/* Match indicator */}
                            {confirmPassword.length > 0 && confirmPassword === password && (
                                <div className="mt-1 flex items-center space-x-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    <p className="font-sans text-[10px] text-emerald-600 font-medium">Password cocok</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                id="register-submit-btn"
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {registerMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Mendaftarkan...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>Daftar Akun</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Login link */}
                        <div className="text-center pt-1">
                            <p className="font-sans text-xs text-slate-400">
                                Sudah punya akun?{' '}
                                <Link
                                    id="register-login-link"
                                    to="/login"
                                    className="font-bold text-slate-700 hover:text-black transition-colors underline underline-offset-2"
                                >
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
