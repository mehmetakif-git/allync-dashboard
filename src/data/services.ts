import { MessageCircle, Instagram } from 'lucide-react';

export interface ServiceType {
  id: string;
  slug: string;
  name_en: string;
  name_tr: string;
  category: 'ai' | 'digital';
  icon: any;
  color: string;
  gradient: string;
  description_en: string;
  description_tr: string;
  features: string[];
  status: 'active' | 'maintenance' | 'inactive';
  sort_order: number;
  delivery: string;
  pricing: {
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export const serviceTypes: ServiceType[] = [
  {
    id: 'whatsapp-automation',
    slug: 'whatsapp-automation',
    name_en: 'WhatsApp Automation',
    name_tr: 'WhatsApp Otomasyonu',
    category: 'ai',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-600',
    gradient: 'from-green-500 to-emerald-600',
    description_en: '24/7 customer support, appointment management and data analysis',
    description_tr: '7/24 müşteri desteği, randevu yönetimi ve veri analizi',
    features: ['Automated customer support', 'Appointment management', 'Multi-language support', 'CRM integration', 'Detailed reporting'],
    status: 'active',
    sort_order: 1,
    delivery: '1-2 weeks',
    pricing: { basic: 299, pro: 499, enterprise: 999 },
  },
  {
    id: 'instagram-automation',
    slug: 'instagram-automation',
    name_en: 'Instagram Automation',
    name_tr: 'Instagram Otomasyonu',
    category: 'ai',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    gradient: 'from-pink-500 to-purple-600',
    description_en: 'DM automation, comment management and engagement boost',
    description_tr: 'DM otomasyonu, yorum yönetimi ve etkileşim artırma',
    features: ['Auto DM responses', 'Comment management', 'Hashtag analysis', 'Engagement reports', 'Lead generation'],
    status: 'active',
    sort_order: 2,
    delivery: '1-2 weeks',
    pricing: { basic: 149, pro: 349, enterprise: 799 },
  },
];

export const mockCompanyRequests: Record<string, { status: 'pending' | 'approved' | 'rejected', date: string, plan: string }> = {
  'whatsapp-automation': { status: 'approved', date: '2024-03-15', plan: 'pro' },
  'instagram-automation': { status: 'approved', date: '2024-05-22', plan: 'basic' },
};
