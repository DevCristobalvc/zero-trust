# 📖 Guía de Uso de Swagger/OpenAPI

## 🎯 ¿Qué es Swagger UI?

Swagger UI es una interfaz web interactiva que permite explorar y probar la API Zero Trust directamente desde el navegador, sin necesidad de usar herramientas como cURL o Postman.

## 🚀 Acceso

Una vez que el backend esté corriendo, visita:

**http://localhost:4000/api-docs**

## 📋 Estructura de la Documentación

La documentación está organizada en 3 categorías principales:

### 1. 🔐 Authentication
Endpoints relacionados con autenticación y gestión de tokens:
- `POST /auth/login` - Autenticar usuario con credenciales y MFA
- `POST /auth/validate` - Validar un token JWT existente
- `GET /auth/policies` - Obtener políticas de seguridad activas

### 2. 📦 Resources
Recursos protegidos con diferentes niveles de acceso:
- `GET /resource/public` - Recurso público (sin autenticación)
- `GET /resource/secure` - Recurso seguro (autenticación + Trust Engine)
- `GET /resource/admin` - Recurso administrativo (solo admins)
- `GET /resource/sensitive` - Recurso altamente sensible (health score >= 80)

### 3. 🛡️ Security
Información de seguridad y configuración:
- `GET /` - Información general de la API

## 🔑 Cómo Autenticarse

### Paso 1: Obtener un Token

1. Expande el endpoint `POST /auth/login`
2. Haz clic en **"Try it out"**
3. Modifica el body JSON con credenciales válidas:

```json
{
  "email": "user@example.com",
  "password": "password",
  "mfa": true
}
```

4. Haz clic en **"Execute"**
5. En la respuesta, copia el valor del campo `token`

### Paso 2: Autorizar con el Token

1. Haz clic en el botón **"Authorize"** 🔒 en la parte superior derecha
2. En el campo "Value", pega el token (sin el prefijo "Bearer")
3. Haz clic en **"Authorize"**
4. Haz clic en **"Close"**

¡Ahora puedes probar todos los endpoints protegidos!

## 🧪 Probando Endpoints

### Ejemplo: Acceder a Recurso Seguro

1. Asegúrate de estar autenticado (paso anterior)
2. Expande `GET /resource/secure`
3. Haz clic en **"Try it out"**
4. Rellena los headers requeridos:
   - `x-device-os`: `linux` (o mac, windows, ios, android)
   - `x-device-health-score`: `90` (valor entre 0-100)
5. Haz clic en **"Execute"**
6. Observa la respuesta:
   - **200 OK** = Acceso permitido ✅
   - **403 Forbidden** = Acceso denegado ❌
   - **401 Unauthorized** = Token inválido o expirado 🔐

### Ejemplo: Probar Denegación por Health Score Bajo

1. Expande `GET /resource/secure`
2. Haz clic en **"Try it out"**
3. Configura los headers:
   - `x-device-os`: `linux`
   - `x-device-health-score`: `30` ⚠️ (por debajo del mínimo)
4. Haz clic en **"Execute"**
5. Deberías recibir **403 Forbidden** con el mensaje:
   ```json
   {
     "decision": "deny",
     "reason": "Device health score too low: 30. Minimum required: 50"
   }
   ```

### Ejemplo: Intentar Acceso Admin sin Permisos

1. Autentícate como usuario regular (`user@example.com`)
2. Intenta acceder a `GET /resource/admin`
3. Deberías recibir **403 Forbidden**:
   ```json
   {
     "decision": "deny",
     "reason": "Insufficient privileges. Required: admin, Current: user"
   }
   ```

## 📱 Headers de Telemetría

Todos los endpoints protegidos requieren estos headers:

| Header | Descripción | Valores Permitidos | Ejemplo |
|--------|-------------|-------------------|---------|
| `x-device-os` | Sistema operativo del dispositivo | linux, mac, windows, ios, android | `linux` |
| `x-device-health-score` | Puntuación de salud (0-100) | 0-100 | `90` |

**Nota:** El recurso `/resource/sensitive` requiere health score >= 80

## 🎨 Características de Swagger UI

### 📊 Esquemas
Cada endpoint muestra:
- **Request Body Schema**: Estructura esperada del body
- **Response Schema**: Estructura de la respuesta
- **Parameters**: Headers, query params, etc.

### 💡 Ejemplos
Múltiples ejemplos por endpoint:
- Usuario regular
- Administrador
- Sin MFA
- Credenciales inválidas
- Diferentes health scores

### 🔍 Modelos
En la parte inferior, encuentra la sección "Schemas" con todos los modelos:
- `LoginRequest`
- `LoginSuccessResponse`
- `DenyResponse`
- `StepUpResponse`
- `SecurityPolicies`
- `ResourceResponse`

## 🌟 Tips y Trucos

### 1. Explorar sin Ejecutar
Puedes leer toda la documentación sin ejecutar nada. Útil para entender la API antes de usarla.

### 2. Ver Código de Respuesta
Swagger muestra todos los posibles códigos de respuesta:
- **200** - Exitoso
- **400** - Bad Request
- **401** - No autenticado
- **403** - No autorizado (permisos insuficientes)
- **404** - No encontrado
- **500** - Error del servidor

### 3. Copiar como cURL
Después de ejecutar, puedes copiar el comando cURL equivalente en la sección "cURL".

### 4. Ver Headers de Respuesta
Expande la respuesta para ver todos los headers HTTP retornados.

### 5. Experimentar con Valores
Cambia los valores de health score, OS, etc. para ver cómo responde el Trust Engine.

## 🎓 Casos de Uso Educativos

### Caso 1: Flujo Completo de Login
1. `POST /auth/login` con MFA = true → Obtener token
2. Autorizar con el token
3. `GET /resource/secure` con telemetría buena → Acceso permitido

### Caso 2: Demostrar Zero Trust
1. Login exitoso
2. Cambiar health score a 30
3. Intenta acceder a `/resource/secure` → Denegado
4. **Principio**: Incluso con token válido, el acceso se deniega si el dispositivo no es confiable

### Caso 3: Control de Acceso por Roles
1. Login como user
2. Intenta `/resource/admin` → Denegado
3. Login como admin
4. Intenta `/resource/admin` → Permitido
5. **Principio**: Menor privilegio - solo el acceso necesario

### Caso 4: Step-up Authentication
1. `POST /auth/login` con MFA = false → Step-up requerido
2. **Principio**: Si falta un factor de autenticación, el sistema solicita completarlo

## 🐛 Troubleshooting

### "Failed to fetch"
- Verifica que el backend esté corriendo en puerto 4000
- Revisa la consola del navegador para errores CORS

### "Unauthorized" en todos los endpoints
- Tu token expiró (duran 5 minutos)
- Haz login nuevamente para obtener un token nuevo
- Verifica que copiaste el token completo

### "Invalid or expired token"
- El token tiene formato incorrecto
- El token expiró
- Obtén un nuevo token con `/auth/login`

### Headers no aparecen
- Asegúrate de hacer clic en "Try it out" primero
- Los headers aparecen después de activar el modo de prueba

## 📚 Recursos Adicionales

- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **Código fuente**: Ver `backend/swagger.js` para la configuración

## 🎉 ¡Explora y Experimenta!

Swagger UI es una herramienta poderosa para:
- ✅ Aprender cómo funciona la API
- ✅ Probar diferentes escenarios
- ✅ Entender el modelo Zero Trust
- ✅ Validar implementaciones
- ✅ Documentar para otros desarrolladores

**¡No tengas miedo de experimentar! Puedes probar todos los escenarios sin afectar ningún dato real.**

---

**¿Preguntas?** Consulta el README.md principal o ejecuta `./demo-logs.sh` para ver el sistema en acción.
