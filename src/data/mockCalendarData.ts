export interface CalendarInstance {
  id: string;
  company_id: string;
  google_calendar_id: string;
  calendar_name: string;
  timezone: string;
  business_hours: any;
  auto_approve_appointments: boolean;
  status: string;
}

export interface AppointmentRequest {
  id: string;
  company_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  whatsapp_session_id: string;
  appointment_type: string;
  appointment_reason: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  assigned_to_staff_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'no_show';
  google_event_id?: string;
  calendar_event_link?: string;
  ai_confidence_score: number;
  requested_at: string;
  approved_at?: string;
  created_by: string;
}

export interface CalendarStaff {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  is_active: boolean;
}

export const mockCalendarInstances: CalendarInstance[] = [
  {
    id: 'cal_inst_1',
    company_id: '1',
    google_calendar_id: 'techcorp@google.com',
    calendar_name: 'Tech Corp Appointments',
    timezone: 'Asia/Qatar',
    business_hours: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '10:00', end: '14:00' },
      sunday: { start: null, end: null }
    },
    auto_approve_appointments: false,
    status: 'active'
  }
];

export const mockAppointmentRequests: AppointmentRequest[] = [
  {
    id: 'appt_1',
    company_id: '1',
    customer_name: 'Ahmed Al-Mansoori',
    customer_phone: '+974 5555 1234',
    customer_email: 'ahmed@example.com',
    whatsapp_session_id: 'wa_session_1',
    appointment_type: 'Consultation',
    appointment_reason: 'Product demonstration and consultation',
    requested_date: '2025-01-25',
    requested_time: '14:00',
    duration_minutes: 60,
    assigned_to_staff_id: 'staff_1',
    status: 'approved',
    google_event_id: 'google_event_123',
    calendar_event_link: 'https://calendar.google.com/event/123',
    ai_confidence_score: 0.95,
    requested_at: '2025-01-20T10:30:00Z',
    approved_at: '2025-01-20T11:00:00Z',
    created_by: 'whatsapp_bot'
  },
  {
    id: 'appt_2',
    company_id: '1',
    customer_name: 'Fatima Hassan',
    customer_phone: '+974 5555 5678',
    whatsapp_session_id: 'wa_session_2',
    appointment_type: 'Technical Support',
    appointment_reason: 'System installation support needed',
    requested_date: '2025-01-26',
    requested_time: '10:00',
    duration_minutes: 90,
    status: 'pending',
    ai_confidence_score: 0.88,
    requested_at: '2025-01-20T14:15:00Z',
    created_by: 'whatsapp_bot'
  },
  {
    id: 'appt_3',
    company_id: '1',
    customer_name: 'Mohammed Ibrahim',
    customer_phone: '+974 5555 9012',
    customer_email: 'mohammed@example.com',
    whatsapp_session_id: 'wa_session_3',
    appointment_type: 'Follow-up Meeting',
    appointment_reason: 'Project progress review',
    requested_date: '2025-01-25',
    requested_time: '16:00',
    duration_minutes: 45,
    assigned_to_staff_id: 'staff_2',
    status: 'completed',
    google_event_id: 'google_event_124',
    calendar_event_link: 'https://calendar.google.com/event/124',
    ai_confidence_score: 0.92,
    requested_at: '2025-01-18T09:00:00Z',
    approved_at: '2025-01-18T09:30:00Z',
    created_by: 'whatsapp_bot'
  },
  {
    id: 'appt_4',
    company_id: '1',
    customer_name: 'Sara Al-Thani',
    customer_phone: '+974 5555 3456',
    whatsapp_session_id: 'wa_session_4',
    appointment_type: 'Training Session',
    appointment_reason: 'Software training for new features',
    requested_date: '2025-01-27',
    requested_time: '11:00',
    duration_minutes: 120,
    status: 'pending',
    ai_confidence_score: 0.91,
    requested_at: '2025-01-20T16:45:00Z',
    created_by: 'whatsapp_bot'
  },
  {
    id: 'appt_5',
    company_id: '1',
    customer_name: 'Ali Rashid',
    customer_phone: '+974 5555 7890',
    whatsapp_session_id: 'wa_session_5',
    appointment_type: 'Consultation',
    appointment_reason: 'Initial consultation for new project',
    requested_date: '2025-01-24',
    requested_time: '09:30',
    duration_minutes: 60,
    status: 'cancelled',
    ai_confidence_score: 0.87,
    requested_at: '2025-01-19T12:00:00Z',
    created_by: 'whatsapp_bot'
  }
];

export const mockCalendarStaff: CalendarStaff[] = [
  {
    id: 'staff_1',
    company_id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    phone: '+974 5555 1111',
    department: 'Sales',
    role: 'Senior Consultant',
    is_active: true
  },
  {
    id: 'staff_2',
    company_id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    phone: '+974 5555 2222',
    department: 'Technical Support',
    role: 'Lead Engineer',
    is_active: true
  },
  {
    id: 'staff_3',
    company_id: '1',
    name: 'Michael Chen',
    email: 'michael@techcorp.com',
    phone: '+974 5555 3333',
    department: 'Training',
    role: 'Training Manager',
    is_active: true
  }
];

export const mockAppointmentTypes = [
  { id: '1', name: 'Consultation', duration: 60, color: '#3B82F6', requires_approval: true },
  { id: '2', name: 'Technical Support', duration: 90, color: '#EF4444', requires_approval: false },
  { id: '3', name: 'Follow-up Meeting', duration: 45, color: '#10B981', requires_approval: false },
  { id: '4', name: 'Training Session', duration: 120, color: '#F59E0B', requires_approval: true },
  { id: '5', name: 'Demo', duration: 30, color: '#8B5CF6', requires_approval: false }
];
