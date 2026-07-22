# Register API Kullanım Kılavuzu

## Kurulum

```bash
npm install
```

## Başlatma

```bash
npm start
```

Server `http://localhost:3000` adresinde çalışacak.

## API Endpoints

### 1. Kullanıcı Kayıt
**Endpoint:** `POST /api/auth/register`

**İstek (Request):**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Başarılı Yanıt (201):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla kaydedildi",
  "user": {
    "id": 1721475000000,
    "email": "user@example.com"
  }
}
```

**Hata Yanıtları:**
- Email eksik: `400 - Email ve şifre gereklidir`
- Geçersiz email: `400 - Geçersiz email formatı`
- Kısa şifre: `400 - Şifre en az 6 karakter olmalıdır`
- Mevcut email: `400 - Bu email zaten kayıtlı`

### 2. Tüm Kullanıcıları Listele
**Endpoint:** `GET /api/auth/users`

**Yanıt:**
```json
{
  "success": true,
  "count": 1,
  "users": [
    {
      "id": 1721475000000,
      "email": "user@example.com",
      "createdAt": "2026-07-20T15:30:00.000Z"
    }
  ]
}
```

## Curl Örnekleri

### Kayıt
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Kullanıcıları Listele
```bash
curl http://localhost:3000/api/auth/users
```

## Özellikler

✅ Email validasyonu
✅ Şifre validasyonu (minimum 6 karakter)
✅ Şifre hash'leme (bcryptjs)
✅ Duplicate email kontrolü
✅ JSON yanıtları
✅ Hata yönetimi
