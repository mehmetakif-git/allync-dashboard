import { X, Send, Mail } from 'lucide-react';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactAdminModal({ isOpen, onClose }: ContactAdminModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Need Help?</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Send className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-400 font-medium mb-1">Contact Your Administrator</p>
                <p className="text-gray-300 text-sm mb-3">
                  For password resets, account access, or technical support, please contact your system administrator.
                </p>
                
                  href="mailto:info@allyncai.com?subject=Account%20Access%20Request&body=Hello,%0D%0A%0D%0AI need assistance with:%0D%0A%0D%0AName:%0D%0AEmail:%0D%0ACompany:%0D%0AIssue:"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Administrator
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">📧 Support Email:</p>
            <p className="text-sm text-white font-mono">info@allyncai.com</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}