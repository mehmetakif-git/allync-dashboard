export interface DriveInstance {
  id: string;
  company_id: string;
  google_drive_email: string;
  root_folder_id: string;
  root_folder_name: string;
  auto_organize_enabled: boolean;
  status: string;
}

export interface DriveFile {
  id: string;
  company_id: string;
  google_file_id: string;
  google_file_name: string;
  google_file_url: string;
  google_file_type: string;
  mime_type: string;
  file_size_bytes: number;
  parent_folder_name: string;
  whatsapp_session_id?: string;
  customer_phone?: string;
  uploaded_via_whatsapp: boolean;
  is_shared: boolean;
  share_link?: string;
  ai_summary?: string;
  status: string;
  created_at: string;
}

export const mockDriveInstances: DriveInstance[] = [
  {
    id: 'drive_inst_1',
    company_id: '1',
    google_drive_email: 'drive@techcorp.com',
    root_folder_id: 'root_folder_123',
    root_folder_name: 'Tech Corp Drive',
    auto_organize_enabled: true,
    status: 'active'
  }
];

export const mockDriveFiles: DriveFile[] = [
  {
    id: 'file_1',
    company_id: '1',
    google_file_id: 'file_abc123',
    google_file_name: 'Product Catalog 2025.pdf',
    google_file_url: 'https://drive.google.com/file/d/file_abc123',
    google_file_type: 'pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 2560000,
    parent_folder_name: 'Documents',
    uploaded_via_whatsapp: false,
    is_shared: true,
    share_link: 'https://drive.google.com/file/d/file_abc123/view',
    ai_summary: 'Product catalog containing all 2025 products with prices and specifications',
    status: 'active',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'file_2',
    company_id: '1',
    google_file_id: 'file_def456',
    google_file_name: 'Customer Photo - Office Setup.jpg',
    google_file_url: 'https://drive.google.com/file/d/file_def456',
    google_file_type: 'image',
    mime_type: 'image/jpeg',
    file_size_bytes: 1250000,
    parent_folder_name: 'Customer Photos',
    whatsapp_session_id: 'wa_session_1',
    customer_phone: '+974 5555 1234',
    uploaded_via_whatsapp: true,
    is_shared: false,
    ai_summary: 'Photo of customer office setup with multiple monitors and desk accessories',
    status: 'active',
    created_at: '2025-01-20T11:30:00Z'
  },
  {
    id: 'file_3',
    company_id: '1',
    google_file_id: 'file_ghi789',
    google_file_name: 'Sales Report Q4 2024.xlsx',
    google_file_url: 'https://drive.google.com/file/d/file_ghi789',
    google_file_type: 'spreadsheet',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size_bytes: 850000,
    parent_folder_name: 'Reports',
    uploaded_via_whatsapp: false,
    is_shared: true,
    share_link: 'https://drive.google.com/file/d/file_ghi789/view',
    ai_summary: 'Q4 2024 sales report with detailed revenue breakdown by product category',
    status: 'active',
    created_at: '2025-01-10T14:00:00Z'
  },
  {
    id: 'file_4',
    company_id: '1',
    google_file_id: 'file_jkl012',
    google_file_name: 'Invoice - Customer Ahmed.pdf',
    google_file_url: 'https://drive.google.com/file/d/file_jkl012',
    google_file_type: 'pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 340000,
    parent_folder_name: 'Invoices',
    whatsapp_session_id: 'wa_session_1',
    customer_phone: '+974 5555 1234',
    uploaded_via_whatsapp: false,
    is_shared: true,
    share_link: 'https://drive.google.com/file/d/file_jkl012/view',
    ai_summary: 'Invoice for customer Ahmed - Order #12345 - Amount: 5,500 QAR',
    status: 'active',
    created_at: '2025-01-20T15:00:00Z'
  }
];
