# WhatsApp Conversations Tab Debug Guide

## Tarayıcı Konsolunda Kontrol Edilecekler:

### 1. Service Data Yüklenme
```
📊 Loaded companies: X [...]
📱 Loaded instances: Y [...]
```

### 2. Companies Boş İse
Eğer `companies: 0` görüyorsanız:
- `📱 Loaded instances:` kaç instance var?
- `⚠️ No companies from service pricing, extracting from instances` mesajını görüyor musunuz?

### 3. Instances Boş İse
Eğer `instances: 0` görüyorsanız, veritabanında hiç WhatsApp instance kaydı yok demektir.

## Veritabanı Kontrolleri:

### SQL Query 1: WhatsApp Instances
```sql
SELECT
  wi.*,
  c.name as company_name
FROM whatsapp_instances wi
LEFT JOIN companies c ON wi.company_id = c.id
LIMIT 10;
```

### SQL Query 2: WhatsApp Sessions
```sql
SELECT
  ws.*,
  c.name as company_name
FROM whatsapp_sessions ws
LEFT JOIN companies c ON ws.company_id = c.id
LIMIT 10;
```

### SQL Query 3: WhatsApp Messages
```sql
SELECT
  wm.*,
  ws.customer_name
FROM whatsapp_messages wm
LEFT JOIN whatsapp_sessions ws ON wm.session_id = ws.id
LIMIT 10;
```

### SQL Query 4: Company Services
```sql
SELECT
  cs.*,
  c.name as company_name,
  st.name as service_name
FROM company_services cs
LEFT JOIN companies c ON cs.company_id = c.id
LEFT JOIN service_types st ON cs.service_type_id = st.id
WHERE st.slug = 'whatsapp-automation';
```

## Çözümler:

### Durum 1: Instances Var Ama Companies Boş
✅ YENİ KOD: Artık instances'dan company'leri çıkarıyoruz, çözülmüş olmalı.

### Durum 2: Instances da Yok
❌ Problem: Veritabanında hiç WhatsApp instance kaydı yok.
✅ Çözüm: Önce bir company için WhatsApp instance oluşturulmalı.

### Durum 3: Sessions Var Ama Messages Yok
❌ Problem: Session'lar var ama mesaj kayıtları yok.
✅ Çözüm: Mesajlar geldiğinde `whatsapp_messages` tablosuna kaydedilmeli.

## Test Adımları:

1. **Conversations Tab'a git**
2. **Sol tarafta Companies listesini kontrol et**
   - Boş mu?
   - Loading spinner görünüyor mu?
   - "No companies found" mesajı mı?

3. **Console Log'ları kontrol et**
   - F12 > Console
   - Yukarıdaki log'ları ara

4. **Bir company seçmeyi dene**
   - Sessions yükleniyor mu?
   - Kaç session var?

5. **Bir session seçmeyi dene**
   - Messages yükleniyor mu?
   - Chat görünümü çalışıyor mu?
