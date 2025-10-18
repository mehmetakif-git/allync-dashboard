export interface DocsInstance {
  id: string;
  company_id: string;
  google_drive_folder_id: string;
  google_drive_folder_name: string;
  auto_generate_enabled: boolean;
  status: string;
}

export interface GeneratedDocument {
  id: string;
  company_id: string;
  google_doc_id: string;
  google_doc_url: string;
  google_doc_name: string;
  document_type: string;
  document_title: string;
  word_count: number;
  whatsapp_session_id?: string;
  customer_phone?: string;
  customer_name?: string;
  request_text: string;
  ai_model: string;
  status: string;
  generated_at: string;
}

export const mockDocsInstances: DocsInstance[] = [
  {
    id: 'docs_inst_1',
    company_id: '1',
    google_drive_folder_id: 'folder_abc123',
    google_drive_folder_name: 'Generated Documents',
    auto_generate_enabled: true,
    status: 'active'
  }
];

export const mockGeneratedDocuments: GeneratedDocument[] = [
  {
    id: 'doc_1',
    company_id: '1',
    google_doc_id: 'doc_xyz789',
    google_doc_url: 'https://docs.google.com/document/d/doc_xyz789',
    google_doc_name: 'Sales Report - January 2025',
    document_type: 'report',
    document_title: 'Monthly Sales Report',
    word_count: 1250,
    whatsapp_session_id: 'wa_session_1',
    customer_phone: '+974 5555 1234',
    customer_name: 'Ahmed Ali',
    request_text: 'Bana Ocak ayı satış raporu hazırla',
    ai_model: 'gpt-4',
    status: 'completed',
    generated_at: '2025-01-20T11:30:00Z'
  },
  {
    id: 'doc_2',
    company_id: '1',
    google_doc_id: 'doc_abc123',
    google_doc_url: 'https://docs.google.com/document/d/doc_abc123',
    google_doc_name: 'Product Proposal - Laptop Pro 15',
    document_type: 'proposal',
    document_title: 'Product Proposal Document',
    word_count: 850,
    whatsapp_session_id: 'wa_session_2',
    customer_phone: '+974 5555 5678',
    customer_name: 'Fatima Hassan',
    request_text: 'Laptop Pro 15 için teklif dosyası oluştur',
    ai_model: 'claude-3',
    status: 'completed',
    generated_at: '2025-01-20T13:45:00Z'
  },
  {
    id: 'doc_3',
    company_id: '1',
    google_doc_id: 'doc_def456',
    google_doc_url: 'https://docs.google.com/document/d/doc_def456',
    google_doc_name: 'Meeting Minutes - Team Sync 2025-01-20',
    document_type: 'minutes',
    document_title: 'Meeting Minutes',
    word_count: 650,
    request_text: 'Bugünkü toplantı notlarını hazırla',
    ai_model: 'gpt-4',
    status: 'completed',
    generated_at: '2025-01-20T16:00:00Z'
  }
];
