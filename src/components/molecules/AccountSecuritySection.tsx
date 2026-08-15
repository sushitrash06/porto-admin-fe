import React, { useState } from 'react';
import { useChangePassword, useRequestEmailChange } from '../../hooks/useLogin';
import { clearAccessToken } from '../../lib/auth';
import { Lock, Mail, Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export const AccountSecuritySection: React.FC = () => {
    const changePasswordMutation = useChangePassword();
    const requestEmailChangeMutation = useRequestEmailChange();

    const [successMsg, setSuccessMsg] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Change Password State
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

    // Change Email State
    const [newEmail, setNewEmail] = useState<string>('');
    const [emailChangePassword, setEmailChangePassword] = useState<string>('');
    const [showEmailChangePassword, setShowEmailChangePassword] = useState<boolean>(false);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters long.');
            return;
        }

        changePasswordMutation.mutate({
            oldPassword,
            newPassword
        }, {
            onSuccess: () => {
                setSuccessMsg('Password changed successfully! Mengalihkan ke halaman login...');
                setOldPassword('');
                setNewPassword('');
                setTimeout(() => {
                    clearAccessToken();
                    window.location.href = '/login';
                }, 1500);
            },
            onError: (err) => {
                setErrorMsg(err.response?.data?.message || err.message || 'Failed to change password.');
            }
        });
    };

    const handleRequestEmailChange = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!newEmail || !emailChangePassword) {
            setErrorMsg('New email and current password are required.');
            return;
        }

        requestEmailChangeMutation.mutate({
            newEmail: newEmail.trim(),
            password: emailChangePassword
        }, {
            onSuccess: (data) => {
                setSuccessMsg(data.message || 'Link konfirmasi telah dikirim. Silakan cek inbox di email baru Anda untuk meresmikan pergantian email.');
                setNewEmail('');
                setEmailChangePassword('');
            },
            onError: (err) => {
                setErrorMsg(err.response?.data?.message || err.message || 'Failed to request email change.');
            }
        });
    };

    return (
        <div className="max-w-xl space-y-6">
            {/* Messages Panel */}
            {successMsg && (
                <div className="rounded-md border border-green-150 bg-green-50 p-4 text-xs font-sans text-green-700 font-bold animate-in fade-in zoom-in-95 duration-200">
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs font-sans text-red-650 font-bold animate-in fade-in zoom-in-95 duration-200">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Change Password Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <span>Security Credentials</span>
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Password</label>
                        <div className="relative">
                            <input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-10 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer" title={showOldPassword ? "Hide password" : "Show password"}>
                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Password</label>
                        <div className="relative">
                            <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-10 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer" title={showNewPassword ? "Hide password" : "Show password"}>
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={changePasswordMutation.isPending || !oldPassword || !newPassword}
                        className="flex items-center space-x-2 rounded-md bg-black px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        {changePasswordMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Update Password</span>
                    </button>
                </div>
            </div>

            {/* Change Email Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span>Email Settings</span>
                </h4>
                
                <p className="font-sans text-xs text-slate-500 leading-relaxed">
                    Untuk mengganti alamat email, masukkan email baru Anda dan konfirmasi dengan password saat ini. Kami akan mengirimkan link verifikasi ke email baru Anda.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Baru <span className="text-red-500">*</span></label>
                        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="email@baru.com" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                    </div>
                    <div>
                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password Saat Ini <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type={showEmailChangePassword ? "text" : "password"} value={emailChangePassword} onChange={(e) => setEmailChangePassword(e.target.value)} required placeholder="••••••••" className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-10 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                            <button type="button" onClick={() => setShowEmailChangePassword(!showEmailChangePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer" title={showEmailChangePassword ? "Hide password" : "Show password"}>
                                {showEmailChangePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <button
                        type="button"
                        onClick={handleRequestEmailChange}
                        disabled={requestEmailChangeMutation.isPending || !newEmail || !emailChangePassword}
                        className="flex items-center space-x-2 rounded-md bg-black px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        {requestEmailChangeMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Request Email Change</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
