export interface InstagramDMMessage {
  id: string;
  session_id: string;
  company_id: string;
  user_id: string;
  sender: 'customer' | 'bot' | 'agent';
  sender_name: string;
  message_text: string;
  message_owner: 'incoming' | 'outgoing';
  message_type: 'text' | 'image' | 'audio' | 'video';
  media_url?: string;
  timestamp: string;
  created_at: string;
}

const session1Messages: InstagramDMMessage[] = [
  {
    id: 'ig_dm_msg_1_1',
    session_id: 'ig_dm_session_1',
    company_id: '1',
    user_id: 'ig_user_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_text: 'Hi, I need help with my recent order',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T10:00:00Z',
    created_at: '2025-01-18T10:00:00Z',
  },
  {
    id: 'ig_dm_msg_1_2',
    session_id: 'ig_dm_session_1',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Instagram Bot',
    message_text: "Hello Ahmed! I'd be happy to help. What's your order number?",
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T10:01:30Z',
    created_at: '2025-01-18T10:01:30Z',
  },
  {
    id: 'ig_dm_msg_1_3',
    session_id: 'ig_dm_session_1',
    company_id: '1',
    user_id: 'ig_user_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_text: 'Order #12345',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T10:02:00Z',
    created_at: '2025-01-18T10:02:00Z',
  },
  {
    id: 'ig_dm_msg_1_4',
    session_id: 'ig_dm_session_1',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Instagram Bot',
    message_text: "Let me check that for you... I found your order! It was placed on January 15th. How can I help you with it?",
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T10:03:00Z',
    created_at: '2025-01-18T10:03:00Z',
  },
  {
    id: 'ig_dm_msg_1_5',
    session_id: 'ig_dm_session_1',
    company_id: '1',
    user_id: 'ig_user_1',
    sender: 'customer',
    sender_name: 'Ahmed Ali',
    message_text: 'Perfect! Thank you for your help! Problem solved.',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T14:30:00Z',
    created_at: '2025-01-18T14:30:00Z',
  },
];

const session2Messages: InstagramDMMessage[] = [
  {
    id: 'ig_dm_msg_2_1',
    session_id: 'ig_dm_session_2',
    company_id: '1',
    user_id: 'ig_user_2',
    sender: 'customer',
    sender_name: 'Fatima Hassan',
    message_text: "Hello, I'm interested in your products",
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T15:20:00Z',
    created_at: '2025-01-18T15:20:00Z',
  },
  {
    id: 'ig_dm_msg_2_2',
    session_id: 'ig_dm_session_2',
    company_id: '1',
    user_id: 'bot',
    sender: 'bot',
    sender_name: 'Instagram Bot',
    message_text: 'Welcome! We have a wide range of products. What are you looking for?',
    message_owner: 'outgoing',
    message_type: 'text',
    timestamp: '2025-01-18T15:21:00Z',
    created_at: '2025-01-18T15:21:00Z',
  },
  {
    id: 'ig_dm_msg_2_3',
    session_id: 'ig_dm_session_2',
    company_id: '1',
    user_id: 'ig_user_2',
    sender: 'customer',
    sender_name: 'Fatima Hassan',
    message_text: 'What are your business hours?',
    message_owner: 'incoming',
    message_type: 'text',
    timestamp: '2025-01-18T15:45:00Z',
    created_at: '2025-01-18T15:45:00Z',
  },
];

export const mockInstagramDMMessages: Record<string, InstagramDMMessage[]> = {
  ig_dm_session_1: session1Messages,
  ig_dm_session_2: session2Messages,
};

export const getAllInstagramDMMessages = (): InstagramDMMessage[] => {
  return Object.values(mockInstagramDMMessages).flat();
};
