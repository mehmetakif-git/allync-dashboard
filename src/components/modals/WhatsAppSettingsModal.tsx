import { X } from 'lucide-react';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  companyName: string;
  companyId: string;
  initialSettings?: any;
}

export default function WhatsAppSettingsModal({
  isOpen,
  onClose,
  onSave,
  companyName,
}: WhatsAppSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">WhatsApp Settings</h2>
            <p className="text-sm text-gray-400 mt-1">{companyName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-400">WhatsApp settings configuration coming soon...</p>
        </div>
      </div>
    </div>
  );
}
