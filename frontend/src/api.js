/**
 * API Client para comunicación con el backend
 * Maneja todas las peticiones HTTP incluyendo headers de telemetría
 */

const API_BASE_URL = 'http://localhost:4000';

/**
 * Obtiene telemetría simulada del dispositivo
 * En un sistema real, esto detectaría el OS y evaluaría la salud del dispositivo
 */
function getDeviceTelemetry() {
  // Detectar sistema operativo (simplificado)
  const userAgent = navigator.userAgent.toLowerCase();
  let os = 'unknown';
  
  if (userAgent.includes('mac')) os = 'mac';
  else if (userAgent.includes('win')) os = 'windows';
  else if (userAgent.includes('linux')) os = 'linux';
  else if (userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios';
  else if (userAgent.includes('android')) os = 'android';

  // Simular health score (en producción esto vendría de un agente de seguridad)
  // Por defecto usamos un score alto para permitir acceso
  const healthScore = localStorage.getItem('device-health-score') || '90';

  return {
    os,
    healthScore: parseInt(healthScore)
  };
}

/**
 * Construye headers comunes para todas las peticiones
 */
function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Agregar token si está disponible y se requiere
  if (includeAuth) {
    const token = localStorage.getItem('auth-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Agregar telemetría del dispositivo
  const telemetry = getDeviceTelemetry();
  headers['x-device-os'] = telemetry.os;
  headers['x-device-health-score'] = telemetry.healthScore.toString();

  return headers;
}

/**
 * Maneja errores de respuesta
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      status: response.status,
      ...data
    };
  }
  
  return data;
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Autenticación
 */
export async function login(email, password, mfa = true) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, password, mfa })
  });

  const data = await handleResponse(response);
  
  // Guardar token si el login fue exitoso
  if (data.token) {
    localStorage.setItem('auth-token', data.token);
    localStorage.setItem('user-email', data.user.email);
    localStorage.setItem('user-role', data.user.role);
  }
  
  return data;
}

/**
 * Cerrar sesión
 */
export function logout() {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user-email');
  localStorage.removeItem('user-role');
}

/**
 * Verificar si hay sesión activa
 */
export function isAuthenticated() {
  return !!localStorage.getItem('auth-token');
}

/**
 * Obtener información del usuario
 */
export function getCurrentUser() {
  return {
    email: localStorage.getItem('user-email'),
    role: localStorage.getItem('user-role')
  };
}

/**
 * Validar token actual
 */
export async function validateToken() {
  const token = localStorage.getItem('auth-token');
  if (!token) return { valid: false };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ token })
    });

    return await handleResponse(response);
  } catch (error) {
    return { valid: false, error };
  }
}

/**
 * Obtener políticas de seguridad
 */
export async function getPolicies() {
  const response = await fetch(`${API_BASE_URL}/auth/policies`, {
    headers: getHeaders(false)
  });

  return await handleResponse(response);
}

/**
 * Acceder a recurso público
 */
export async function getPublicResource() {
  const response = await fetch(`${API_BASE_URL}/resource/public`, {
    headers: getHeaders(false)
  });

  return await handleResponse(response);
}

/**
 * Acceder a recurso seguro
 */
export async function getSecureResource() {
  const response = await fetch(`${API_BASE_URL}/resource/secure`, {
    headers: getHeaders()
  });

  return await handleResponse(response);
}

/**
 * Acceder a recurso administrativo
 */
export async function getAdminResource() {
  const response = await fetch(`${API_BASE_URL}/resource/admin`, {
    headers: getHeaders()
  });

  return await handleResponse(response);
}

/**
 * Acceder a recurso sensible
 */
export async function getSensitiveResource() {
  const response = await fetch(`${API_BASE_URL}/resource/sensitive`, {
    headers: getHeaders()
  });

  return await handleResponse(response);
}

/**
 * Cambiar el health score del dispositivo (para testing)
 */
export function setDeviceHealthScore(score) {
  localStorage.setItem('device-health-score', score.toString());
}

/**
 * Obtener telemetría actual
 */
export function getCurrentTelemetry() {
  return getDeviceTelemetry();
}
