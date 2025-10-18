export interface GmailInstance {
  id: string;
  company_id: string;
  gmail_address: string;
  auto_reply_enabled: boolean;
  whatsapp_integration_enabled: boolean;
  status: string;
}

export interface GmailMessage {
  id: string;
  company_id: string;
  gmail_message_id: string;
  from_email: string;
  from_name: string;
  to_emails: string[];
  subject: string;
  body_text: string;
  whatsapp_session_id?: string;
  customer_phone?: string;
  direction: 'inbound' | 'outbound';
  ai_summary: string;
  ai_intent: string;
  ai_priority: string;
  is_read: boolean;
  gmail_received_at: string;
  created_at: string;
}

export const mockGmailInstances: GmailInstance[] = [
  {
    id: 'gmail_inst_1',
    company_id: '1',
    gmail_address: 'contact@techcorp.com',
    auto_reply_enabled: true,
    whatsapp_integration_enabled: true,
    status: 'active'
  }
];

export const mockGmailMessages: GmailMessage[] = [
  {
    id: 'gmail_msg_1',
    company_id: '1',
    gmail_message_id: 'msg_abc123',
    from_email: 'customer@example.com',
    from_name: 'Ahmed Al-Mansoori',
    to_emails: ['contact@techcorp.com'],
    subject: 'Product Inquiry - Laptop Pro 15',
    body_text: 'Hello, I am interested in purchasing the Laptop Pro 15. Could you provide more details about the specifications and availability?',
    whatsapp_session_id: 'wa_session_1',
    customer_phone: '+974 5555 1234',
    direction: 'inbound',
    ai_summary: 'Customer inquiring about Laptop Pro 15 specifications and availability',
    ai_intent: 'product_inquiry',
    ai_priority: 'medium',
    is_read: false,
    gmail_received_at: '2025-01-20T10:15:00Z',
    created_at: '2025-01-20T10:15:00Z'
  },
  {
    id: 'gmail_msg_2',
    company_id: '1',
    gmail_message_id: 'msg_def456',
    from_email: 'contact@techcorp.com',
    from_name: 'Tech Corp Sales',
    to_emails: ['customer@example.com'],
    subject: 'Re: Product Inquiry - Laptop Pro 15',
    body_text: 'Thank you for your interest! The Laptop Pro 15 features Intel i7 processor, 16GB RAM, 512GB SSD. Currently in stock with 12 units available. Price: 5,500 QAR.',
    direction: 'outbound',
    ai_summary: 'Response sent with product specifications and availability',
    ai_intent: 'product_information',
    ai_priority: 'medium',
    is_read: true,
    gmail_received_at: '2025-01-20T10:30:00Z',
    created_at: '2025-01-20T10:30:00Z'
  },
  {
    id: 'gmail_msg_3',
    company_id: '1',
    gmail_message_id: 'msg_ghi789',
    from_email: 'support@supplier.com',
    from_name: 'Supplier Support',
    to_emails: ['contact@techcorp.com'],
    subject: 'Invoice #INV-2025-001',
    body_text: 'Please find attached the invoice for your recent order. Payment due within 30 days.',
    direction: 'inbound',
    ai_summary: 'Invoice received from supplier for recent order',
    ai_intent: 'invoice',
    ai_priority: 'high',
    is_read: true,
    gmail_received_at: '2025-01-20T09:00:00Z',
    created_at: '2025-01-20T09:00:00Z'
  },
  {
    id: 'gmail_msg_4',
    company_id: '1',
    gmail_message_id: 'msg_jkl012',
    from_email: 'inquiry@company.com',
    from_name: 'Fatima Hassan',
    to_emails: ['contact@techcorp.com'],
    subject: 'Bulk Order Request',
    body_text: 'We are interested in ordering 50 wireless mice for our office. Can you provide a quote with bulk discount?',
    whatsapp_session_id: 'wa_session_2',
    customer_phone: '+974 5555 5678',
    direction: 'inbound',
    ai_summary: 'Bulk order request for 50 wireless mice with discount inquiry',
    ai_intent: 'bulk_order',
    ai_priority: 'high',
    is_read: false,
    gmail_received_at: '2025-01-20T14:20:00Z',
    created_at: '2025-01-20T14:20:00Z'
  }
];
