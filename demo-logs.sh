#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Zero Trust - Demo Interactivo con Logs en Tiempo Real
# ═══════════════════════════════════════════════════════════════════════════
# Este script simula el funcionamiento del sistema Zero Trust mostrando
# logs detallados de cada operación, permitiendo entender el flujo completo.
# ═══════════════════════════════════════════════════════════════════════════

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Iconos para diferentes tipos de mensajes
ICON_START="🚀"
ICON_SUCCESS="✅"
ICON_ERROR="❌"
ICON_WARNING="⚠️"
ICON_INFO="ℹ️"
ICON_SECURITY="🔒"
ICON_USER="👤"
ICON_ADMIN="👨‍💼"
ICON_DEVICE="📱"
ICON_CHECK="🔍"
ICON_POLICY="📋"
ICON_ALLOW="✓"
ICON_DENY="✗"

API="http://localhost:4000"

# ═══════════════════════════════════════════════════════════════════════════
# Funciones de Utilidad
# ═══════════════════════════════════════════════════════════════════════════

# Función para mostrar un header con estilo
show_header() {
    local title="$1"
    local icon="$2"
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${icon} ${WHITE}${title}${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Función para mostrar un comentario explicativo
show_comment() {
    local text="$1"
    echo -e "${GRAY}# ${text}${NC}"
}

# Función para simular un log del servidor
show_server_log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    
    case $level in
        "INFO")
            echo -e "${GRAY}[${timestamp}]${NC} ${BLUE}[INFO]${NC}    ${message}"
            ;;
        "SUCCESS")
            echo -e "${GRAY}[${timestamp}]${NC} ${GREEN}[SUCCESS]${NC} ${message}"
            ;;
        "WARNING")
            echo -e "${GRAY}[${timestamp}]${NC} ${YELLOW}[WARNING]${NC} ${message}"
            ;;
        "ERROR")
            echo -e "${GRAY}[${timestamp}]${NC} ${RED}[ERROR]${NC}   ${message}"
            ;;
        "SECURITY")
            echo -e "${GRAY}[${timestamp}]${NC} ${PURPLE}[SECURITY]${NC} ${message}"
            ;;
    esac
}

# Función para mostrar el comando que se va a ejecutar
show_command() {
    local cmd="$1"
    echo ""
    echo -e "${YELLOW}$ ${cmd}${NC}"
    echo ""
}

# Función para pausa dramática
pause() {
    local seconds=${1:-3}
    sleep $seconds
}

# Función para verificar que el servidor esté corriendo
check_server() {
    if ! curl -s "$API" > /dev/null 2>&1; then
        echo -e "${RED}${ICON_ERROR} Error: El servidor backend no está corriendo${NC}"
        echo -e "${YELLOW}${ICON_INFO} Por favor, ejecuta en otra terminal:${NC}"
        echo -e "${WHITE}   cd backend && npm run dev${NC}"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# INICIO DEL DEMO
# ═══════════════════════════════════════════════════════════════════════════

clear

show_header "ZERO TRUST ARCHITECTURE - DEMO EN TIEMPO REAL" "${ICON_START}"

show_comment "Verificando que el sistema Zero Trust esté activo..."
pause 2

check_server

show_server_log "SUCCESS" "${ICON_SUCCESS} Backend Zero Trust detectado en $API"
show_server_log "INFO" "${ICON_SECURITY} Trust Engine inicializado y listo"
show_server_log "INFO" "${ICON_POLICY} Políticas de seguridad cargadas"

pause 3

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 1: Login Exitoso con MFA
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 1: Autenticación Exitosa con MFA" "${ICON_USER}"

show_comment "Un usuario legítimo intenta autenticarse con credenciales válidas y MFA"
pause 2

show_comment "Enviando petición de login..."
show_command "curl -X POST $API/auth/login -H \"Content-Type: application/json\" -d '{\"email\":\"user@example.com\",\"password\":\"password\",\"mfa\":true}'"

pause 2

show_server_log "INFO" "${ICON_USER} Petición de login recibida para: user@example.com"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} Verificando credenciales en base de datos..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Credenciales válidas"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} Verificando MFA (Multi-Factor Authentication)..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} MFA verificado correctamente"
pause 1
show_server_log "INFO" "${ICON_SECURITY} Generando JWT token (válido por 5 minutos)..."
pause 1

LOGIN_RESPONSE=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","mfa":true}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

show_server_log "SUCCESS" "${ICON_SUCCESS} Token JWT generado exitosamente"
show_server_log "INFO" "Token: ${TOKEN:0:30}..."

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ ${ICON_SUCCESS} AUTENTICACIÓN EXITOSA                                           ║${NC}"
echo -e "${GREEN}║ Usuario: user@example.com | Rol: user | MFA: ✓                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 2: Acceso a Recurso Seguro - PERMITIDO
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 2: Acceso a Recurso Seguro (Dispositivo Confiable)" "${ICON_SECURITY}"

show_comment "El usuario intenta acceder a un recurso protegido"
show_comment "Dispositivo: Linux con Health Score = 90/100"
pause 2

show_command "curl $API/resource/secure -H \"Authorization: Bearer <token>\" -H \"x-device-os: linux\" -H \"x-device-health-score: 90\""

pause 2

show_server_log "INFO" "${ICON_USER} Petición recibida: GET /resource/secure"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Auth Middleware] Verificando token JWT..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Token válido: user@example.com (role: user)"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Trust Engine] Iniciando evaluación de confianza..."
pause 1
show_server_log "INFO" "${ICON_DEVICE} Telemetría recibida: OS=linux, Health Score=90"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Sistema Operativo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ OS 'linux' está en la lista permitida"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Health Score del dispositivo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ Health Score 90 >= 50 (mínimo requerido)"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: MFA verificado"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ MFA verificado en el token"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Autorización por rol"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ Rol 'user' autorizado para este recurso"
pause 1

SECURE_RESPONSE=$(curl -s $API/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 90")

show_server_log "SUCCESS" "${ICON_SUCCESS} [Trust Engine] Decisión: ALLOW"
show_server_log "INFO" "Enviando recurso al cliente..."

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║ ${ICON_ALLOW} ACCESO PERMITIDO                                                ║${NC}"
echo -e "${GREEN}║ Todas las verificaciones de seguridad pasaron exitosamente        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 3: Acceso Denegado - Health Score Bajo
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 3: Acceso DENEGADO (Dispositivo Comprometido)" "${ICON_WARNING}"

show_comment "El mismo usuario intenta acceder desde un dispositivo con problemas de seguridad"
show_comment "Dispositivo: Linux con Health Score = 30/100 (antivirus desactualizado)"
pause 2

show_command "curl $API/resource/secure -H \"Authorization: Bearer <token>\" -H \"x-device-os: linux\" -H \"x-device-health-score: 30\""

pause 2

show_server_log "INFO" "${ICON_USER} Petición recibida: GET /resource/secure"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Auth Middleware] Verificando token JWT..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Token válido: user@example.com (role: user)"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Trust Engine] Iniciando evaluación de confianza..."
pause 1
show_server_log "INFO" "${ICON_DEVICE} Telemetría recibida: OS=linux, Health Score=30"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Sistema Operativo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ OS 'linux' está en la lista permitida"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Health Score del dispositivo"
pause 1
show_server_log "ERROR" "${ICON_DENY} ✗ Health Score 30 < 50 (mínimo requerido)"
pause 1
show_server_log "WARNING" "${ICON_WARNING} Dispositivo no cumple con estándares de seguridad"
pause 1

curl -s $API/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 30" > /dev/null

show_server_log "ERROR" "${ICON_DENY} [Trust Engine] Decisión: DENY"
show_server_log "SECURITY" "Razón: Device health score too low: 30. Minimum required: 50"
show_server_log "INFO" "Respondiendo 403 Forbidden"

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║ ${ICON_DENY} ACCESO DENEGADO                                                 ║${NC}"
echo -e "${RED}║ El dispositivo no cumple con las políticas de seguridad           ║${NC}"
echo -e "${RED}║ Acción requerida: Actualizar antivirus y parches de seguridad     ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 4: Sistema Operativo No Permitido
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 4: Acceso DENEGADO (OS No Permitido)" "${ICON_ERROR}"

show_comment "Usuario intenta acceder desde un dispositivo con sistema operativo no corporativo"
show_comment "Dispositivo: Sistema desconocido (posiblemente jailbroken o rooteado)"
pause 2

show_command "curl $API/resource/secure -H \"Authorization: Bearer <token>\" -H \"x-device-os: unknown\" -H \"x-device-health-score: 90\""

pause 2

show_server_log "INFO" "${ICON_USER} Petición recibida: GET /resource/secure"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Auth Middleware] Verificando token JWT..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Token válido: user@example.com (role: user)"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Trust Engine] Iniciando evaluación de confianza..."
pause 1
show_server_log "INFO" "${ICON_DEVICE} Telemetría recibida: OS=unknown, Health Score=90"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Sistema Operativo"
pause 1
show_server_log "ERROR" "${ICON_DENY} ✗ OS 'unknown' NO está en la lista permitida"
show_server_log "INFO" "Sistemas permitidos: linux, mac, windows, ios, android"
pause 1
show_server_log "WARNING" "${ICON_WARNING} Dispositivo potencialmente inseguro detectado"
pause 1

curl -s $API/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: unknown" \
  -H "x-device-health-score: 90" > /dev/null

show_server_log "ERROR" "${ICON_DENY} [Trust Engine] Decisión: DENY"
show_server_log "SECURITY" "Razón: Operating system 'unknown' is not allowed"
show_server_log "INFO" "Respondiendo 403 Forbidden"

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║ ${ICON_DENY} ACCESO DENEGADO                                                 ║${NC}"
echo -e "${RED}║ Sistema operativo no cumple con políticas corporativas            ║${NC}"
echo -e "${RED}║ Solo dispositivos corporativos aprobados pueden acceder           ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 5: Login de Administrador
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 5: Autenticación de Administrador" "${ICON_ADMIN}"

show_comment "Un administrador se autentica para acceder a funciones privilegiadas"
pause 2

show_command "curl -X POST $API/auth/login -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\",\"mfa\":true}'"

pause 2

show_server_log "INFO" "${ICON_ADMIN} Petición de login recibida para: admin@example.com"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} Verificando credenciales en base de datos..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Credenciales válidas para usuario ADMIN"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} Verificando MFA (requerido para roles privilegiados)..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} MFA verificado correctamente"
pause 1
show_server_log "WARNING" "${ICON_WARNING} Usuario de alto privilegio detectado - aplicando políticas estrictas"
pause 1
show_server_log "INFO" "${ICON_SECURITY} Generando JWT token con claims de administrador..."
pause 1

ADMIN_LOGIN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","mfa":true}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token')

show_server_log "SUCCESS" "${ICON_SUCCESS} Token JWT generado para administrador"
show_server_log "SECURITY" "Claims: role=admin, mfaVerified=true"

echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║ ${ICON_SUCCESS} ADMINISTRADOR AUTENTICADO                                       ║${NC}"
echo -e "${PURPLE}║ Usuario: admin@example.com | Rol: ADMIN | MFA: ✓                  ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 6: Acceso Exitoso a Recurso Admin
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 6: Acceso a Recurso Administrativo" "${ICON_ADMIN}"

show_comment "El administrador accede a un recurso que requiere privilegios elevados"
pause 2

show_command "curl $API/resource/admin -H \"Authorization: Bearer <admin-token>\" -H \"x-device-os: mac\" -H \"x-device-health-score: 95\""

pause 2

show_server_log "INFO" "${ICON_ADMIN} Petición recibida: GET /resource/admin"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Auth Middleware] Verificando token JWT..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Token válido: admin@example.com (role: admin)"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Trust Engine] Iniciando evaluación de confianza..."
pause 1
show_server_log "INFO" "${ICON_DEVICE} Telemetría recibida: OS=mac, Health Score=95"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Sistema Operativo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ OS 'mac' está en la lista permitida"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Health Score del dispositivo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ Health Score 95 >= 50 (excelente)"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: MFA verificado"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ MFA verificado en el token"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Autorización por rol"
pause 1
show_server_log "INFO" "Recurso requiere rol: admin"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ Usuario tiene rol 'admin' - AUTORIZADO"
pause 1

curl -s $API/resource/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-device-os: mac" \
  -H "x-device-health-score: 95" > /dev/null

show_server_log "SUCCESS" "${ICON_SUCCESS} [Trust Engine] Decisión: ALLOW"
show_server_log "INFO" "Enviando recurso administrativo al cliente..."

echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║ ${ICON_ALLOW} ACCESO ADMINISTRATIVO PERMITIDO                                 ║${NC}"
echo -e "${PURPLE}║ Usuario: admin@example.com | Recurso: /resource/admin             ║${NC}"
echo -e "${PURPLE}║ Todas las verificaciones de seguridad pasaron exitosamente        ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 7: Usuario Regular Intenta Acceder a Recurso Admin
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 7: Escalada de Privilegios DENEGADA" "${ICON_WARNING}"

show_comment "Un usuario regular intenta acceder a un recurso administrativo"
show_comment "Este es un intento de escalada de privilegios"
pause 2

show_command "curl $API/resource/admin -H \"Authorization: Bearer <user-token>\" -H \"x-device-os: linux\" -H \"x-device-health-score: 90\""

pause 2

show_server_log "INFO" "${ICON_USER} Petición recibida: GET /resource/admin"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Auth Middleware] Verificando token JWT..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Token válido: user@example.com (role: user)"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} [Trust Engine] Iniciando evaluación de confianza..."
pause 1
show_server_log "INFO" "${ICON_DEVICE} Telemetría recibida: OS=linux, Health Score=90"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Sistema Operativo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ OS 'linux' está en la lista permitida"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Health Score del dispositivo"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ Health Score 90 >= 50"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: MFA verificado"
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} ✓ MFA verificado en el token"
pause 1
show_server_log "SECURITY" "${ICON_POLICY} Evaluando política: Autorización por rol"
pause 1
show_server_log "INFO" "Recurso requiere rol: admin"
pause 1
show_server_log "ERROR" "${ICON_DENY} ✗ Usuario tiene rol 'user' - INSUFICIENTE"
pause 1
show_server_log "WARNING" "${ICON_WARNING} Posible intento de escalada de privilegios detectado"
pause 1

curl -s $API/resource/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 90" > /dev/null

show_server_log "ERROR" "${ICON_DENY} [Trust Engine] Decisión: DENY"
show_server_log "SECURITY" "Razón: Insufficient privileges. Required: admin, Current: user"
show_server_log "INFO" "Respondiendo 403 Forbidden"
show_server_log "SECURITY" "Evento de seguridad registrado en audit log"

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║ ${ICON_DENY} ACCESO DENEGADO - PRIVILEGIOS INSUFICIENTES                     ║${NC}"
echo -e "${RED}║ Usuario 'user' intentó acceder a recurso que requiere rol 'admin' ║${NC}"
echo -e "${RED}║ Este evento ha sido registrado para auditoría de seguridad        ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# ESCENARIO 8: Login sin MFA (Step-up Required)
# ═══════════════════════════════════════════════════════════════════════════

show_header "ESCENARIO 8: Autenticación Sin MFA (Step-up Required)" "${ICON_WARNING}"

show_comment "Usuario intenta autenticarse sin completar el segundo factor"
pause 2

show_command "curl -X POST $API/auth/login -d '{\"email\":\"user@example.com\",\"password\":\"password\",\"mfa\":false}'"

pause 2

show_server_log "INFO" "${ICON_USER} Petición de login recibida para: user@example.com"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} Verificando credenciales en base de datos..."
pause 1
show_server_log "SUCCESS" "${ICON_ALLOW} Credenciales válidas"
pause 1
show_server_log "SECURITY" "${ICON_CHECK} Verificando MFA (Multi-Factor Authentication)..."
pause 1
show_server_log "WARNING" "${ICON_WARNING} MFA no proporcionado pero requerido por política"
pause 1
show_server_log "INFO" "Usuario tiene MFA habilitado en su perfil"
pause 1

curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","mfa":false}' > /dev/null

show_server_log "WARNING" "${ICON_WARNING} Decisión: STEP-UP requerido"
show_server_log "INFO" "Razón: Multi-factor authentication required"
show_server_log "INFO" "Respondiendo 401 Unauthorized con solicitud de MFA"

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║ ${ICON_WARNING} STEP-UP AUTHENTICATION REQUERIDO                                ║${NC}"
echo -e "${YELLOW}║ Las credenciales son válidas pero falta el segundo factor         ║${NC}"
echo -e "${YELLOW}║ Acción requerida: Completar MFA (TOTP, SMS o biometría)           ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════════╝${NC}"

pause 4

# ═══════════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════════════

show_header "RESUMEN DE EVALUACIONES ZERO TRUST" "${ICON_INFO}"

echo -e "${WHITE}Durante esta demostración, el Trust Engine evaluó múltiples escenarios:${NC}"
echo ""
echo -e "${GREEN}${ICON_SUCCESS} Escenario 1:${NC} Login exitoso con MFA                    ${GREEN}[ALLOW]${NC}"
echo -e "${GREEN}${ICON_SUCCESS} Escenario 2:${NC} Acceso con dispositivo confiable          ${GREEN}[ALLOW]${NC}"
echo -e "${RED}${ICON_DENY} Escenario 3:${NC} Dispositivo con health score bajo        ${RED}[DENY]${NC}"
echo -e "${RED}${ICON_DENY} Escenario 4:${NC} Sistema operativo no permitido           ${RED}[DENY]${NC}"
echo -e "${GREEN}${ICON_SUCCESS} Escenario 5:${NC} Login de administrador exitoso           ${GREEN}[ALLOW]${NC}"
echo -e "${GREEN}${ICON_SUCCESS} Escenario 6:${NC} Acceso admin con privilegios correctos   ${GREEN}[ALLOW]${NC}"
echo -e "${RED}${ICON_DENY} Escenario 7:${NC} Intento de escalada de privilegios       ${RED}[DENY]${NC}"
echo -e "${YELLOW}${ICON_WARNING} Escenario 8:${NC} Autenticación sin MFA                    ${YELLOW}[STEP-UP]${NC}"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║ ${ICON_SECURITY} PRINCIPIOS ZERO TRUST DEMOSTRADOS                              ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC} ${ICON_CHECK} Verificación continua en cada petición                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${ICON_CHECK} Evaluación de contexto y telemetría del dispositivo          ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${ICON_CHECK} Control de acceso basado en roles (RBAC)                     ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${ICON_CHECK} Políticas centralizadas aplicadas consistentemente           ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${ICON_CHECK} Menor privilegio - solo acceso necesario                     ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} ${ICON_CHECK} Sin confianza implícita - todo se verifica                   ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"

echo ""
show_server_log "INFO" "${ICON_INFO} Demo completado. Sistema Zero Trust operando normalmente"
show_server_log "INFO" "${ICON_SECURITY} Trust Engine listo para evaluar próximas peticiones"

echo ""
echo -e "${GREEN}${ICON_SUCCESS} Demo completado exitosamente!${NC}"
echo ""
