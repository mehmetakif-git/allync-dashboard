import { X } from 'lucide-react';

interface InstagramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  companyName: string;
  companyId: string;
  initialSettings?: any;
}

export default function InstagramSettingsModal({
  isOpen,
  onClose,
  onSave,
  companyName,
}: InstagramSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary border border-secondary rounded-xl max-w-2xl w-full">
        <div className="p-6 border-b border-secondary flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Instagram Settings</h2>
            <p className="text-sm text-muted mt-1">{companyName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-muted">Instagram settings configuration coming soon...</p>
        </div>
      </div>
    </div>
  );
}
