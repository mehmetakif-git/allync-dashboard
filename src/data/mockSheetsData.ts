export interface SheetsInstance {
  id: string;
  company_id: string;
  google_sheet_id: string;
  google_sheet_name: string;
  google_sheet_url: string;
  auto_sync_enabled: boolean;
  last_sync_at: string;
  status: string;
}

export interface SheetsDataCache {
  id: string;
  company_id: string;
  worksheet_name: string;
  row_number: number;
  data_json: any;
  data_text: string;
  synced_at: string;
}

export interface SheetsQuery {
  id: string;
  company_id: string;
  whatsapp_session_id: string;
  customer_phone: string;
  customer_name: string;
  query_text: string;
  query_intent: string;
  search_results: any[];
  results_count: number;
  bot_response: string;
  response_type: string;
  created_at: string;
}

export const mockSheetsInstances: SheetsInstance[] = [
  {
    id: 'sheets_inst_1',
    company_id: '1',
    google_sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    google_sheet_name: 'Tech Corp Inventory',
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    auto_sync_enabled: true,
    last_sync_at: '2025-01-20T15:30:00Z',
    status: 'active'
  }
];

export const mockSheetsDataCache: SheetsDataCache[] = [
  {
    id: 'cache_1',
    company_id: '1',
    worksheet_name: 'Products',
    row_number: 2,
    data_json: {
      sku: 'LT-001',
      name: 'Laptop Pro 15',
      category: 'Electronics',
      price: 5500,
      stock: 12,
      brand: 'TechBrand',
      warranty: '2 years'
    },
    data_text: 'LT-001 Laptop Pro 15 Electronics 5500 12 TechBrand 2 years',
    synced_at: '2025-01-20T15:30:00Z'
  },
  {
    id: 'cache_2',
    company_id: '1',
    worksheet_name: 'Products',
    row_number: 3,
    data_json: {
      sku: 'MO-002',
      name: 'Wireless Mouse',
      category: 'Accessories',
      price: 150,
      stock: 45,
      brand: 'TechBrand',
      warranty: '1 year'
    },
    data_text: 'MO-002 Wireless Mouse Accessories 150 45 TechBrand 1 year',
    synced_at: '2025-01-20T15:30:00Z'
  },
  {
    id: 'cache_3',
    company_id: '1',
    worksheet_name: 'Products',
    row_number: 4,
    data_json: {
      sku: 'KB-003',
      name: 'Mechanical Keyboard RGB',
      category: 'Accessories',
      price: 450,
      stock: 23,
      brand: 'TechBrand',
      warranty: '1 year'
    },
    data_text: 'KB-003 Mechanical Keyboard RGB Accessories 450 23 TechBrand 1 year',
    synced_at: '2025-01-20T15:30:00Z'
  },
  {
    id: 'cache_4',
    company_id: '1',
    worksheet_name: 'Products',
    row_number: 5,
    data_json: {
      sku: 'MN-004',
      name: '27" 4K Monitor',
      category: 'Electronics',
      price: 2200,
      stock: 8,
      brand: 'ViewTech',
      warranty: '3 years'
    },
    data_text: 'MN-004 27" 4K Monitor Electronics 2200 8 ViewTech 3 years',
    synced_at: '2025-01-20T15:30:00Z'
  },
  {
    id: 'cache_5',
    company_id: '1',
    worksheet_name: 'Products',
    row_number: 6,
    data_json: {
      sku: 'HD-005',
      name: 'USB-C Hub 7-in-1',
      category: 'Accessories',
      price: 280,
      stock: 34,
      brand: 'ConnectPro',
      warranty: '1 year'
    },
    data_text: 'HD-005 USB-C Hub 7-in-1 Accessories 280 34 ConnectPro 1 year',
    synced_at: '2025-01-20T15:30:00Z'
  }
];

export const mockSheetsQueries: SheetsQuery[] = [
  {
    id: 'query_1',
    company_id: '1',
    whatsapp_session_id: 'wa_session_1',
    customer_phone: '+974 5555 1234',
    customer_name: 'Ahmed Ali',
    query_text: 'Laptop Pro 15 fiyatı ne kadar?',
    query_intent: 'price_check',
    search_results: [mockSheetsDataCache[0]],
    results_count: 1,
    bot_response: '✅ Laptop Pro 15 bulundu!\n💰 Fiyat: 5,500 QAR\n📦 Stok: 12 adet\n🏷️ Marka: TechBrand\n🛡️ Garanti: 2 years',
    response_type: 'found',
    created_at: '2025-01-20T14:30:00Z'
  },
  {
    id: 'query_2',
    company_id: '1',
    whatsapp_session_id: 'wa_session_2',
    customer_phone: '+974 5555 5678',
    customer_name: 'Fatima Hassan',
    query_text: 'Wireless mouse stokta var mı?',
    query_intent: 'stock_check',
    search_results: [mockSheetsDataCache[1]],
    results_count: 1,
    bot_response: '✅ Wireless Mouse stokta!\n📦 Stok: 45 adet\n💰 Fiyat: 150 QAR\n🏷️ Marka: TechBrand',
    response_type: 'found',
    created_at: '2025-01-20T15:15:00Z'
  },
  {
    id: 'query_3',
    company_id: '1',
    whatsapp_session_id: 'wa_session_3',
    customer_phone: '+974 5555 9012',
    customer_name: 'Mohammed Ibrahim',
    query_text: 'Klavye ürünleriniz var mı?',
    query_intent: 'product_search',
    search_results: [mockSheetsDataCache[2]],
    results_count: 1,
    bot_response: '✅ 1 klavye ürünü bulundu:\n\n1️⃣ Mechanical Keyboard RGB\n💰 Fiyat: 450 QAR\n📦 Stok: 23 adet\n🏷️ Marka: TechBrand',
    response_type: 'found',
    created_at: '2025-01-20T16:00:00Z'
  }
];
