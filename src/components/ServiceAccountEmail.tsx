import React, { useState } from 'react';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface ServiceAccountEmailProps {
  email?: string;
  variant?: 'sheets' | 'calendar';
}

const DEFAULT_EMAIL = 'allync-bot@allync-platform.iam.gserviceaccount.com';

export default function ServiceAccountEmail({
  email = DEFAULT_EMAIL,
  variant = 'sheets'
}: ServiceAccountEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getInstructions = () => {
    if (variant === 'sheets') {
      return {
        title: 'Nasıl Paylaşırım?',
        steps: [
          'Google Sheets\'inizi açın',
          '"Share" butonuna tıklayın',
          'Bu email\'i ekleyin',
          'Rol: "Editor" seçin',
          '"Share" yapın'
        ]
      };
    } else {
      return {
        title: 'Nasıl Paylaşırım?',
        steps: [
          'Google Calendar\'ı açın',
          'Sol tarafta calendar\'ınızın yanındaki "..." tıklayın',
          '"Settings and sharing" seçin',
          '"Share with specific people" bölümüne gidin',
          'Bu email\'i ekleyin',
          'İzin: "Make changes to events" seçin',
          '"Send" yapın'
        ]
      };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-400 mb-2">
            ⚠️ {instructions.title}
          </h4>

          <ol className="text-xs text-muted space-y-1 mb-3 list-decimal list-inside">
            {instructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
            <code className="text-xs font-mono text-white flex-1 break-all">
              {email}
            </code>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
              title="Kopyala"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Kopyala
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted mt-2">
            💡 Bu email'i {variant === 'sheets' ? 'Sheet\'inizle' : 'Calendar\'ınızla'} paylaşmayı unutmayın!
          </p>
        </div>
      </div>
    </div>
  );
}
