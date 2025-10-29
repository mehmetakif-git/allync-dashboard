import { useState, Fragment } from 'react';
import { X, AlertTriangle, Wrench, PauseCircle, Ban, CheckCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

interface ServiceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  serviceName: string;
  currentStatus: 'active' | 'maintenance' | 'suspended' | 'inactive';
  newStatus: 'active' | 'maintenance' | 'suspended' | 'inactive';
  companyName: string;
  isLoading?: boolean;
}

export default function ServiceStatusModal({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  currentStatus,
  newStatus,
  companyName,
  isLoading = false
}: ServiceStatusModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          title: 'Activate Service',
          description: 'Company will have full access to this service'
        };
      case 'maintenance':
        return {
          icon: Wrench,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          title: 'Set to Maintenance Mode',
          description: 'Service will be visible but show maintenance warning to company admin'
        };
      case 'suspended':
        return {
          icon: PauseCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          title: 'Suspend Service',
          description: 'Service access will be temporarily restricted'
        };
      case 'inactive':
        return {
          icon: Ban,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-secondary/30',
          title: 'Deactivate Service',
          description: 'Service will be completely hidden from company catalog and sidebar'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-secondary/30',
          title: 'Change Status',
          description: 'Update service status'
        };
    }
  };

  const statusInfo = getStatusInfo(newStatus);
  const StatusIcon = statusInfo.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Require reason for certain status changes
    if ((newStatus === 'maintenance' || newStatus === 'suspended' || newStatus === 'inactive') && !reason.trim()) {
      setError('Please provide a reason for this status change');
      return;
    }

    try {
      await onConfirm(reason.trim());
      handleClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-secondary border border-secondary shadow-2xl transition-all">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-secondary">
                  <Dialog.Title className="text-xl font-bold text-white flex items-center gap-3">
                    <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                    {statusInfo.title}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-muted hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Service Info */}
                  <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg p-4 space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">Service:</span>
                      <span className="text-white font-medium">{serviceName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">Company:</span>
                      <span className="text-white font-medium">{companyName}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-secondary/50 pt-2">
                      <span className="text-muted text-sm">Status Change:</span>
                      <span className="text-white font-medium">
                        <span className="capitalize">{currentStatus}</span>
                        {' → '}
                        <span className={`capitalize font-bold ${statusInfo.color}`}>{newStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-primary/50 rounded-lg p-4">
                    <p className="text-white text-sm leading-relaxed">
                      {statusInfo.description}
                    </p>
                  </div>

                  {/* Warning for sensitive actions */}
                  {(newStatus === 'inactive' || newStatus === 'suspended') && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-sm font-medium">Warning</p>
                        <p className="text-red-300/70 text-xs mt-1">
                          {newStatus === 'inactive'
                            ? 'Company will completely lose access to this service'
                            : 'This will restrict access to the service'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reason Input */}
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Reason {(newStatus === 'maintenance' || newStatus === 'suspended' || newStatus === 'inactive') && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={isLoading}
                      rows={3}
                      placeholder={
                        newStatus === 'maintenance'
                          ? 'e.g., System upgrade, bug fixes, performance improvements...'
                          : newStatus === 'suspended'
                          ? 'e.g., Payment overdue, policy violation...'
                          : newStatus === 'inactive'
                          ? 'e.g., Service discontinued, contract ended...'
                          : 'Optional reason for status change...'
                      }
                      className={`w-full px-4 py-3 bg-primary border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50 ${
                        error ? 'border-red-500' : 'border-secondary'
                      }`}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {newStatus === 'maintenance'
                        ? 'This reason will be visible to company admins'
                        : 'This reason is for internal tracking only'
                      }
                    </p>
                  </div>
                </form>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary bg-primary/30">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary hover:bg-secondary border border-secondary text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                      newStatus === 'active'
                        ? 'bg-green-600 hover:bg-green-700'
                        : newStatus === 'maintenance'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : newStatus === 'suspended'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <StatusIcon className="w-4 h-4" />
                        Confirm Change
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}