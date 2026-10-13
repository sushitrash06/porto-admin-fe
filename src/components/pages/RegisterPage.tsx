/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types';
import { useRegister } from '../../hooks/useRegister';
import { ShieldAlert, UserPlus, Sparkles, Eye, EyeOff, Lock, Mail, Compass, Loader2, CheckCircle2, User as UserIcon, Briefcase } from 'lucide-react';

interface RegisterPageProps {
    onRegisterSuccess: (user: User) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [role, setRole] = useState<'USER' | 'BUSINESS'>('USER');
    const [error, setError] = useState<string>('');
    const [step, setStep] = useState<1 | 2 | 3>(1);
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

    const handleNextStep = (e: React.FormEvent) => {
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

        setStep(2);
    };

    const handleRegister = () => {
        setError('');

        registerMutation.mutate(
            { email: email.trim(), password, role },
            {
                onSuccess: () => {
                    setStep(3);
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
        <div className="min-h-screen w-full flex items-center justify-center bg-[#08090d] text-white p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#101218]/90 backdrop-blur-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
                {/* Brand Line — accent gradient */}
                <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"></div>

                {/* Form Container */}
                <div className="p-7">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-zinc-400">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Create Account</span>
                        </div>

                        <Link
                            id="register-cancel-btn"
                            to="/"
                            className="flex items-center space-x-1.5 rounded-lg px-2.5 py-1 font-sans text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
                        >
                            <Compass className="h-3.5 w-3.5" />
                            <span>Showcase</span>
                        </Link>
                    </div>

                    <h2 className="mt-5 font-sans text-2xl font-bold tracking-tight text-white">
                        {step === 1 ? 'Buat Akun Baru' : step === 2 ? 'Pilih Jenis Akun' : 'Pendaftaran Berhasil'}
                    </h2>
                    <p className="mt-1 font-sans text-xs text-zinc-400">
                        {step === 1 ? 'Daftarkan akun untuk mengakses panel admin portfolio.' : step === 2 ? 'Pilih jenis akun yang sesuai dengan kebutuhanmu.' : 'Akun berhasil dibuat.'}
                    </p>

                    {/* Errors */}
                    {error && (
                        <div className="mt-4 flex items-start space-x-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                            <p className="font-sans font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={step === 1 ? handleNextStep : (e) => { e.preventDefault(); handleRegister(); }} className="mt-6 space-y-4">

                        {/* Step 3: Success Message */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center py-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h3 className="font-sans text-sm font-bold text-white">
                                    Silahkan Cek Email Anda
                                </h3>
                                <p className="font-sans text-xs text-zinc-400 max-w-[260px] mx-auto">
                                    Kami telah mengirimkan tautan verifikasi ke <strong className="text-white">{email}</strong>. Harap verifikasi email Anda sebelum masuk.
                                </p>
                                <div className="pt-4 w-full">
                                    <Link
                                        to="/login"
                                        className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl bg-white text-zinc-950 font-bold py-2.5 font-sans text-xs hover:bg-zinc-200 transition active:scale-[0.98] shadow-md"
                                    >
                                        <span>Ke Halaman Login</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Role Selection */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                        Tipe Akun <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* User Role Card */}
                                        <button
                                            type="button"
                                            onClick={() => setRole('USER')}
                                            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none ${role === 'USER'
                                                    ? 'border-purple-500/60 bg-purple-500/10 text-white ring-1 ring-purple-500/30'
                                                    : 'border-zinc-800 bg-[#0d0f14] hover:bg-zinc-800/40 text-zinc-400 hover:text-white'
                                                }`}
                                        >
                                            <UserIcon className={`h-5 w-5 mb-2 ${role === 'USER' ? 'text-purple-400' : 'text-zinc-500'}`} />
                                            <span className="font-sans text-xs font-bold block">Developer</span>
                                            <span className="font-sans text-[10px] text-zinc-400 leading-snug mt-1 max-w-[130px]">
                                                Profil personal, skill, & proyek pribadi.
                                            </span>
                                        </button>

                                        {/* Business Role Card */}
                                        <button
                                            type="button"
                                            onClick={() => setRole('BUSINESS')}
                                            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none ${role === 'BUSINESS'
                                                    ? 'border-purple-500/60 bg-purple-500/10 text-white ring-1 ring-purple-500/30'
                                                    : 'border-zinc-800 bg-[#0d0f14] hover:bg-zinc-800/40 text-zinc-400 hover:text-white'
                                                }`}
                                        >
                                            <Briefcase className={`h-5 w-5 mb-2 ${role === 'BUSINESS' ? 'text-purple-400' : 'text-zinc-500'}`} />
                                            <span className="font-sans text-xs font-bold block">Bisnis / Agensi</span>
                                            <span className="font-sans text-[10px] text-zinc-400 leading-snug mt-1 max-w-[130px]">
                                                Studi kasus bisnis, tim, & proyek komersial.
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 font-sans text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition active:scale-[0.98]"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        id="register-submit-btn"
                                        type="submit"
                                        disabled={registerMutation.isPending}
                                        className="flex-[2] flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-white text-zinc-950 font-bold py-2.5 font-sans text-xs hover:bg-zinc-200 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                                    >
                                        {registerMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                                                <span>Mendaftarkan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4 text-zinc-950" />
                                                <span>Selesaikan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Email and Password */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">

                                {/* Email */}
                                <div>
                                    <label className="block font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            id="register-email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nama@contoh.com"
                                            className="w-full rounded-xl border border-zinc-800 bg-[#0d0f14] py-2.5 pr-3.5 pl-10 font-sans text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:bg-[#12151c] focus:outline-hidden transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            id="register-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimal 6 karakter"
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
                                    {/* Password strength bar */}
                                    {password.length > 0 && (
                                        <div className="mt-1.5">
                                            <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                    style={{ width: passwordStrength.width }}
                                                />
                                            </div>
                                            <p className="mt-1 font-sans text-[10px] text-zinc-400">
                                                Kekuatan password: <span className="font-bold text-white">{passwordStrength.label}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Konfirmasi Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            id="register-confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password"
                                            className={`w-full rounded-xl border bg-[#0d0f14] py-2.5 pr-10 pl-10 font-sans text-xs text-white placeholder-zinc-500 focus:bg-[#12151c] focus:outline-hidden transition-colors ${confirmPassword.length > 0 && confirmPassword === password
                                                    ? 'border-emerald-500/50 focus:border-emerald-400'
                                                    : confirmPassword.length > 0 && confirmPassword !== password
                                                        ? 'border-red-500/50 focus:border-red-400'
                                                        : 'border-zinc-800 focus:border-purple-500'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {/* Match indicator */}
                                    {confirmPassword.length > 0 && confirmPassword === password && (
                                        <div className="mt-1 flex items-center space-x-1">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                            <p className="font-sans text-[10px] text-emerald-400 font-medium">Password cocok</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl bg-white text-zinc-950 font-bold py-2.5 font-sans text-xs hover:bg-zinc-200 transition active:scale-[0.98] shadow-md"
                                    >
                                        <span>Selanjutnya</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Login link */}
                        {step !== 3 && (
                            <div className="text-center pt-1 border-t border-zinc-800/60 mt-3 pt-3">
                                <p className="font-sans text-xs text-zinc-400">
                                    Sudah punya akun?{' '}
                                    <Link
                                        id="register-login-link"
                                        to="/login"
                                        className="font-bold text-white hover:text-purple-400 transition-colors underline underline-offset-2"
                                    >
                                        Masuk di sini
                                    </Link>
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};
