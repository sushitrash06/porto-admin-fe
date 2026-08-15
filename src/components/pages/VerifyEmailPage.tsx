import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyEmail } from '../../hooks/useVerifyEmail';
import { CheckCircle2, XCircle, Loader2, Compass } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { data, isLoading, isError, error } = useVerifyEmail(token);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100/50 p-4 relative overflow-hidden">
            {/* Subtle light background mesh grid for premium aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 z-10">
                {/* Brand Line */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>

                <div className="px-6 py-6.5 text-center">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1.5 text-slate-800">
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">Verifikasi Email</span>
                        </div>

                        <Link
                            to="/"
                            className="flex items-center space-x-1 rounded-md px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                        >
                            <Compass className="h-3 w-3" />
                            <span>Showcase</span>
                        </Link>
                    </div>

                    {!token ? (
                        <div className="flex flex-col items-center py-6">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 mb-2">Token Tidak Ditemukan</h2>
                            <p className="font-sans text-xs text-slate-500 mb-6">
                                Link verifikasi tidak valid atau tidak lengkap. Pastikan kamu menyalin link dengan benar dari emailmu.
                            </p>
                            <Link
                                to="/login"
                                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98]"
                            >
                                Ke Halaman Login
                            </Link>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center py-10">
                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
                            <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 mb-2">Memverifikasi Email...</h2>
                            <p className="font-sans text-xs text-slate-500">
                                Mohon tunggu sebentar, kami sedang memverifikasi akun kamu.
                            </p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center py-6">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 mb-2">Verifikasi Gagal</h2>
                            <p className="font-sans text-xs text-slate-500 mb-6">
                                {error?.response?.data?.message || error?.message || 'Token verifikasi tidak valid atau sudah kadaluarsa.'}
                            </p>
                            <Link
                                to="/login"
                                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98]"
                            >
                                Ke Halaman Login
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h2 className="font-sans text-lg font-bold tracking-tight text-slate-900 mb-2">Verifikasi Berhasil!</h2>
                            <p className="font-sans text-xs text-slate-500 mb-6">
                                {data?.message || 'Email kamu telah berhasil diverifikasi. Kamu sekarang bisa masuk ke akunmu.'}
                            </p>
                            <Link
                                to="/login"
                                className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-md bg-black py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-emerald-600 transition active:scale-[0.98]"
                            >
                                Masuk ke Akun
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
