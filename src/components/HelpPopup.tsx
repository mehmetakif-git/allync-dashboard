import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function HelpPopup({ isOpen, onClose, title, children }: HelpPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-gradient-to-br from-secondary/95 via-primary/95 to-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-secondary/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable help content components
export function SheetIDHelp() {
  return (
    <div className="space-y-4 text-white">
      <p className="text-sm text-muted">
        Google Sheet ID'nizi bulmak için aşağıdaki adımları izleyin:
      </p>

      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            1
          </div>
          <div>
            <p className="font-medium">Google Sheets dosyanızı açın</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            2
          </div>
          <div>
            <p className="font-medium">Tarayıcı adres çubuğuna bakın</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            3
          </div>
          <div>
            <p className="font-medium mb-2">URL şu formatta olacak:</p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs font-mono text-muted">
                https://docs.google.com/spreadsheets/d/
              </p>
              <p className="text-xs font-mono text-green-400 font-bold">
                1ABC123XYZ789
              </p>
              <p className="text-xs font-mono text-muted">
                /edit#gid=0
              </p>
            </div>
            <p className="text-xs text-green-400 mt-2">
              ↑ Bu kısım Sheet ID'dir!
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            4
          </div>
          <div>
            <p className="font-medium">Bu kısmı kopyalayıp yapıştırın</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalendarIDHelp() {
  return (
    <div className="space-y-4 text-white">
      <p className="text-sm text-muted">
        Google Calendar ID'nizi bulmak için aşağıdaki adımları izleyin:
      </p>

      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            1
          </div>
          <div>
            <p className="font-medium">Google Calendar'ı açın</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            2
          </div>
          <div>
            <p className="font-medium">Sol tarafta calendar'ınızın yanındaki "..." ya tıklayın</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            3
          </div>
          <div>
            <p className="font-medium">"Settings and sharing" seçin</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            4
          </div>
          <div>
            <p className="font-medium">Aşağı kaydırın</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            5
          </div>
          <div>
            <p className="font-medium">"Integrate calendar" bölümünü bulun</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            6
          </div>
          <div>
            <p className="font-medium mb-2">"Calendar ID" yazan kısmı kopyalayın</p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs font-mono text-green-400 font-bold">
                sales@group.calendar.google.com
              </p>
              <p className="text-xs text-muted mt-1">veya</p>
              <p className="text-xs font-mono text-green-400 font-bold">
                primary
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
