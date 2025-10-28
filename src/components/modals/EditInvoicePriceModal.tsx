import { useState, Fragment } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

interface EditInvoicePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newAmount: number) => Promise<void>;
  currentAmount: number;
  invoiceNumber: string;
  companyName: string;
  isLoading?: boolean;
}

export default function EditInvoicePriceModal({
  isOpen,
  onClose,
  onSubmit,
  currentAmount,
  invoiceNumber,
  companyName,
  isLoading = false
}: EditInvoicePriceModalProps) {
  const [newAmount, setNewAmount] = useState<string>(currentAmount.toString());
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(newAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      await onSubmit(amount);
      handleClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  const handleClose = () => {
    setNewAmount(currentAmount.toString());
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-secondary border border-secondary shadow-2xl transition-all">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-secondary">
                  <Dialog.Title className="text-xl font-bold text-white flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-blue-500" />
                    Edit Invoice Amount
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
                  {/* Invoice Info */}
                  <div className="bg-primary/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted text-sm">Invoice Number:</span>
                      <span className="text-white font-mono font-medium">{invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted text-sm">Company:</span>
                      <span className="text-white font-medium">{companyName}</span>
                    </div>
                    <div className="flex justify-between border-t border-secondary pt-2">
                      <span className="text-muted text-sm">Current Amount:</span>
                      <span className="text-blue-400 font-bold">${currentAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-400 text-sm font-medium">Important</p>
                      <p className="text-orange-300/70 text-xs mt-1">
                        This will update the invoice amount. Make sure the new amount is correct.
                      </p>
                    </div>
                  </div>

                  {/* New Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      New Amount (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        disabled={isLoading}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3 bg-primary border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 ${
                          error ? 'border-red-500' : 'border-secondary'
                        }`}
                        autoFocus
                      />
                    </div>
                    {error && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    )}
                  </div>
                </form>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary">
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
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4" />
                        Update Amount
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
