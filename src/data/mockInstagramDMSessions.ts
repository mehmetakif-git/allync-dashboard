export interface InstagramDMSession {
  id: string;
  company_id: string;
  user_id: string;
  username: string;
  profile_picture_url: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  message_count: number;
  is_active: boolean;
  status: 'active' | 'closed' | 'archived';
  session_start: string;
  session_end?: string;
  created_at: string;
  updated_at: string;
}

export const mockInstagramDMSessions: InstagramDMSession[] = [
  {
    id: 'ig_dm_session_1',
    company_id: '1',
    user_id: 'ig_user_1',
    username: '@ahmed_ali',
    profile_picture_url: 'https://i.pravatar.cc/150?img=12',
    last_message: 'Thank you for your help! Problem solved.',
    last_message_time: '2025-01-18T14:30:00Z',
    unread_count: 0,
    message_count: 12,
    is_active: false,
    status: 'closed',
    session_start: '2025-01-18T10:00:00Z',
    session_end: '2025-01-18T14:30:00Z',
    created_at: '2025-01-18T10:00:00Z',
    updated_at: '2025-01-18T14:30:00Z',
  },
  {
    id: 'ig_dm_session_2',
    company_id: '1',
    user_id: 'ig_user_2',
    username: '@fatima_hassan',
    profile_picture_url: 'https://i.pravatar.cc/150?img=5',
    last_message: 'What are your business hours?',
    last_message_time: '2025-01-18T15:45:00Z',
    unread_count: 2,
    message_count: 8,
    is_active: true,
    status: 'active',
    session_start: '2025-01-18T15:20:00Z',
    created_at: '2025-01-18T15:20:00Z',
    updated_at: '2025-01-18T15:45:00Z',
  },
  {
    id: 'ig_dm_session_3',
    company_id: '1',
    user_id: 'ig_user_3',
    username: '@mohammed_ibrahim',
    profile_picture_url: 'https://i.pravatar.cc/150?img=33',
    last_message: 'I need to track my order #12345',
    last_message_time: '2025-01-18T16:10:00Z',
    unread_count: 1,
    message_count: 5,
    is_active: true,
    status: 'active',
    session_start: '2025-01-18T16:00:00Z',
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-18T16:10:00Z',
  },
  {
    id: 'ig_dm_session_4',
    company_id: '1',
    user_id: 'ig_user_4',
    username: '@layla_ahmed',
    profile_picture_url: 'https://i.pravatar.cc/150?img=9',
    last_message: 'Can I change my delivery address?',
    last_message_time: '2025-01-18T13:20:00Z',
    unread_count: 0,
    message_count: 15,
    is_active: false,
    status: 'closed',
    session_start: '2025-01-18T11:00:00Z',
    session_end: '2025-01-18T13:20:00Z',
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-18T13:20:00Z',
  },
  {
    id: 'ig_dm_session_5',
    company_id: '1',
    user_id: 'ig_user_5',
    username: '@sara_mohammed',
    profile_picture_url: 'https://i.pravatar.cc/150?img=20',
    last_message: 'I received the wrong item',
    last_message_time: '2025-01-18T16:30:00Z',
    unread_count: 3,
    message_count: 9,
    is_active: true,
    status: 'active',
    session_start: '2025-01-18T16:00:00Z',
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-18T16:30:00Z',
  },
];
