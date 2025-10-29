// src/types.ts
// Type definitions for mock data

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  features: string[];
  price: string;
  isActive: boolean;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  company_id: string;
  company_name: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  paidDate?: string;
  items: InvoiceItem[];
}

export interface TicketMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isSupport: boolean;
}

export interface Ticket {
  id: string;
  number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  company_id: string;
  company_name: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface WhatsAppSession {
  id: string;
  customerName: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  active: boolean;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  taxId: string;
  registrationNumber: string;
  billingEmail: string;
  website: string;
  status: string;
  createdAt: string;
  activeServicesCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  company: string;
  action: string;
  details: string;
  ip: string;
}
