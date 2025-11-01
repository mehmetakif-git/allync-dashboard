import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  MoreVertical,
  FileText,
  ExternalLink,
  Clock,
  Check,
  CheckCheck,
  User,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { WhatsAppMessage, SessionWithMessages, IntegrationType, IntegrationAction } from '../../types/whatsapp';
import { getSessionById } from '../../lib/api/whatsappSessions';
import { formatMessageTime, formatPhoneNumber, getIntegrationIcon, getIntegrationLabel } from '../../lib/utils/whatsappFormatters';
import { getIntegrationRoute } from '../../lib/utils/integrationHelpers';

interface ConversationDetailProps {
  sessionId: string;
  onClose: () => void;
}

export default function ConversationDetail({ sessionId, onClose }: ConversationDetailProps) {
  const [session, setSession] = useState<SessionWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const loadSession = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIntegrationClick = (action: IntegrationAction) => {
    const route = getIntegrationRoute(action.type, action.id);
    window.open(route, '_blank');
  };

  const renderMessageBubble = (message: WhatsAppMessage) => {
    const isCustomer = message.sender === 'customer';
    const isBot = message.sender === 'bot';
    const isAgent = message.sender === 'agent';

    return (
      <div
        key={message.id}
        className={`flex items-start gap-3 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isCustomer
            ? 'bg-green-500/20'
            : isBot
              ? 'bg-blue-500/20'
              : 'bg-purple-500/20'
        }`}>
          {isCustomer ? (
            <User className="w-4 h-4 text-green-400" />
          ) : isBot ? (
            <span className="text-xs font-bold text-blue-400">AI</span>
          ) : (
            <User className="w-4 h-4 text-purple-400" />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col max-w-[70%] ${isCustomer ? 'items-end' : 'items-start'}`}>
          {/* Sender Name */}
          <span className="text-xs text-muted mb-1">
            {isCustomer
              ? session?.customer_name || 'Customer'
              : isBot
                ? 'AI Assistant'
                : 'Support Agent'
            }
          </span>

          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-2.5 ${
            isCustomer
              ? 'bg-green-500/20 rounded-tr-sm'
              : 'bg-secondary/80 rounded-tl-sm'
          }`}>
            {/* Text Message */}
            {message.message_type === 'text' && (
              <p className="text-sm text-white whitespace-pre-wrap break-words">
                {message.message_body}
              </p>
            )}

            {/* Image Message */}
            {message.message_type === 'image' && (
              <div className="space-y-2">
                {message.media_url && (
                  <img
                    src={message.media_url}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                  />
                )}
                {message.message_body && (
                  <p className="text-sm text-white">{message.message_body}</p>
                )}
              </div>
            )}

            {/* Document Message */}
            {message.message_type === 'document' && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <FileText className="w-8 h-8 text-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {message.media_name || 'Document'}
                  </p>
                  <p className="text-xs text-muted">
                    {message.media_size ? `${(message.media_size / 1024).toFixed(1)} KB` : 'Document file'}
                  </p>
                </div>
                {message.media_url && (
                  <a
                    href={message.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted" />
                  </a>
                )}
              </div>
            )}

            {/* Audio Message */}
            {message.message_type === 'audio' && (
              <div className="flex items-center gap-3">
                <div className="w-48 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  <p className="text-xs text-muted">Audio message</p>
                </div>
              </div>
            )}

            {/* Video Message */}
            {message.message_type === 'video' && (
              <div className="space-y-2">
                {message.media_url && (
                  <video
                    src={message.media_url}
                    controls
                    className="rounded-lg max-w-full"
                  />
                )}
                {message.message_body && (
                  <p className="text-sm text-white">{message.message_body}</p>
                )}
              </div>
            )}

            {/* AI Intent Badge */}
            {message.ai_intent && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 rounded-md">
                <span className="text-xs text-blue-400">Intent: {message.ai_intent}</span>
              </div>
            )}
          </div>

          {/* Message Meta */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">
              {formatMessageTime(message.created_at)}
            </span>

            {/* Delivery Status (for outgoing messages) */}
            {!isCustomer && (
              <div>
                {message.status === 'delivered' && (
                  <CheckCheck className="w-3 h-3 text-muted" />
                )}
                {message.status === 'read' && (
                  <CheckCheck className="w-3 h-3 text-blue-400" />
                )}
                {message.status === 'sent' && (
                  <Check className="w-3 h-3 text-muted" />
                )}
              </div>
            )}
          </div>

          {/* Integration Actions */}
          {message.triggered_integrations && message.triggered_integrations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.triggered_integrations.map((integration: string, idx: number) => {
                const IntegrationIcon = getIntegrationIcon(integration as IntegrationType);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      // Create a dummy action for navigation
                      const action: IntegrationAction = {
                        type: integration as IntegrationType,
                        id: message.id, // Use message ID as fallback
                        label: getIntegrationLabel(integration as IntegrationType),
                        timestamp: message.created_at
                      };
                      handleIntegrationClick(action);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md transition-colors group"
                  >
                    <IntegrationIcon className="w-3 h-3 text-muted group-hover:text-white" />
                    <span className="text-xs text-muted group-hover:text-white">
                      {getIntegrationLabel(integration as IntegrationType)}
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Session not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-green-400" />
            </div>
            {session.is_active && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {session.customer_name || 'Unknown Customer'}
            </h3>
            <p className="text-xs text-muted">
              {formatPhoneNumber(session.customer_phone || '')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-muted" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-muted" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-muted" />
          </button>
        </div>
      </div>

      {/* Integration Summary Banner */}
      {session.integration_actions && session.integration_actions.length > 0 && (
        <div className="p-3 bg-blue-500/10 border-b border-blue-500/20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-blue-400 font-medium">Active Integrations:</span>
            {session.integration_actions.map((action) => {
              const IntegrationIcon = getIntegrationIcon(action.type);
              return (
                <button
                  key={action.id}
                  onClick={() => handleIntegrationClick(action)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-md transition-colors"
                >
                  <IntegrationIcon className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400">{action.label}</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted">No messages yet</p>
          </div>
        ) : (
          <>
            {session.messages.map((message) => renderMessageBubble(message))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Compact Warning Banner */}
      <div className="border-t border-white/10 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-sm">
        {/* Compact View */}
        <button
          onClick={() => setShowWarning(!showWarning)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                ⚠️ WhatsApp Automation Active - Important Warning
              </p>
              <p className="text-xs text-red-300">
                DO NOT send manual messages • Read-only view • Click for details
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted transition-transform ${showWarning ? 'rotate-180' : ''}`} />
        </button>

        {/* Expanded Details */}
        {showWarning && (
          <div className="border-t border-white/10 bg-black/20 px-4 py-4 animate-in slide-in-from-top">
            <div className="space-y-3 text-xs text-white/90">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="font-bold text-orange-300 mb-2">
                  🚫 CRITICAL: Never Send Manual WhatsApp Messages
                </p>
                <ul className="space-y-1 text-white/80 ml-4 list-disc">
                  <li>✅ You CAN: <span className="text-green-400">View & Login</span> to WhatsApp</li>
                  <li>❌ You CANNOT: <span className="text-red-400">Send manual messages</span></li>
                  <li>⚠️ Manual messages = <span className="text-red-400">System timeout & failure</span></li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                <p className="text-red-300 font-semibold text-center">
                  ⚡ Errors from manual messaging NOT covered by Allync AI
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                <p className="text-blue-300">
                  🕐 This dashboard is read-only
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
