export interface InstagramPost {
  id: string;
  company_id: string;
  post_id: string;
  caption: string;
  image_url: string;
  comment_count: number;
  last_comment_time: string;
  created_at: string;
}

export interface InstagramComment {
  id: string;
  company_id: string;
  post_id: string;
  comment_id: string;
  username: string;
  profile_picture_url: string;
  comment_text: string;
  bot_response?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  is_bot_reply: boolean;
  created_at: string;
  responded_at?: string;
}

export const mockInstagramPosts: InstagramPost[] = [
  {
    id: 'ig_post_1',
    company_id: '1',
    post_id: 'post_12345',
    caption: 'Check out our new AI automation tool! 🚀 Transform your business with intelligent automation.',
    image_url: 'https://picsum.photos/seed/ai-tool/600/600',
    comment_count: 8,
    last_comment_time: '2025-01-18T16:30:00Z',
    created_at: '2025-01-18T12:00:00Z',
  },
  {
    id: 'ig_post_2',
    company_id: '1',
    post_id: 'post_67890',
    caption: 'Special offer this week! 🎉 50% off on all automation packages. DM us for details!',
    image_url: 'https://picsum.photos/seed/special-offer/600/600',
    comment_count: 12,
    last_comment_time: '2025-01-18T15:20:00Z',
    created_at: '2025-01-18T09:00:00Z',
  },
  {
    id: 'ig_post_3',
    company_id: '1',
    post_id: 'post_11223',
    caption: 'Customer success story 💪 How we helped @company increase engagement by 300%!',
    image_url: 'https://picsum.photos/seed/success-story/600/600',
    comment_count: 15,
    last_comment_time: '2025-01-18T14:45:00Z',
    created_at: '2025-01-17T18:00:00Z',
  },
  {
    id: 'ig_post_4',
    company_id: '1',
    post_id: 'post_44556',
    caption: 'Behind the scenes 👀 Our team working on amazing new features!',
    image_url: 'https://picsum.photos/seed/behind-scenes/600/600',
    comment_count: 6,
    last_comment_time: '2025-01-18T11:30:00Z',
    created_at: '2025-01-17T14:00:00Z',
  },
];

export const mockInstagramComments: InstagramComment[] = [
  {
    id: 'ig_comment_1',
    company_id: '1',
    post_id: 'ig_post_1',
    comment_id: 'comment_1001',
    username: '@john_tech',
    profile_picture_url: 'https://i.pravatar.cc/150?img=15',
    comment_text: 'This looks amazing! How can I get started?',
    bot_response: 'Thanks John! Getting started is easy! Visit our website or DM us for a personalized demo. We\'d love to show you how our AI automation can transform your workflow! 🚀',
    sentiment: 'positive',
    is_bot_reply: true,
    created_at: '2025-01-18T14:30:00Z',
    responded_at: '2025-01-18T14:32:00Z',
  },
  {
    id: 'ig_comment_2',
    company_id: '1',
    post_id: 'ig_post_1',
    comment_id: 'comment_1002',
    username: '@sarah_digital',
    profile_picture_url: 'https://i.pravatar.cc/150?img=25',
    comment_text: 'Interesting! Does it integrate with existing tools?',
    bot_response: 'Great question, Sarah! Yes, our platform integrates with 100+ tools including Slack, Google Workspace, Salesforce, and more. We also offer custom integrations! 🔗',
    sentiment: 'positive',
    is_bot_reply: true,
    created_at: '2025-01-18T15:15:00Z',
    responded_at: '2025-01-18T15:17:00Z',
  },
  {
    id: 'ig_comment_3',
    company_id: '1',
    post_id: 'ig_post_1',
    comment_id: 'comment_1003',
    username: '@tech_enthusiast',
    profile_picture_url: 'https://i.pravatar.cc/150?img=32',
    comment_text: 'What\'s the pricing like?',
    bot_response: 'We offer flexible plans starting from $99/month! Each plan includes different features to match your needs. DM us or check our website for detailed pricing! 💰',
    sentiment: 'neutral',
    is_bot_reply: true,
    created_at: '2025-01-18T16:00:00Z',
    responded_at: '2025-01-18T16:02:00Z',
  },
  {
    id: 'ig_comment_4',
    company_id: '1',
    post_id: 'ig_post_1',
    comment_id: 'comment_1004',
    username: '@marketing_pro',
    profile_picture_url: 'https://i.pravatar.cc/150?img=44',
    comment_text: '🔥🔥🔥',
    bot_response: 'Thank you! 🙌 We\'re excited to help businesses automate and grow!',
    sentiment: 'positive',
    is_bot_reply: true,
    created_at: '2025-01-18T16:30:00Z',
    responded_at: '2025-01-18T16:31:00Z',
  },
  {
    id: 'ig_comment_5',
    company_id: '1',
    post_id: 'ig_post_2',
    comment_id: 'comment_2001',
    username: '@business_owner',
    profile_picture_url: 'https://i.pravatar.cc/150?img=8',
    comment_text: 'Is this offer still valid?',
    bot_response: 'Yes! The 50% off promotion is valid until the end of this week. Don\'t miss out! DM us to claim your discount! ⏰',
    sentiment: 'neutral',
    is_bot_reply: true,
    created_at: '2025-01-18T13:20:00Z',
    responded_at: '2025-01-18T13:22:00Z',
  },
  {
    id: 'ig_comment_6',
    company_id: '1',
    post_id: 'ig_post_2',
    comment_id: 'comment_2002',
    username: '@startup_founder',
    profile_picture_url: 'https://i.pravatar.cc/150?img=51',
    comment_text: 'Perfect timing! Just what we needed 🎯',
    bot_response: 'That\'s great to hear! We\'re here to help your startup grow. Let\'s chat about which package fits your needs best! 🚀',
    sentiment: 'positive',
    is_bot_reply: true,
    created_at: '2025-01-18T14:45:00Z',
    responded_at: '2025-01-18T14:47:00Z',
  },
  {
    id: 'ig_comment_7',
    company_id: '1',
    post_id: 'ig_post_2',
    comment_id: 'comment_2003',
    username: '@curious_user',
    profile_picture_url: 'https://i.pravatar.cc/150?img=18',
    comment_text: 'What packages are included in the offer?',
    bot_response: 'All our automation packages are included! From Starter to Enterprise. Each with different features and capabilities. DM us for a detailed breakdown! 📦',
    sentiment: 'neutral',
    is_bot_reply: true,
    created_at: '2025-01-18T15:20:00Z',
    responded_at: '2025-01-18T15:22:00Z',
  },
  {
    id: 'ig_comment_8',
    company_id: '1',
    post_id: 'ig_post_3',
    comment_id: 'comment_3001',
    username: '@impressed_viewer',
    profile_picture_url: 'https://i.pravatar.cc/150?img=27',
    comment_text: '300% increase? That\'s incredible! 🤯',
    bot_response: 'Thank you! Yes, our AI-powered automation helped them engage better with their audience. We\'d love to create similar results for you! 💪',
    sentiment: 'positive',
    is_bot_reply: true,
    created_at: '2025-01-18T12:30:00Z',
    responded_at: '2025-01-18T12:32:00Z',
  },
  {
    id: 'ig_comment_9',
    company_id: '1',
    post_id: 'ig_post_3',
    comment_id: 'comment_3002',
    username: '@agency_manager',
    profile_picture_url: 'https://i.pravatar.cc/150?img=39',
    comment_text: 'We need this for our clients! Can you handle multiple accounts?',
    bot_response: 'Absolutely! Our Enterprise plan supports multiple accounts and clients. Perfect for agencies! Let\'s discuss your specific needs. 🏢',
    sentiment: 'positive',
    is_bot_reply: true,
    created_at: '2025-01-18T14:45:00Z',
    responded_at: '2025-01-18T14:47:00Z',
  },
];

export const getCommentsByPost = (postId: string): InstagramComment[] => {
  return mockInstagramComments.filter(comment => comment.post_id === postId);
};
