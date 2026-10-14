/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  useBusinessServices,
  useCreateBusinessService,
  useUpdateBusinessService,
  useDeleteBusinessService,
} from '../../hooks/useBusinessServices';
import type { BusinessService } from '../../types';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import {
  Briefcase, Plus, Edit, Trash2, ShieldAlert, Loader2, X,
  Search
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { EmptyState } from '../molecules/EmptyState';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

export const BusinessServices: React.FC = () => {
  // Queries
  const { data: services, isLoading, isError, error: fetchError } = useBusinessServices();
  const createMutation = useCreateBusinessService();
  const updateMutation = useUpdateBusinessService();
  const deleteMutation = useDeleteBusinessService();

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Dialog Form States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<BusinessService | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceStartFrom, setPriceStartFrom] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Validation/Error states
  const [error, setError] = useState<string>('');

  // Confirm delete Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleOpenCreate = () => {
    setError('');
    setEditingService(null);
    setName('');
    setDescription('');
    setPriceStartFrom('');
    setIsPublic(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: BusinessService) => {
    setError('');
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description || '');
    setPriceStartFrom(svc.priceStartFrom?.toString() || '');
    setIsPublic(svc.isPublic);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Service Name is required.');
      return;
    }

    const price = priceStartFrom.trim() ? parseFloat(priceStartFrom) : undefined;
    if (priceStartFrom.trim() && (isNaN(price!) || price! < 0)) {
      setError('Price must be a valid positive number.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      priceStartFrom: price,
      isPublic,
    };

    if (editingService) {
      updateMutation.mutate(
        {
          id: editingService.id,
          ...payload,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
          onError: (err) => {
            setError(err.response?.data?.message || err.message || 'Failed to update service.');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || 'Failed to create service.');
        },
      });
    }
  };

  const handleDelete = (svc: BusinessService) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Service Offering',
      message: `Are you sure you want to delete "${svc.name}"? This will remove it from your live business catalog.`,
      onConfirm: () => {
        deleteMutation.mutate(svc.id);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, searchQuery]);

  // Formatter for Indonesian Rupiah
  const formatRupiah = (price?: number) => {
    if (price === undefined || price === null) return null;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6 font-sans text-[#202744]">
      {/* Header */}
      <div className="mb-6 border-b border-[#F0EBE3] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-[#202744]">
              Services Catalog
            </h2>
            <Badge variant="blue">Commercial Packages</Badge>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#69718A]">
            Build and organize commercial service offerings for potential clients and prospective leads.
          </p>
        </div>

        <Button
          id="create-new-service-btn"
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Service
        </Button>
      </div>

      {/* Search Filter input */}
      {services && services.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#69718A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by service name or keyword..."
            className="w-full rounded-xl border border-[#E5E1DA] bg-[#FAF8F5] py-2 pr-4 pl-10 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden text-[#202744] placeholder-[#69718A] transition-all"
          />
        </div>
      )}

      {/* Error block */}
      {isError && (
        <div className="flex items-start space-x-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="font-bold">Error loading services catalog</p>
            <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to server.'}</p>
          </div>
        </div>
      )}

      {/* Content representation */}
      {isLoading ? (
        <div className="rounded-3xl border border-[#EAE5DD] bg-white p-12 text-center text-[#69718A]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#8B6CF6] mb-2" />
          <p className="font-sans text-xs font-semibold">Querying services catalog...</p>
        </div>
      ) : !services || services.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6 text-[#8B6CF6]" />}
          title="Your Services Catalog is Empty"
          description="Create structured commercial listings specifying the package description and entry pricing to promote your services to prospective clients."
          actionText="Create Your First Service"
          actionIcon={<Plus className="h-4 w-4" />}
          onAction={handleOpenCreate}
        />
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E1DA] bg-white p-10 text-center text-[#69718A]">
          <p className="text-xs">No services match your search query.</p>
        </div>
      ) : (
        /* Services grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col justify-between rounded-3xl border border-[#EAE5DD] bg-white p-5 shadow-3xs hover:border-[#8B6CF6]/40 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6] border border-[#D5C6FF]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Badge variant={svc.isPublic ? 'success' : 'secondary'} size="xs">
                    {svc.isPublic ? 'Published' : 'Hidden'}
                  </Badge>
                </div>

                <h3 className="font-sans text-sm font-bold text-[#202744] mb-1.5 leading-snug">
                  {svc.name}
                </h3>

                {svc.description ? (
                  <p className="font-sans text-xs text-[#69718A] line-clamp-3 mb-4 leading-relaxed">
                    {svc.description}
                  </p>
                ) : (
                  <p className="font-sans text-xs text-slate-400 italic mb-4">
                    No description provided.
                  </p>
                )}
              </div>

              <div className="border-t border-[#F0EBE3] pt-3 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#69718A]">
                    Starting From
                  </span>
                  <span className="font-mono text-xs font-bold text-[#4697F5]">
                    {formatRupiah(svc.priceStartFrom) || 'Negotiable'}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1.5 text-[#69718A] hover:text-[#8B6CF6] hover:bg-[#FAF8F5] rounded-lg transition cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(svc)}
                    className="p-1.5 text-[#69718A] hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50 font-sans"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg rounded-3xl border border-[#EAE5DD] bg-white p-7 text-[#202744] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-4 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8E0FF] text-[#8B6CF6]">
                  <Briefcase className="h-4 w-4" />
                </div>
                <DialogTitle className="font-sans text-base font-bold text-[#202744]">
                  {editingService ? 'Edit Service Offering' : 'Create New Service Offering'}
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#69718A] hover:text-[#202744] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start space-x-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="font-sans font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Full-Stack Web Development, UI/UX Audit"
                  className="w-full rounded-xl border border-[#E5E1DA] bg-white px-3.5 py-2.5 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Service Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the deliverables, timeline, or scope of work included in this package..."
                  rows={4}
                  className="w-full rounded-xl border border-[#E5E1DA] bg-white px-3.5 py-2.5 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#202744] mb-1.5">
                  Starting Price (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={priceStartFrom}
                  onChange={(e) => setPriceStartFrom(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full rounded-xl border border-[#E5E1DA] bg-white px-3.5 py-2.5 font-sans text-xs text-[#202744] placeholder-[#69718A] focus:border-[#8B6CF6] focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 transition-all"
                />
                <p className="mt-1 font-sans text-[11px] text-[#69718A]">
                  Leave empty if pricing is based on custom consultation.
                </p>
              </div>

              {/* Visibility Switch */}
              <div className="rounded-2xl border border-[#EAE5DD] bg-[#FAF8F5] p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#202744]">
                    Public Visibility
                  </h4>
                  <p className="font-sans text-[11px] text-[#69718A]">
                    Display this service publicly on your commercial catalog.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                  <span className="ml-2.5 font-sans text-xs font-bold text-[#202744]">
                    {isPublic ? 'Public' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#F0EBE3] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E5E1DA] bg-white px-4 py-2 font-sans text-xs font-semibold text-[#69718A] hover:bg-[#FAF8F5] hover:text-[#202744] transition"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingService ? 'Save Changes' : 'Publish Service'}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
