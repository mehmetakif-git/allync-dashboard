# 📱 Push Notifications Setup Guide

## ✅ Tamamlanan İşlemler

### 1. Database Migration ✅
- `push_token`, `push_enabled`, `push_platform` field'ları `profiles` tablosuna eklendi
- `push_notifications_log` tablosu oluşturuldu
- Gerekli index'ler ve RLS policy'leri eklendi

### 2. Backend Servisleri ✅
- `expo-server-sdk` paketi kuruldu
- `pushNotificationService.ts` oluşturuldu
- `notifications.ts` API'si push notification desteği ile güncellendi

### 3. Mobile App ✅
- Push token kaydı aktif
- NotificationContext ile yönetim
- Permission banner ekli
- Bildirimlere tıklama ile navigation

---

## 🚀 Kurulum Adımları

### Adım 1: Database Migration'ı Çalıştır

Supabase SQL Editor'de çalıştırın:

```bash
# Migration dosyasını çalıştır
database/migrations/add_push_notification_support.sql
```

**Doğrulama:**
```sql
-- Push field'larının eklendiğini kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('push_token', 'push_enabled', 'push_platform');

-- Push log tablosunun oluşturulduğunu kontrol et
SELECT * FROM push_notifications_log LIMIT 1;
```

### Adım 2: Backend Package'ları Kontrol Et

```bash
cd E:\allync\dashboard-allync\allync-dashboard
npm install  # expo-server-sdk zaten kuruldu
```

### Adım 3: Expo Access Token (İsteğe Bağlı)

Daha yüksek rate limit için `.env` dosyasına ekleyin:

```env
EXPO_ACCESS_TOKEN=your_expo_access_token_here
```

**Expo Access Token Alma:**
1. https://expo.dev/accounts/[your-account]/settings/access-tokens
2. "Create Token" butonuna tıklayın
3. Token'ı kopyalayıp `.env`'ye ekleyin

### Adım 4: Mobile App EAS Project ID Ekle

`allync-mobile/app.json` dosyasında:

```json
"extra": {
  "eas": {
    "projectId": "GERÇEK_PROJECT_ID_BURAYA" // ← Bunu güncelle
  }
}
```

**EAS Project ID Alma:**
```bash
cd E:\allync\dashboard-allync\allync-mobile
npx eas init
# Verilen project ID'yi kopyala
```

---

## 🧪 Test Etme

### Test 1: Mobile App Push Token Kaydı

1. **Mobile uygulamayı çalıştır:**
```bash
cd E:\allync\dashboard-allync\allync-mobile
npx expo start
```

2. **Fiziksel cihazda aç** (Expo Go veya Development Build)

3. **Login ol** ve permission banner'da "Enable" butonuna bas

4. **Console'da token'ı kontrol et:**
```
✅ Push token: ExponentPushToken[xxxxxxxxxxxxx]
```

5. **Supabase'de kontrol et:**
```sql
SELECT id, full_name, push_token, push_enabled, push_platform
FROM profiles
WHERE push_token IS NOT NULL;
```

### Test 2: Web Dashboard'dan Push Gönder

1. **Web dashboard'a gir:**
```bash
cd E:\allync\dashboard-allync\allync-dashboard
npm run dev
```

2. **Admin olarak login ol**

3. **Notifications Management'a git:**
   - `/admin/notifications-management`

4. **Bildirim oluştur:**
   - Type: Info
   - Title: "Test Push Notification"
   - Message: "This is a test push notification from web dashboard!"
   - Target: All Users
   - **Send** butonuna tıkla

5. **Sonuçları kontrol et:**

**Console'da:**
```
📱 Starting push notification sending process
📤 Sending push to audience: all
📤 Found 5 users with push enabled
✅ Push notifications sent: 5/5 successful
```

**Mobile cihazda:**
- Uygulama açıksa → Notification Panel'de görünür
- Uygulama kapalıysa → System notification gelir

**Supabase'de:**
```sql
-- Push log'ları kontrol et
SELECT
  pnl.*,
  p.full_name,
  sn.title
FROM push_notifications_log pnl
JOIN profiles p ON p.id = pnl.user_id
LEFT JOIN system_notifications sn ON sn.id = pnl.notification_id
ORDER BY pnl.sent_at DESC
LIMIT 10;
```

### Test 3: Manuel Push Test (Postman veya API)

API endpoint oluşturabilirsiniz:

**Route:** `POST /api/admin/push/test`

**Body:**
```json
{
  "userId": "user-uuid-here",
  "title": "Test Push",
  "message": "Manual test push notification"
}
```

**Implementation (opsiyonel):**
```typescript
// src/pages/api/admin/push/test.ts
import pushNotificationService from '../../../lib/services/pushNotificationService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, title, message } = req.body;

  const result = await pushNotificationService.sendPushToUser({
    userId,
    title,
    message,
    priority: 'high',
  });

  res.json(result);
}
```

---

## 📊 Monitoring & Analytics

### Push Notification İstatistikleri

```sql
-- Bugün gönderilen push'lar
SELECT
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered
FROM push_notifications_log
WHERE sent_at >= CURRENT_DATE;

-- Push enabled kullanıcılar
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE push_enabled = true) as push_enabled,
  COUNT(*) FILTER (WHERE push_platform = 'ios') as ios_users,
  COUNT(*) FILTER (WHERE push_platform = 'android') as android_users
FROM profiles;

-- En son push'lar
SELECT
  p.full_name,
  pnl.status,
  pnl.sent_at,
  sn.title
FROM push_notifications_log pnl
JOIN profiles p ON p.id = pnl.user_id
LEFT JOIN system_notifications sn ON sn.id = pnl.notification_id
ORDER BY pnl.sent_at DESC
LIMIT 20;
```

### Dashboard Metrik Önerileri

Admin panel'e eklenebilecek metrikleri:

- **Total Push Sent Today**
- **Delivery Success Rate**
- **Active Push Users**
- **Failed Push Count**
- **Average Delivery Time**

---

## 🔧 Troubleshooting

### Problem 1: Push Gelmiyor

**Kontrol listesi:**
1. Mobile app'de push token var mı?
   ```sql
   SELECT push_token, push_enabled FROM profiles WHERE id = 'user-id';
   ```

2. Console'da push gönderildi mi?
   ```
   ✅ Push sent successfully to user xxx
   ```

3. Push log'da kayıt var mı?
   ```sql
   SELECT * FROM push_notifications_log WHERE user_id = 'user-id';
   ```

4. Expo push token geçerli mi?
   - Token `ExponentPushToken[...]` formatında olmalı
   - Fiziksel cihaz kullanılmalı (emulator'da çalışmaz)

### Problem 2: Invalid Push Token

**Çözüm:**
```sql
-- Geçersiz token'ları temizle
UPDATE profiles
SET push_token = NULL, push_enabled = false
WHERE push_token IS NOT NULL
AND (
  push_token NOT LIKE 'ExponentPushToken[%'
  OR LENGTH(push_token) < 20
);
```

### Problem 3: Rate Limiting

**Çözüm:**
- Expo Access Token ekleyin (`.env`)
- Batch processing kullanın (100 push / batch)
- Rate limit: 600 push / second (access token ile)

### Problem 4: Device Not Registered

**Sebep:** Token expired veya app uninstalled

**Çözüm:**
```typescript
// pushNotificationService.ts içinde zaten handle ediliyor
if (receipt.details?.error === 'DeviceNotRegistered') {
  // Token'ı database'den sil
  await unregisterPushToken(userId);
}
```

---

## 🎯 Gelecek Geliştirmeler

### İsteğe Bağlı Eklemeler:

1. **Scheduled Push Notifications**
   - Belirli zamanda push gönder
   - Cron job ile otomatik gönderim

2. **Rich Notifications**
   - Resim ekleme
   - Action buttons
   - Deep linking

3. **Push Preferences**
   - Kullanıcı notification settings
   - Kategori bazlı kapatma/açma
   - Quiet hours

4. **A/B Testing**
   - Farklı mesaj versiyonları
   - Tıklama oranı tracking
   - Optimizasyon

5. **Admin Panel Enhancements**
   - Send Test Push butonu
   - Push analytics dashboard
   - Real-time push monitoring

---

## 📚 Kaynaklar

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## ✅ Checklist

- [ ] Database migration çalıştırıldı
- [ ] expo-server-sdk kuruldu
- [ ] Mobile app'de EAS project ID güncellendi
- [ ] Mobile app'de push token kaydediliyor
- [ ] Web dashboard'dan push gönderilebiliyor
- [ ] Push log tablosu dolduruluyor
- [ ] Push başarı/hata durumları loglanıyor

---

**🎉 Tebrikler! Push notification sistemi hazır!**

Sorularınız için:
- GitHub Issues
- Slack: #notifications-support
- Email: support@allync.com
