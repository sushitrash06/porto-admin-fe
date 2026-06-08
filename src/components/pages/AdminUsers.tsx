/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Role } from '../../types';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { Plus, ShieldAlert, Users, Search, UserCheck, Loader2, Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, Edit, Trash2 } from 'lucide-react';
import { getSessionPayload } from '../../lib/auth';

export const AdminUsers: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const limit = 10;

    const payload = getSessionPayload();
    const currentUserId = payload?.sub;

    // Modals/Forms State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
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

    const handleOpenEdit = (user: any) => {
        setError('');
        setEditingUser(user);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(userId, {
                onError: (err) => {
                    alert(err.response?.data?.message || err.message || 'Failed to delete user.');
                }
            });
        }
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
        <div className="space-y-6">
            {/* Self-contained header display */}
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
                    System User Databases
                </h2>
                <p className="font-sans text-xs text-neutral-450 mt-1">
                    Manage employee role configurations, email constraints, and security entry privileges.
                </p>
            </div>

            {/* Search Header and Action panel */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
                <div className="relative max-w-md w-full">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        id="user-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search directory by email..."
                        className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-4 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                    />
                </div>

                <button
                    id="create-new-user-btn"
                    onClick={handleOpenCreate}
                    className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs transition hover:bg-slate-800 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add System User</span>
                </button>
            </div>

            {/* Error Message if fetching fails */}
            {isError && (
                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-600 font-sans">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                        <p className="font-bold">Error loading users directory</p>
                        <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                    </div>
                </div>
            )}

            {/* Directory Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-3xs">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Developer</th>
                                <th className="px-6 py-4">Role Permission</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans text-slate-600">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-455">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 mb-2" />
                                        <p className="font-sans text-xs">Querying system database...</p>
                                    </td>
                                </tr>
                            ) : usersList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        <Users className="mx-auto h-8 w-8 text-slate-355 mb-2" />
                                        <p className="font-sans text-xs">No users match your listing criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                usersList.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition">

                                        {/* User Profile column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={user.profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                                    alt={user.profile?.fullName || user.email}
                                                    className="h-9 w-9 shrink-0 rounded-full object-cover border border-slate-200"
                                                />
                                                <div>
                                                    <p className="font-sans font-bold text-slate-900 leading-snug">
                                                        {user.profile?.fullName || 'No Profile'}
                                                    </p>
                                                    <p className="font-mono text-[10px] text-slate-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Permission */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${user.role === Role.SUPER_ADMIN
                                                    ? 'bg-black text-white border border-black shadow-3xs'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                <UserCheck className="h-2 w-2" />
                                                <span>{user.role}</span>
                                            </span>
                                        </td>

                                        {/* Created At */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1.5 font-mono text-[10px] text-slate-550">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
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
                                                <button
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                                                    title="Edit user role"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </button>
                                                {currentUserId !== user.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deleteUserMutation.isPending}
                                                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
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
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 font-sans text-xs">
                        <div className="text-slate-400">
                            Showing page <span className="font-semibold text-slate-700">{meta.page}</span> of{' '}
                            <span className="font-semibold text-slate-700">{meta.totalPages}</span> ({meta.total} users)
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.page <= 1}
                                className="flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span>Prev</span>
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={meta.page >= meta.totalPages}
                                className="flex items-center space-x-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>Next</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Creation Modal Dialog */}
            {/* Creation Modal Dialog */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                                {editingUser ? 'Modify User Roles' : 'Introduce System User'}
                            </DialogTitle>
                            <button
                                type="button"
                                id="close-user-modal-top-btn"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-md hover:bg-slate-50 font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="flex items-start space-x-2 rounded-md border border-red-105 bg-red-50 p-3 text-xs text-red-600 font-sans font-medium">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Email Address */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        System Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="modal-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="developer@workplace.com"
                                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                    />
                                </div>

                                {/* Password PIN */}
                                {!editingUser && (
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            Temporary Pin Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="modal-password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                        />
                                    </div>
                                )}

                                {/* Role */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Role Privilege
                                    </label>
                                    <Listbox value={role} onChange={setRole}>
                                        <div className="relative">
                                            <ListboxButton
                                                id="modal-role"
                                                className="relative w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-3 text-left font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 cursor-pointer"
                                            >
                                                <span className="block truncate">
                                                    {role === Role.SUPER_ADMIN ? 'Super Administrator' : 'Regular Business User'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                                </span>
                                            </ListboxButton>
                                            <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-hidden font-sans border border-slate-200">
                                                <ListboxOption
                                                    value={Role.USER}
                                                    className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                Regular Business User
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                                <ListboxOption
                                                    value={Role.SUPER_ADMIN}
                                                    className="relative cursor-pointer select-none py-2 pr-10 pl-3 text-slate-900 data-[focus]:bg-slate-50"
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                Super Administrator
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
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

                            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end space-x-2">
                                <button
                                    id="cancel-save-user-btn"
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="submit-save-user-btn"
                                    type="submit"
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    className="flex items-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer disabled:opacity-60"
                                >
                                    {(createUserMutation.isPending || updateUserMutation.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                                </button>
                            </div>

                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

        </div>
    );
};
