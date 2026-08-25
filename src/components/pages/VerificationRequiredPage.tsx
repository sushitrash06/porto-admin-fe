import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

// Assuming your backend URL is set via environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const VerificationRequiredPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // If there is no email in state, redirect to login to prevent direct access without context
    useEffect(() => {
        if (!email) {
            navigate('/login', { replace: true });
        }
    }, [email, navigate]);

    // Handle cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResendEmail = async () => {
        if (!email || cooldown > 0 || isLoading) return;

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            await axios.post(`${API_URL}/auth/resend-verification`, { email });
            setStatus('success');
            setMessage('Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.');
            setCooldown(60); // 60 seconds cooldown
        } catch (error: any) {
            setStatus('error');
            setMessage(
                error.response?.data?.message ||
                error.message ||
                'Gagal mengirim ulang email verifikasi. Silakan coba lagi.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null; // Prevents flashing before redirect

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200 z-10">
                {/* Brand Top Line */}
                <div className="h-1 bg-amber-500"></div>

                <div className="px-6 py-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Icon */}
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/50 mb-6 relative">
                            <Mail className="h-8 w-8 text-amber-500" />
                            {/* Notification dot */}
                            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white"></span>
                        </div>

                        <h2 className="font-sans text-xl font-extrabold tracking-tight text-slate-900 mb-2">
                            Verifikasi Email Dibutuhkan
                        </h2>
                        
                        <p className="font-sans text-sm text-slate-500 mb-6 leading-relaxed">
                            Akun Anda belum diverifikasi. Silakan periksa kotak masuk email Anda (atau folder spam) untuk tautan verifikasi.
                        </p>

                        <div className="w-full rounded-lg bg-slate-50 border border-slate-100 p-4 mb-6">
                            <p className="font-sans text-xs font-semibold text-slate-700">Email terdaftar:</p>
                            <p className="font-mono text-sm font-bold text-slate-900 mt-1">{email}</p>
                        </div>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="w-full flex items-start space-x-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-6 text-left">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                <p className="font-sans text-xs font-medium text-emerald-700 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="w-full flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 p-3 mb-6 text-left">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                                <p className="font-sans text-xs font-medium text-red-700 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="w-full space-y-3">
                            <button
                                onClick={handleResendEmail}
                                disabled={isLoading || cooldown > 0}
                                className={`flex w-full items-center justify-center space-x-2 rounded-lg py-3 font-sans text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                                    cooldown > 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        : 'bg-black text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Mengirim...</span>
                                    </>
                                ) : cooldown > 0 ? (
                                    <span>Tunggu {cooldown}s</span>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        <span>Kirim Ulang Verifikasi</span>
                                    </>
                                )}
                            </button>

                            <Link
                                to="/login"
                                className="flex w-full items-center justify-center space-x-2 rounded-lg border border-slate-200 bg-white py-3 font-sans text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Kembali ke Login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
