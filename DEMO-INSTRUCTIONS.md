# 🎬 Demo Interactivo de Zero Trust - Instrucciones

## ¿Qué es este script?

`demo-logs.sh` es una demostración interactiva que simula el comportamiento real del sistema Zero Trust, mostrando logs detallados en tiempo real con colores y pausas educativas.

## 🚀 Cómo Ejecutar

### Paso 1: Iniciar el Backend

En una terminal, inicia el servidor:

```bash
cd backend
npm run dev
```

Espera a ver el mensaje:
```
🚀 Server running on http://localhost:4000
```

### Paso 2: Ejecutar el Demo

En otra terminal:

```bash
./demo-logs.sh
```

## 🎭 Escenarios que Verás

El demo ejecuta 8 escenarios diferentes:

### 1. ✅ Autenticación Exitosa con MFA
- Usuario se autentica correctamente
- MFA verificado
- Token JWT generado

### 2. ✅ Acceso Permitido a Recurso Seguro
- Dispositivo: Linux con Health Score 90
- Trust Engine evalúa y permite acceso
- Todas las verificaciones pasan

### 3. ❌ Acceso Denegado por Health Score Bajo
- Dispositivo comprometido (score 30)
- Trust Engine deniega acceso
- Razón: antivirus desactualizado

### 4. ❌ Acceso Denegado por OS No Permitido
- Sistema operativo desconocido
- Posible dispositivo rooteado
- Acceso denegado por política

### 5. ✅ Login de Administrador
- Autenticación de usuario privilegiado
- Políticas más estrictas aplicadas
- Token admin generado

### 6. ✅ Acceso Admin Exitoso
- Administrador accede a recurso privilegiado
- Verificación de rol exitosa
- Acceso permitido

### 7. ❌ Intento de Escalada de Privilegios
- Usuario regular intenta acceder a recurso admin
- Trust Engine detecta rol insuficiente
- Evento registrado en audit log

### 8. 🔐 Step-up Required (Sin MFA)
- Usuario intenta login sin segundo factor
- Sistema solicita MFA adicional
- Acceso suspendido hasta completar MFA

## 📊 Qué Aprenderás

El demo ilustra:

- ✅ **Verificación continua**: Cada petición es evaluada independientemente
- ✅ **Evaluación de telemetría**: OS y health score del dispositivo
- ✅ **Control de acceso por roles**: Admin vs User
- ✅ **Decisiones centralizadas**: Trust Engine como punto único
- ✅ **Tres tipos de decisiones**: allow, deny, step-up
- ✅ **Políticas de seguridad**: Aplicadas consistentemente

## 🎨 Características del Script

- **Colores**: Diferentes colores para diferentes tipos de logs
  - 🔵 INFO - Información general
  - 🟢 SUCCESS - Operaciones exitosas
  - 🟡 WARNING - Advertencias
  - 🔴 ERROR - Errores y denegaciones
  - 🟣 SECURITY - Eventos de seguridad

- **Pausas inteligentes**: 1-3 segundos entre operaciones para seguir el flujo

- **Logs detallados**: Muestra exactamente qué evalúa el Trust Engine:
  - Verificación de token
  - Evaluación de OS
  - Evaluación de health score
  - Verificación de MFA
  - Autorización por rol

- **Timestamps**: Cada log tiene su timestamp

- **Comentarios explicativos**: Texto gris explicando cada escenario

## 💡 Tips para la Demostración

1. **Lee los comentarios**: Los textos en gris explican qué está por suceder

2. **Observa los iconos**: 
   - 🚀 Inicio
   - ✅ Éxito
   - ❌ Error
   - ⚠️ Advertencia
   - 🔒 Seguridad
   - 👤 Usuario
   - 👨‍💼 Admin

3. **Sigue las pausas**: El script hace pausas para que puedas leer los logs

4. **Examina las decisiones**: Cada escenario muestra claramente:
   - Qué se evaluó
   - Por qué se tomó la decisión
   - Qué acción se requiere

## 📝 Ejemplo de Salida

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ 🔒 ESCENARIO 2: Acceso a Recurso Seguro (Dispositivo Confiable)
╚═══════════════════════════════════════════════════════════════════════════╝

# El usuario intenta acceder a un recurso protegido
# Dispositivo: Linux con Health Score = 90/100

$ curl http://localhost:4000/resource/secure ...

[2025-11-09 14:32:10] [INFO]     👤 Petición recibida: GET /resource/secure
[2025-11-09 14:32:11] [SECURITY] 🔍 [Auth Middleware] Verificando token JWT...
[2025-11-09 14:32:12] [SUCCESS]  ✓ Token válido: user@example.com (role: user)
[2025-11-09 14:32:13] [SECURITY] 🔍 [Trust Engine] Iniciando evaluación...
[2025-11-09 14:32:14] [INFO]     📱 Telemetría: OS=linux, Health Score=90
[2025-11-09 14:32:15] [SECURITY] 📋 Evaluando política: Sistema Operativo
[2025-11-09 14:32:16] [SUCCESS]  ✓ OS 'linux' está en la lista permitida
...
[2025-11-09 14:32:20] [SUCCESS]  ✅ [Trust Engine] Decisión: ALLOW

╔════════════════════════════════════════════════════════════════════╗
║ ✓ ACCESO PERMITIDO                                                ║
║ Todas las verificaciones de seguridad pasaron exitosamente        ║
╚════════════════════════════════════════════════════════════════════╝
```

## 🎓 Uso Educativo

Este script es perfecto para:

- 📚 **Enseñar Zero Trust**: Muestra visualmente cada principio
- 🎓 **Demos en clase**: Pausas permiten explicar conceptos
- 👥 **Presentaciones**: Salida clara y profesional
- 🔬 **Testing**: Valida que el sistema funciona correctamente
- 📖 **Documentación viva**: Código ejecutable que explica el sistema

## ⚙️ Personalización

Puedes modificar el script para:

- Cambiar los tiempos de pausa (variable `pause`)
- Agregar más escenarios
- Modificar los colores
- Añadir más logs detallados

## 🐛 Solución de Problemas

**Error: "El servidor backend no está corriendo"**
```bash
cd backend && npm run dev
```

**jq no instalado (opcional)**
El script funciona sin jq, solo se usa para formatear JSON.

**Permisos**
```bash
chmod +x demo-logs.sh
```

## 📞 Soporte

Si algo no funciona, verifica:
1. Backend corriendo en puerto 4000
2. Script tiene permisos de ejecución
3. curl está instalado (viene por defecto en macOS)

---

**¡Disfruta la demostración de Zero Trust!** 🔒🎬
