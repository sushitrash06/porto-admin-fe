/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { 
  useBusinessServices, 
  useCreateBusinessService, 
  useUpdateBusinessService, 
  useDeleteBusinessService 
} from '../../hooks/useBusinessServices';
import type { BusinessService } from '../../types';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { 
  Briefcase, Plus, Edit, Trash2, ShieldAlert, Loader2, Globe, EyeOff, X
} from 'lucide-react';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

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
      isPublic
    };

    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        ...payload
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || 'Failed to update service.');
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
        onError: (err) => {
          setError(err.response?.data?.message || err.message || 'Failed to create service.');
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Service Offering',
      message: 'Are you sure you want to delete this service offering from your catalog? This will permanently remove the option.',
      onConfirm: () => {
        deleteMutation.mutate(id, {
          onError: (err) => {
            alert(err.response?.data?.message || err.message || 'Failed to delete service.');
          }
        });
      }
    });
  };

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter(svc => 
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (svc.description && svc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [services, searchQuery]);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'Custom Price';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header layout */}
      <div className="mb-6 border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
            Services Catalog
          </h2>
          <p className="font-sans text-xs text-neutral-450 mt-1">
            Build and organize commercial service offerings for potential business clients.
          </p>
        </div>

        <button
          id="create-new-service-btn"
          onClick={handleOpenCreate}
          className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs transition hover:bg-slate-800 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search Filter input */}
      {services && services.length > 0 && (
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by service name or keyword..."
            className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
          />
        </div>
      )}

      {/* Error block */}
      {isError && (
        <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs text-red-655 font-sans">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">Error loading services catalog</p>
            <p className="mt-1">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
          </div>
        </div>
      )}

      {/* Content representation */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-450">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400 mb-2" />
          <p className="font-sans text-xs">Querying services catalog...</p>
        </div>
      ) : !services || services.length === 0 ? (
        /* Empty State with CTA */
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-450 font-sans">
          <Briefcase className="mx-auto h-10 w-10 text-slate-300 mb-3 stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Your Services Catalog is Empty</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Create structured commercial listings specifying the description and entry pricing to promote your services.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center space-x-1.5 rounded-md bg-black px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Your First Service</span>
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-450 font-sans">
          <p className="text-xs">No services matched your query.</p>
        </div>
      ) : (
        /* Services grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map(svc => (
            <div 
              key={svc.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-3xs hover:border-slate-400 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/50">
                    <Briefcase className="h-4.5 w-4.5 text-slate-600" />
                  </div>
                  <span className={`inline-flex items-center space-x-0.5 rounded-md px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider border ${svc.isPublic 
                    ? 'bg-slate-50 text-slate-500 border-slate-200' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {svc.isPublic ? (
                      <>
                        <Globe className="h-2.5 w-2.5" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-2.5 w-2.5" />
                        <span>Private</span>
                      </>
                    )}
                  </span>
                </div>

                <h4 className="mt-4 font-sans text-sm font-bold text-slate-900 leading-snug">
                  {svc.name}
                </h4>
                <span className="inline-block mt-2 font-mono text-xs font-extrabold text-slate-950">
                  {formatPrice(svc.priceStartFrom)}
                </span>
                
                {svc.description && (
                  <p className="mt-3 font-sans text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end space-x-1.5 border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-slate-400 hover:text-black transition cursor-pointer"
                  title="Modify parameters"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-red-200 hover:text-red-650 hover:bg-red-50 transition cursor-pointer"
                  title="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <DialogTitle className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800">
                {editingService ? 'Edit Catalog Service' : 'Add Catalog Service'}
              </DialogTitle>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-650 font-sans font-semibold">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Service Name */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dedicated Development Team"
                  className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Price start from */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Starting Price (IDR)
                </label>
                <input
                  type="number"
                  value={priceStartFrom}
                  onChange={(e) => setPriceStartFrom(e.target.value)}
                  placeholder="e.g. 15000000 (leave blank for custom quote)"
                  className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide scope of services, tech stacks, or engagement rules..."
                  className="w-full rounded-md border border-slate-200 bg-slate-55 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[90px]"
                />
              </div>

              {/* Public visibility */}
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-sans text-xs font-bold text-slate-900">Showcase Visibility</h5>
                    <p className="font-sans text-[10px] text-slate-400">Specify if this service is listed publicly.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-55 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-md bg-black px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-3 w-3 animate-spin mr-1 inline" />
                  )}
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete Service"
        cancelText="Keep Service"
        variant="danger"
      />
    </div>
  );
};
