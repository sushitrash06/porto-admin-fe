/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Role, type User } from '../../types';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useResendVerification } from '../../hooks/useUsers';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { Plus, ShieldAlert, Users, Calendar, ChevronDown, Check, Edit, Trash2, Shield, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getSessionPayload } from '../../lib/auth';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import {
    TableContainer,
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableIdentityTile,
    TableActionButton,
    TableLoadingRow,
    TableEmptyRow,
} from '../molecules/Table';
import { Pagination } from '../molecules/Pagination';
import { Badge } from '../atoms/Badge';
import { SearchBar } from '../molecules/SearchBar';

import { useToast } from '../../hooks/useToast';

export const AdminUsers: React.FC = () => {
    const { toast } = useToast();
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
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
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
        setIsEmailVerified(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setError('');
        setEditingUser(user);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
        setIsEmailVerified(user.isEmailVerified ?? false);
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
                    onSuccess: () => {
                        toast.success('User account has been deleted successfully.');
                    },
                    onError: (err) => {
                        const errMsg = err.response?.data?.message || err.message || 'Failed to delete user.';
                        toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to delete user.');
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
                        toast.success(res.message || `Verification link sent to ${user.email}.`);
                    },
                    onError: (err) => {
                        const errMsg = err.response?.data?.message || err.message || 'Failed to send verification email.';
                        toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to send verification email.');
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
                    isEmailVerified,
                },
                {
                    onSuccess: () => {
                        toast.success(`User ${email.trim()} updated successfully.`);
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
                        toast.success(`New user ${email.trim()} created successfully.`);
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
        <div className="space-y-6 admin-page-enter text-[#202744] font-sans">
            {/* Page Header with Stats */}
            <div className="mb-6">
                <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#202744]">
                    User Management
                </h2>
                <p className="font-sans text-sm text-[#69718A] mt-1">
                    Manage accounts, role assignments, and access privileges across the platform.
                </p>

                {/* Stats Badges */}
                {meta && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Badge variant="neutral" size="md">
                            <Users className="h-3.5 w-3.5 text-[#8B6CF6]" />
                            <span>{meta.total} Total Users</span>
                        </Badge>
                        {usersList.length > 0 && (
                            <>
                                <Badge variant="primary" size="md">
                                    <Shield className="h-3.5 w-3.5" />
                                    <span>{usersList.filter(u => u.role === Role.ADMIN).length} Admin</span>
                                </Badge>
                                <Badge variant="neutral" size="md">
                                    <span>{usersList.filter(u => u.role === Role.USER).length} User</span>
                                </Badge>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Search Header and Action panel */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EAE5DD] pb-6">
                <div className="max-w-md w-full">
                    <SearchBar
                        id="user-search"
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search directory by email..."
                    />
                </div>

                <button
                    id="create-new-user-btn"
                    onClick={handleOpenCreate}
                    className="group flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-[#8B6CF6] hover:bg-[#7857ED] px-5 py-2.5 font-sans text-xs font-semibold text-white transition active:scale-95 shadow-sm"
                >
                    <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                    <span>Add System User</span>
                </button>
            </div>

            {/* Error Message if fetching fails */}
            {isError && (
                <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-sans">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                        <p className="font-bold">Error loading users directory</p>
                        <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                    </div>
                </div>
            )}

            {/* Directory Table */}
            <TableContainer>
                <Table minWidth="min-w-[700px]">
                    <TableHeader>
                        <tr>
                            <TableHead>User Identity</TableHead>
                            <TableHead>Role Privileges</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead align="right">Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableLoadingRow colSpan={5} message="Querying system database..." />
                        ) : usersList.length === 0 ? (
                            <TableEmptyRow
                                colSpan={5}
                                icon={<Users className="mx-auto h-8 w-8 text-[#69718A]/40 mb-2" />}
                                message="No users match your listing criteria."
                            />
                        ) : (
                            usersList.map(user => (
                                <TableRow key={user.id}>
                                    {/* User Profile column */}
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <TableIdentityTile
                                                name={user.profile?.fullName || user.email}
                                                image={user.profile?.profileImage}
                                                variant={user.role === Role.ADMIN ? 'violet' : 'neutral'}
                                            />
                                            <div>
                                                <p className="font-sans font-semibold text-[#202744] leading-snug">
                                                    {user.profile?.fullName || 'No Profile'}
                                                </p>
                                                <p className="font-sans text-[11px] text-[#69718A]">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Role Permission */}
                                    <TableCell>
                                        <Badge
                                            variant={user.role === Role.ADMIN ? 'primary' : 'neutral'}
                                            size="sm"
                                        >
                                            <Shield className="h-3 w-3" />
                                            <span>{user.role}</span>
                                        </Badge>
                                    </TableCell>

                                    {/* Email Verification Status */}
                                    <TableCell>
                                        {user.isEmailVerified ? (
                                            <Badge variant="success" size="sm">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Verified</span>
                                            </Badge>
                                        ) : (
                                            <Badge variant="warning" size="sm">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>Unverified</span>
                                            </Badge>
                                        )}
                                    </TableCell>

                                    {/* Created At */}
                                    <TableCell>
                                        <div className="flex items-center space-x-1.5 font-sans text-xs text-[#69718A]">
                                            <Calendar className="h-3.5 w-3.5 text-[#69718A]/70" />
                                            <span>{new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end space-x-1">
                                            {!user.isEmailVerified && (
                                                <TableActionButton
                                                    id={`resend-verification-${user.id}-btn`}
                                                    icon={<Mail className="h-3.5 w-3.5" />}
                                                    label="Resend verification email"
                                                    variant="warning"
                                                    onClick={() => handleResendVerification(user)}
                                                    disabled={resendVerificationMutation.isPending}
                                                />
                                            )}
                                            <TableActionButton
                                                id={`edit-user-${user.id}-btn`}
                                                icon={<Edit className="h-3.5 w-3.5" />}
                                                label="Edit user role"
                                                variant="default"
                                                onClick={() => handleOpenEdit(user)}
                                            />
                                            {currentUserId !== user.id && (
                                                <TableActionButton
                                                    id={`delete-user-${user.id}-btn`}
                                                    icon={<Trash2 className="h-3.5 w-3.5" />}
                                                    label="Delete user"
                                                    variant="danger"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={deleteUserMutation.isPending}
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {meta && (
                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        itemsPerPage={limit}
                        itemLabel="users"
                        onPageChange={setPage}
                        variant="table"
                    />
                )}
            </TableContainer>

            {/* Creation Modal Dialog */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-[#202744]/60 backdrop-blur-xs transition-opacity" />

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white text-[#202744] shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
                        <div className="px-6 py-4.5 border-b border-[#EAE5DD] flex items-center justify-between">
                            <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-[#202744]">
                                {editingUser ? 'Modify User Roles' : 'Introduce System User'}
                            </DialogTitle>
                            <button
                                type="button"
                                id="close-user-modal-top-btn"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 text-[#69718A] hover:text-[#202744] flex items-center justify-center rounded-lg hover:bg-[#FAF8F5] font-sans text-lg cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-sans font-medium">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Email Address */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                                        System Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="modal-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="developer@workplace.com"
                                        className="w-full rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] placeholder:text-[#69718A]"
                                    />
                                </div>

                                {/* Password PIN */}
                                {!editingUser && (
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                                            Temporary Pin Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="modal-password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full rounded-xl border border-[#EAE5DD] bg-white px-3.5 py-2.5 font-mono text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] placeholder:text-[#69718A]"
                                        />
                                    </div>
                                )}

                                {/* Role */}
                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1.5">
                                        Role Privilege
                                    </label>
                                    <Listbox value={role} onChange={setRole}>
                                        <div className="relative">
                                            <ListboxButton
                                                id="modal-role"
                                                className="relative w-full rounded-xl border border-[#EAE5DD] bg-white py-2.5 pr-10 pl-3.5 text-left font-sans text-xs focus:border-[#8B6CF6] focus:outline-hidden text-[#202744] cursor-pointer"
                                            >
                                                <span className="block truncate font-medium">
                                                    {role === Role.ADMIN
                                                        ? 'Administrator'
                                                        : 'Regular User'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronDown className="h-4 w-4 text-[#69718A]" />
                                                </span>
                                            </ListboxButton>
                                            <ListboxOptions className="absolute z-60 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-xs shadow-xl border border-[#EAE5DD] focus:outline-hidden font-sans text-[#202744]">
                                                <ListboxOption
                                                    value={Role.USER}
                                                    className="relative cursor-pointer select-none py-2.5 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                                Regular User
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                                <ListboxOption
                                                    value={Role.ADMIN}
                                                    className="relative cursor-pointer select-none py-2.5 pr-10 pl-3.5 text-[#202744] data-[focus]:bg-[#FAF8F5]"
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-bold text-[#8B6CF6]' : 'font-normal'}`}>
                                                                Administrator
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8B6CF6]">
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

                                {editingUser && (
                                    <div className="pt-2 border-t border-[#F0EBE3]">
                                        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                                            <input
                                                id="user-is-email-verified-checkbox"
                                                type="checkbox"
                                                checked={isEmailVerified}
                                                onChange={(e) => setIsEmailVerified(e.target.checked)}
                                                className="h-4 w-4 rounded-md border-[#EAE5DD] text-[#8B6CF6] focus:ring-[#8B6CF6] cursor-pointer"
                                            />
                                            <span className="font-sans text-xs font-bold text-[#202744]">
                                                Email Verified (Manual Platform Verification)
                                            </span>
                                        </label>
                                        <p className="font-sans text-[11px] text-[#69718A] mt-1 pl-6.5 leading-relaxed">
                                            Enable to mark this user's email address as verified immediately without requiring email link confirmation.
                                        </p>
                                    </div>
                                )}

                            </div>

                            <div className="bg-[#FAF8F5] border-t border-[#EAE5DD] px-6 py-4 flex items-center justify-end space-x-2.5">
                                <button
                                    id="cancel-save-user-btn"
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-[#EAE5DD] bg-white px-4 py-2 font-sans text-xs font-semibold text-[#69718A] hover:text-[#202744] transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="submit-save-user-btn"
                                    type="submit"
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    className="flex items-center space-x-1.5 rounded-xl bg-[#8B6CF6] hover:bg-[#7A5CE6] px-5 py-2 font-sans text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-60"
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
