export type Language = 'en' | 'tr';

export interface Translations {
  [key: string]: {
    en: string;
    tr: string;
  };
}

export const translations: Translations = {
  // Common
  'common.loading': {
    en: 'Loading...',
    tr: 'Yükleniyor...'
  },
  'common.error': {
    en: 'Error',
    tr: 'Hata'
  },
  'common.success': {
    en: 'Success',
    tr: 'Başarılı'
  },
  'common.save': {
    en: 'Save',
    tr: 'Kaydet'
  },
  'common.cancel': {
    en: 'Cancel',
    tr: 'İptal'
  },
  'common.edit': {
    en: 'Edit',
    tr: 'Düzenle'
  },
  'common.delete': {
    en: 'Delete',
    tr: 'Sil'
  },
  'common.view': {
    en: 'View',
    tr: 'Görüntüle'
  },
  'common.back': {
    en: 'Back',
    tr: 'Geri'
  },

  // Auth
  'auth.login': {
    en: 'Login',
    tr: 'Giriş Yap'
  },
  'auth.logout': {
    en: 'Logout',
    tr: 'Çıkış Yap'
  },
  'auth.email': {
    en: 'Email',
    tr: 'E-posta'
  },
  'auth.password': {
    en: 'Password',
    tr: 'Şifre'
  },

  // Dashboard
  'dashboard.title': {
    en: 'Dashboard',
    tr: 'Kontrol Paneli'
  },
  'dashboard.welcome': {
    en: 'Welcome',
    tr: 'Hoş Geldiniz'
  },

  // Services
  'services.title': {
    en: 'Services',
    tr: 'Hizmetler'
  },
  'services.catalog': {
    en: 'Services Catalog',
    tr: 'Hizmet Kataloğu'
  },
  'services.website': {
    en: 'Website Development',
    tr: 'Website Geliştirme'
  },
  'services.mobileApp': {
    en: 'Mobile App Development',
    tr: 'Mobil Uygulama Geliştirme'
  },
  'services.whatsapp': {
    en: 'WhatsApp Automation',
    tr: 'WhatsApp Otomasyonu'
  },
  'services.instagram': {
    en: 'Instagram Automation',
    tr: 'Instagram Otomasyonu'
  },

  // Project Status
  'status.active': {
    en: 'Active',
    tr: 'Aktif'
  },
  'status.completed': {
    en: 'Completed',
    tr: 'Tamamlandı'
  },
  'status.pending': {
    en: 'Pending',
    tr: 'Beklemede'
  },
  'status.inProgress': {
    en: 'In Progress',
    tr: 'Devam Ediyor'
  },
  'status.blocked': {
    en: 'Blocked',
    tr: 'Engellendi'
  },

  // Add more translations as needed
};

export function getTranslation(key: string, language: 'en' | 'tr'): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }
  return translation[language] || key;
}