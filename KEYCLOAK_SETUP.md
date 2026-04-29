# Keycloak Kurulum Rehberi

## Hızlı Kurulum (Önerilen)

### 1. Keycloak'ı Başlat

```bash
cd backend
docker compose up -d
```

### 2. Realm'i Export Et (Sadece İlk Kuran Kişi)

**ÖNEMLİ:** Eğer sen ilk kuran kişiysen, ayarlarını export et:

1. Keycloak Admin Console > http://localhost:8180 (admin/admin)
2. Sol menüden **Realm settings** seç
3. **Action** dropdown > **Partial export** seç
4. **Export groups and roles**: ON
5. **Export clients**: ON
6. **Export**: Tıkla
7. İndirilen JSON dosyasını `backend/keycloak-realm-export.json` olarak kaydet
8. Git'e commit et

### 3. Realm'i Import Et (Diğer Geliştiriciler)

1. http://localhost:8180 aç
2. Admin Console'a gir (admin/admin)
3. Sol üstte "master" dropdown > "Create Realm"
4. **Browse** butonuna tıkla
5. `backend/keycloak-realm-export.json` dosyasını seç
6. **Create** tıkla

✅ Hazır! Realm, client'lar, roller, kullanıcılar ve mapper ayarları otomatik geldi.

### 4. Test Et

- Frontend: http://localhost:5173
- Giriş Yap: `student` / `student123` veya `instructor` / `instructor123`

---

## Client Secret (Backend İçin)

**Frontend için client secret GEREKMEZ** (public client).

**Backend için** (eğer backend'den Keycloak'a istek atacaksan):

1. Keycloak Admin Console
2. **Clients** > **quiz-backend** seç
3. **Credentials** tab'ına git
4. **Client secret**'i kopyala
5. `backend/src/main/resources/application.properties` dosyasına ekle:

```properties
# Keycloak Backend Configuration (Opsiyonel - sadece backend'den Keycloak'a istek için)
keycloak.client-secret=BURAYA_KOPYALADIGIN_SECRET
```

**ŞU AN KULLANMIYORUZ** çünkü:
- Frontend direkt Keycloak'a bağlanıyor (public client)
- Backend sadece JWT token'ı doğruluyor (secret gerekmez)

---

## Test Kullanıcıları

| Kullanıcı | Şifre | Rol |
|-----------|-------|-----|
| student | student123 | STUDENT |
| instructor | instructor123 | INSTRUCTOR |

---

## Manuel Kurulum (Detaylı)

```bash
cd backend
docker compose up -d
```

Keycloak http://localhost:8180 adresinde çalışacak.

## 2. Keycloak Admin Console'a Giriş

1. Tarayıcıda http://localhost:8180 aç
2. "Administration Console" tıkla
3. Giriş yap:
   - Username: `admin`
   - Password: `admin`

## 3. Realm Oluştur

Realm = Kullanıcıların ve uygulamaların izole ortamı

1. Sol üstte "master" dropdown'a tıkla
2. "Create Realm" butonuna tıkla
3. Realm name: `quiz-realm`
4. "Create" butonuna tıkla

## 4. Client Oluştur (Frontend için)

Client = Uygulamanız (React frontend)

1. Sol menüden "Clients" seç
2. "Create client" butonuna tıkla
3. Ayarlar:
   - Client type: `OpenID Connect`
   - Client ID: `quiz-frontend`
   - "Next" tıkla
4. Capability config:
   - Client authentication: `OFF` (public client)
   - Authorization: `OFF`
   - Authentication flow: Sadece `Standard flow` işaretli
   - "Next" tıkla
5. Login settings:
   - Valid redirect URIs: `http://localhost:5173/*`
   - Valid post logout redirect URIs: `http://localhost:5173/*`
   - Web origins: `http://localhost:5173`
   - "Save" tıkla

## 5. Client Oluştur (Backend için)

1. "Clients" > "Create client"
2. Ayarlar:
   - Client ID: `quiz-backend`
   - "Next"
3. Capability config:
   - Client authentication: `ON` (confidential)
   - Authorization: `OFF`
   - "Next"
4. Login settings:
   - Valid redirect URIs: `http://localhost:8080/*`
   - "Save"
5. "Credentials" tab'ına git
6. Client secret'i kopyala (sonra kullanacağız)

## 6. Realm Roles Oluştur

Roller = Kullanıcı yetkileri

1. Sol menüden "Realm roles" seç
2. "Create role" butonuna tıkla
3. Üç rol oluştur:
   - Role name: `STUDENT` > Save
   - Role name: `INSTRUCTOR` > Save
   - Role name: `ADMIN` > Save

## 7. Test Kullanıcıları Oluştur

### Öğrenci Kullanıcısı

1. Sol menüden "Users" seç
2. "Add user" butonuna tıkla
3. Ayarlar:
   - Username: `student`
   - Email: `student@test.com`
   - First name: `Test`
   - Last name: `Student`
   - Email verified: `ON`
   - "Create"
4. "Credentials" tab'ına git
   - "Set password" tıkla
   - Password: `student123`
   - Temporary: `OFF`
   - "Save"
5. "Role mapping" tab'ına git
   - "Assign role" tıkla
   - `STUDENT` rolünü seç
   - "Assign"

### Eğitmen Kullanıcısı

1. "Users" > "Add user"
2. Ayarlar:
   - Username: `instructor`
   - Email: `instructor@test.com`
   - First name: `Test`
   - Last name: `Instructor`
   - Email verified: `ON`
   - "Create"
3. "Credentials" tab:
   - Password: `instructor123`
   - Temporary: `OFF`
4. "Role mapping" tab:
   - `INSTRUCTOR` rolünü ata

## 8. Client Scopes Ayarla (Rolleri Token'a Ekle)

1. Sol menüden "Client scopes" seç
2. "roles" scope'una tıkla
3. "Mappers" tab'ına git
4. "realm roles" mapper'ına tıkla
5. Ayarlar:
   - Token Claim Name: `roles`
   - Add to ID token: `ON`
   - Add to access token: `ON`
   - Add to userinfo: `ON`
   - "Save"

## 9. Keycloak Bilgilerini Not Et

Frontend için:
- Realm: `quiz-realm`
- Client ID: `quiz-frontend`
- Keycloak URL: `http://localhost:8180`

Backend için:
- Realm: `quiz-realm`
- Client ID: `quiz-backend`
- Client Secret: (Credentials tab'ından kopyaladığın)
- Keycloak URL: `http://localhost:8180`

## Test Kullanıcıları

| Kullanıcı | Şifre | Rol |
|-----------|-------|-----|
| student | student123 | STUDENT |
| instructor | instructor123 | INSTRUCTOR |

## Sonraki Adım

Keycloak hazır! Şimdi frontend ve backend'i entegre edeceğiz.
