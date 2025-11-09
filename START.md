# 🚀 Guía Rápida de Inicio - Zero Trust Demo

## Pasos para Ejecutar el Proyecto

### 1️⃣ Abrir dos terminales

Necesitarás dos terminales separadas: una para el backend y otra para el frontend.

### 2️⃣ Terminal 1 - Backend

```bash
cd /Users/cristobal.valencia/Desktop/usc/arq/zero-trust/backend
npm run dev
```

Deberías ver:
```
╔════════════════════════════════════════════╗
║     Zero Trust Demo Backend Started        ║
╚════════════════════════════════════════════╝

🚀 Server running on http://localhost:4000
```

### 3️⃣ Terminal 2 - Frontend

```bash
cd /Users/cristobal.valencia/Desktop/usc/arq/zero-trust/frontend
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 4️⃣ Abrir en el navegador

Visita: **http://localhost:5173/**

### 5️⃣ Credenciales de prueba

**Usuario Regular:**
- Email: `user@example.com`
- Password: `password`
- ✅ Marcar el checkbox de MFA

**Usuario Admin:**
- Email: `admin@example.com`
- Password: `admin123`
- ✅ Marcar el checkbox de MFA

## 🧪 Probar con cURL

En una tercera terminal, puedes probar los endpoints:

```bash
# 1. Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","mfa":true}'

# 2. Copiar el token de la respuesta y usarlo aquí:
TOKEN="<tu-token-aqui>"

# 3. Acceder a recurso seguro (exitoso)
curl http://localhost:4000/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 90"

# 4. Acceso denegado por health score bajo
curl http://localhost:4000/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 30"
```

## 🛑 Detener los servidores

Presiona `Ctrl + C` en cada terminal para detener los servidores.

## ❓ Problemas Comunes

### Puerto ya en uso
```bash
# Matar procesos en los puertos
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Dependencias no instaladas
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

**¡Listo para explorar Zero Trust!** 🔒
