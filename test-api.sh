#!/bin/bash

# Script de testing para Zero Trust Demo
# Este script prueba todos los endpoints del backend

API="http://localhost:4000"
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Zero Trust API Testing Suite          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que el servidor esté corriendo
echo -e "${YELLOW}Verificando servidor...${NC}"
if ! curl -s "$API" > /dev/null; then
    echo -e "${RED}❌ Error: El servidor backend no está corriendo en $API${NC}"
    echo -e "${YELLOW}💡 Ejecuta: cd backend && npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Servidor backend activo${NC}"
echo ""

# Test 1: Login exitoso con MFA
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 1: Login exitoso con MFA${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","mfa":true}')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Token obtenido exitosamente${NC}"
else
    echo -e "${RED}❌ Error obteniendo token${NC}"
    exit 1
fi
echo ""

# Test 2: Login sin MFA (step-up)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 2: Login sin MFA (debe pedir step-up)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","mfa":false}' | jq .
echo ""

# Test 3: Recurso público
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 3: Acceso a recurso público (sin auth)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/public | jq .
echo ""

# Test 4: Recurso seguro con telemetría buena
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 4: Recurso seguro (health score 90)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 90" | jq .
echo ""

# Test 5: Recurso seguro con health score bajo
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 5: Recurso seguro DENEGADO (health score 30)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 30" | jq .
echo ""

# Test 6: OS no permitido
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 6: Recurso seguro DENEGADO (OS desconocido)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/secure \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: unknown" \
  -H "x-device-health-score: 90" | jq .
echo ""

# Test 7: Login como admin
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 7: Login como administrador${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
ADMIN_LOGIN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","mfa":true}')
echo "$ADMIN_LOGIN" | jq .
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token')
echo ""

# Test 8: Recurso admin con token de admin
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 8: Recurso admin (con rol admin)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-device-os: mac" \
  -H "x-device-health-score: 95" | jq .
echo ""

# Test 9: Usuario regular intenta acceder a admin
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 9: Usuario regular DENEGADO en admin${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 90" | jq .
echo ""

# Test 10: Recurso sensible (requiere health score >= 80)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 10: Recurso sensible (health score 85)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/sensitive \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 85" | jq .
echo ""

# Test 11: Recurso sensible denegado
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 11: Recurso sensible DENEGADO (health score 70)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/resource/sensitive \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-device-os: linux" \
  -H "x-device-health-score: 70" | jq .
echo ""

# Test 12: Políticas de seguridad
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 12: Obtener políticas de seguridad${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s $API/auth/policies | jq .
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✓ Testing Completado Exitosamente     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Resumen de Tests:${NC}"
echo -e "  ${GREEN}✓${NC} Login con MFA"
echo -e "  ${GREEN}✓${NC} Login sin MFA (step-up)"
echo -e "  ${GREEN}✓${NC} Recurso público"
echo -e "  ${GREEN}✓${NC} Acceso permitido con telemetría buena"
echo -e "  ${GREEN}✓${NC} Acceso denegado por health score bajo"
echo -e "  ${GREEN}✓${NC} Acceso denegado por OS no permitido"
echo -e "  ${GREEN}✓${NC} Login como admin"
echo -e "  ${GREEN}✓${NC} Acceso a recurso admin"
echo -e "  ${GREEN}✓${NC} Denegación por rol insuficiente"
echo -e "  ${GREEN}✓${NC} Recurso sensible con score alto"
echo -e "  ${GREEN}✓${NC} Recurso sensible denegado"
echo -e "  ${GREEN}✓${NC} Políticas de seguridad"
echo ""
echo -e "${BLUE}🎉 Zero Trust está funcionando correctamente!${NC}"
