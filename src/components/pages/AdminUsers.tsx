/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Role, type User } from '../../types';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useResendVerification } from '../../hooks/useUsers';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { Plus, ShieldAlert, Users, Search, Loader2, Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, Edit, Trash2, Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSessionPayload } from '../../lib/auth';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

export const AdminUsers: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const limit = 10;

    const payload = getSessionPayload();
    const currentUserId = payload?.sub;

    // Custom confirm dialog state
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'info' | 'warning';
        showCancel?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'danger',
        showCancel: true,
    });

    // Modals/Forms State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<Role>(Role.USER);
    const [error, setError] = useState<string>('');

    // Fetch users via React Query
    const { data, isLoading, isError, error: fetchError } = useUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
    });

    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const resendVerificationMutation = useResendVerification();

    // Debounce search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 when search changes
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleOpenCreate = () => {
        setError('');
        setEditingUser(null);
        setEmail('');
        setPassword('');
        setRole(Role.USER);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setError('');
        setEditingUser(user);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete User Account',
            message: 'Are you sure you want to delete this user? This action cannot be undone and will permanently remove their profile data.',
            variant: 'danger',
            showCancel: true,
            onConfirm: () => {
                deleteUserMutation.mutate(userId, {
                    onError: (err) => {
                        const errMsg = err.response?.data?.message || err.message || 'Failed to delete user.';
                        setConfirmState({
                            isOpen: true,
                            title: 'Failed to Delete User',
                            message: typeof errMsg === 'string' ? errMsg : 'An unexpected error occurred.',
                            variant: 'info',
                            showCancel: false,
                            onConfirm: () => {}
                        });
                    }
                });
            }
        });
    };

    const handleResendVerification = (user: User) => {
        setConfirmState({
            isOpen: true,
            title: 'Resend Email Verification',
            message: `Send a new email verification link to ${user.email}?`,
            variant: 'info',
            showCancel: true,
            onConfirm: () => {
                resendVerificationMutation.mutate(user.id, {
                    onSuccess: (res) => {
                        setConfirmState({
                            isOpen: true,
                            title: 'Verification Email Sent',
                            message: res.message || `Verification link sent to ${user.email}.`,
                            variant: 'info',
                            showCancel: false,
                            onConfirm: () => {}
                        });
                    },
                    onError: (err) => {
                        const errMsg = err.response?.data?.message || err.message || 'Failed to send verification email.';
                        setConfirmState({
                            isOpen: true,
                            title: 'Failed to Send Email',
                            message: typeof errMsg === 'string' ? errMsg : 'An unexpected error occurred.',
                            variant: 'danger',
                            showCancel: false,
                            onConfirm: () => {}
                        });
                    }
                });
            }
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email must not be blank.');
            return;
        }

        if (editingUser) {
            updateUserMutation.mutate(
                {
                    id: editingUser.id,
                    email: email.trim(),
                    role: role,
                },
                {
                    onSuccess: () => {
                        setIsModalOpen(false);
                    },
                    onError: (err) => {
                        const msg = err.response?.data?.message || err.message || 'Failed to update user.';
                        setError(typeof msg === 'string' ? msg : 'Validation error.');
                    },
                }
            );
        } else {
            if (!password.trim()) {
                setError('Password is required for new users.');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }

            createUserMutation.mutate(
                {
                    email: email.trim(),
                    password: password,
                    role: role,
                },
                {
                    onSuccess: () => {
                        setIsModalOpen(false);
                    },
                    onError: (err) => {
                        const msg = err.response?.data?.message || err.message || 'Failed to create user.';
                        setError(typeof msg === 'string' ? msg : 'Validation error.');
                    },
                }
            );
        }
    };

    const usersList = data?.data || [];
    const meta = data?.meta;

    return (
        <div className="space-y-6 admin-page-enter text-white font-sans">
            {/* Page Header with Stats */}
            <div className="mb-6">
                <h2 className="font-sans text-2xl font-extrabold tracking-tight text-white">
                    User Management
                </h2>
                <p className="font-sans text-sm text-zinc-400 mt-1">
                    Manage accounts, role assignments, and access privileges across the platform.
                </p>

                {/* Stats Badges */}
                {meta && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1.5 font-mono text-[10px] font-bold text-zinc-300">
                            <Users className="h-3 w-3" />
                            <span>{meta.total} Total Users</span>
                        </span>
                        {usersList.length > 0 && (
                            <>
                                <span className="inline-flex items-center space-x-1 rounded-full bg-purple-950/50 border border-purple-800/40 px-3 py-1.5 font-mono text-[10px] font-bold text-purple-300">
                                    <Shield className="h-3 w-3" />
                                    <span>{usersList.filter(u => u.role === Role.ADMIN).length} Admin</span>
                                </span>
                                <span className="inline-flex items-center space-x-1 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 font-mono text-[10px] font-bold text-zinc-400">
                                    <span>{usersList.filter(u => u.role === Role.USER).length} User</span>
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Search Header and Action panel */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
                <div className="relative max-w-md w-full">
                    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        id="user-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search directory by email..."
                        className="w-full rounded-xl border border-zinc-800 bg-[#101218] py-2.5 pr-4 pl-10 font-sans text-xs focus:border-zinc-700 focus:outline-hidden text-white placeholder:text-zinc-500 transition-all"
                    />
                </div>

                <button
                    id="create-new-user-btn"
                    onClick={handleOpenCreate}
                    className="group flex cursor-pointer items-center justify-center space-x-2 rounded-full bg-white px-5 py-2.5 font-sans text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 active:scale-95 shadow-md"
                >
                    <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                    <span>Add System User</span>
                </button>
            </div>

            {/* Error Message if fetching fails */}
            {isError && (
                <div className="flex items-start space-x-2 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-xs text-red-400 font-sans">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <div>
                        <p className="font-bold">Error loading users directory</p>
                        <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                    </div>
                </div>
            )}

            {/* Directory Table */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#101218] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-zinc-900/90 border-b border-zinc-800 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            <tr>
                                <th className="px-6 py-4">User Identity</th>
                                <th className="px-6 py-4">Role Privileges</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Registration Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-sans text-zinc-300">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400 mb-2" />
                                        <p className="font-sans text-xs">Querying system database...</p>
                                    </td>
                                </tr>
                            ) : usersList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        <Users className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                                        <p className="font-sans text-xs">No users match your listing criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                usersList.map(user => (
                                    <tr key={user.id} className="hover:bg-zinc-900/40 transition">

                                        {/* User Profile column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={user.profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                                    alt={user.profile?.fullName || user.email}
                                                    className="h-9 w-9 shrink-0 rounded-full object-cover border border-zinc-700"
                                                />
                                                <div>
                                                    <p className="font-sans font-bold text-white leading-snug">
                                                        {user.profile?.fullName || 'No Profile'}
                                                    </p>
                                                    <p className="font-mono text-[10px] text-zinc-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Permission */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center space-x-1 rounded-md px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${user.role === Role.ADMIN ? 'bg-purple-950/50 text-purple-300 border border-purple-800/40' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}`}>
                                                <Shield className="h-2.5 w-2.5" />
                                                <span>{user.role}</span>
                                            </span>
                                        </td>

                                        {/* Email Verification Status */}
                                        <td className="px-6 py-4">
                                            {user.isEmailVerified ? (
                                                <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-950/30 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    <span>Verified</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 rounded-md bg-amber-950/30 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                                                    <AlertCircle className="h-2.5 w-2.5" />
                                                    <span>Unverified</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Created At */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1.5 font-mono text-[10px] text-zinc-400">
                                                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                                <span>{new Date(user.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                {!user.isEmailVerified && (
                                                    <button
                                                        onClick={() => handleResendVerification(user)}
                                                        disabled={resendVerificationMutation.isPending}
                                                        className="rounded-lg border border-amber-800/60 bg-amber-950/30 p-1.5 text-amber-400 hover:bg-amber-900/40 transition cursor-pointer disabled:opacity-50"
                                                        title="Resend verification email"
                                                    >
                                                        <Mail className="h-3 w-3" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-300 hover:text-white hover:border-zinc-500 transition cursor-pointer"
                                                    title="Edit user role"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </button>
                                                {currentUserId !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deleteUserMutation.isPending}
                                                        className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:border-red-900 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer disabled:opacity-50"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-zinc-800 bg-[#0c0d12] px-6 py-3.5 font-sans text-xs">
                        <div className="text-zinc-500">
                            Showing page <span className="font-semibold text-zinc-300">{meta.page}</span> of{' '}
                            <span className="font-semibold text-zinc-300">{meta.totalPages}</span> ({meta.total} users)
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.page <= 1}
                                className="flex items-center space-x-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span>Prev</span>
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={meta.page >= meta.totalPages}
                                className="flex items-center space-x-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span>Next</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Creation Modal Dialog */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#0e1015] text-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
                        <div className="px-6 py-4.5 border-b border-zinc-800 flex items-center justify-between">
                            <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-white">
                                {editingUser ? 'Modify User Roles' : 'Introduce System User'}
                            </DialogTitle>
                            <button
                                type="button"
                                id="close-user-modal-top-btn"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 text-zinc-400 hover:text-white flex items-center justify-center rounded-lg hover:bg-zinc-800 font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="flex items-start space-x-2 rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-400 font-sans font-medium">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Email Address */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        System Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="modal-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="developer@workplace.com"
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 font-sans text-xs focus:border-zinc-700 focus:outline-hidden text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                {/* Password PIN */}
                                {!editingUser && (
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                            Temporary Pin Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="modal-password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 font-mono text-xs focus:border-zinc-700 focus:outline-hidden text-white placeholder:text-zinc-500"
                                        />
                                    </div>
                                )}

                                {/* Role */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Role Privilege
                                    </label>
                                    <Listbox value={role} onChange={setRole}>
                                        <div className="relative">
                                            <ListboxButton
                                                id="modal-role"
                                                className="relative w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-zinc-700 focus:outline-hidden text-white cursor-pointer"
                                            >
                                                <span className="block truncate">
                                                    {role === Role.ADMIN
                                                        ? 'Administrator'
                                                        : 'Regular User'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                                                </span>
                                            </ListboxButton>
                                            <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-zinc-900 py-1 text-xs shadow-xl ring-1 ring-white/10 focus:outline-hidden font-sans border border-zinc-800 text-white">
                                                <ListboxOption
                                                    value={Role.USER}
                                                    className="relative cursor-pointer select-none py-2.5 pr-10 pl-3.5 text-zinc-200 data-[focus]:bg-zinc-800"
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-bold text-white' : 'font-normal'}`}>
                                                                Regular User
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-white">
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                                <ListboxOption
                                                    value={Role.ADMIN}
                                                    className="relative cursor-pointer select-none py-2.5 pr-10 pl-3.5 text-zinc-200 data-[focus]:bg-zinc-800"
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-bold text-white' : 'font-normal'}`}>
                                                                Administrator
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-white">
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                            </ListboxOptions>
                                        </div>
                                    </Listbox>
                                </div>

                            </div>

                            <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-4 flex items-center justify-end space-x-2.5">
                                <button
                                    id="cancel-save-user-btn"
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 font-sans text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="submit-save-user-btn"
                                    type="submit"
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    className="flex items-center space-x-1.5 rounded-xl bg-white px-5 py-2 font-sans text-xs font-bold text-zinc-950 shadow-md hover:bg-zinc-200 transition active:scale-95 cursor-pointer disabled:opacity-60"
                                >
                                    {(createUserMutation.isPending || updateUserMutation.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                                </button>
                            </div>

                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                variant={confirmState.variant}
                showCancel={confirmState.showCancel}
            />

        </div>
    );
};
