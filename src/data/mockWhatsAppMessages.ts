export interface WhatsAppMessage {
  id: string;
  session_id: string;
  company_id: string;
  user_id: string;
  sender: 'customer' | 'bot' | 'agent';
  sender_name: string;
  message_body: string;
  message_owner: 'incoming' | 'outgoing';
  message_type: 'text' | 'image' | 'audio' | 'document';
  media_url?: string;
  timestamp: string;
  created_at: string;
}

const session1Messages: WhatsAppMessage[] = [
  {
    id: 'msg_1_1',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'customer_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_body: 'Hi, I need help with my recent order',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T10:00:00Z',
    created_at: '2025-01-18T10:00:00Z',
  },
  {
    id: 'msg_1_2',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Tech Support Bot',
    message_body: 'Hello Ahmed! I\'d be happy to help. What\'s your order number?',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T10:01:30Z',
    created_at: '2025-01-18T10:01:30Z',
  },
  {
    id: 'msg_1_3',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'customer_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_body: 'Order #12345',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T10:02:00Z',
    created_at: '2025-01-18T10:02:00Z',
  },
  {
    id: 'msg_1_4',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Tech Support Bot',
    message_body: 'Let me check that for you... I found your order! It was placed on January 15th. How can I help you with it?',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T10:03:00Z',
    created_at: '2025-01-18T10:03:00Z',
  },
  {
    id: 'msg_1_5',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'customer_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_body: 'I haven\'t received it yet. When will it arrive?',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T10:04:00Z',
    created_at: '2025-01-18T10:04:00Z',
  },
  {
    id: 'msg_1_6',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Tech Support Bot',
    message_body: 'Your order is currently in transit. The estimated delivery date is January 20th. You can track it here: [Tracking Link]',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T10:05:30Z',
    created_at: '2025-01-18T10:05:30Z',
  },
  {
    id: 'msg_1_7',
    session_id: 'wa_session_1',
    company_id: '1',
    user_id: 'customer_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_body: 'Perfect! Thank you for your help! Problem solved.',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T14:30:00Z',
    created_at: '2025-01-18T14:30:00Z',
  },
];

const session2Messages: WhatsAppMessage[] = [
  {
    id: 'msg_2_1',
    session_id: 'wa_session_2',
    company_id: '1',
    user_id: 'customer_2',
    sender: 'customer',
    sender_name: 'Fatima Hassan',
    message_body: 'Hello, I\'m interested in your products',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T15:20:00Z',
    created_at: '2025-01-18T15:20:00Z',
  },
  {
    id: 'msg_2_2',
    session_id: 'wa_session_2',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Tech Support Bot',
    message_body: 'Welcome! We have a wide range of products. What are you looking for?',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T15:21:00Z',
    created_at: '2025-01-18T15:21:00Z',
  },
  {
    id: 'msg_2_3',
    session_id: 'wa_session_2',
    company_id: '1',
    user_id: 'customer_2',
    sender: 'customer',
    sender_name: 'Fatima Hassan',
    message_body: 'Do you have wireless headphones?',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T15:25:00Z',
    created_at: '2025-01-18T15:25:00Z',
  },
  {
    id: 'msg_2_4',
    session_id: 'wa_session_2',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Tech Support Bot',
    message_body: 'Yes! We have several models. Here are our top picks: [Product Links]',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T15:26:00Z',
    created_at: '2025-01-18T15:26:00Z',
  },
  {
    id: 'msg_2_5',
    session_id: 'wa_session_2',
    company_id: '1',
    user_id: 'customer_2',
    sender: 'customer',
    sender_name: 'Fatima Hassan',
    message_body: 'Great! What are your business hours?',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T15:45:00Z',
    created_at: '2025-01-18T15:45:00Z',
  },
];

const session3Messages: WhatsAppMessage[] = [
  {
    id: 'msg_3_1',
    session_id: 'wa_session_3',
    company_id: '1',
    user_id: 'customer_3',
    sender: 'customer',
    sender_name: 'Mohammed Ibrahim',
    message_body: 'Hi',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T16:00:00Z',
    created_at: '2025-01-18T16:00:00Z',
  },
  {
    id: 'msg_3_2',
    session_id: 'wa_session_3',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Tech Support Bot',
    message_body: 'Hello Mohammed! How can I assist you today?',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T16:01:00Z',
    created_at: '2025-01-18T16:01:00Z',
  },
  {
    id: 'msg_3_3',
    session_id: 'wa_session_3',
    company_id: '1',
    user_id: 'customer_3',
    sender: 'customer',
    sender_name: 'Mohammed Ibrahim',
    message_body: 'I need to track my order #12345',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T16:10:00Z',
    created_at: '2025-01-18T16:10:00Z',
  },
];

export const mockWhatsAppMessages: Record<string, WhatsAppMessage[]> = {
  wa_session_1: session1Messages,
  wa_session_2: session2Messages,
  wa_session_3: session3Messages,
};

export const getAllWhatsAppMessages = (): WhatsAppMessage[] => {
  return Object.values(mockWhatsAppMessages).flat();
};
