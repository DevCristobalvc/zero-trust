/**
 * Trust Engine - Módulo Central de Evaluación de Confianza
 * 
 * Este módulo implementa los principios del modelo Zero Trust:
 * - Nunca confíes, siempre verifica
 * - Evaluación continua basada en contexto
 * - Decisiones centralizadas basadas en políticas
 * - Control de acceso dinámico
 */

// Políticas de seguridad configurables
const SECURITY_POLICIES = {
  // Sistemas operativos permitidos
  allowedOS: ['linux', 'mac', 'windows', 'ios', 'android'],
  
  // Puntuación mínima de salud del dispositivo (0-100)
  minHealthScore: 50,
  
  // Requerir MFA para accesos sensibles
  requireMFA: true,
  
  // Roles que requieren mayor nivel de seguridad
  highSecurityRoles: ['admin']
};

/**
 * Evalúa la telemetría del dispositivo
 * @param {object} telemetry - Datos de telemetría del dispositivo
 * @returns {object} Resultado de la evaluación
 */
function evaluateDeviceTelemetry(telemetry) {
  const { os, healthScore } = telemetry;

  // Verificar sistema operativo
  if (!os || !SECURITY_POLICIES.allowedOS.includes(os.toLowerCase())) {
    return {
      passed: false,
      reason: `Operating system '${os}' is not allowed. Allowed: ${SECURITY_POLICIES.allowedOS.join(', ')}`
    };
  }

  // Verificar puntuación de salud del dispositivo
  const score = parseInt(healthScore);
  if (isNaN(score) || score < SECURITY_POLICIES.minHealthScore) {
    return {
      passed: false,
      reason: `Device health score too low: ${score}. Minimum required: ${SECURITY_POLICIES.minHealthScore}`
    };
  }

  return { passed: true };
}

/**
 * Evalúa el contexto de autenticación del usuario
 * @param {object} user - Datos del usuario desde el JWT
 * @returns {object} Resultado de la evaluación
 */
function evaluateUserContext(user) {
  // Verificar que el usuario tenga MFA verificado
  if (SECURITY_POLICIES.requireMFA && !user.mfaVerified) {
    return {
      passed: false,
      reason: 'Multi-factor authentication required but not verified',
      requiresStepUp: true
    };
  }

  // Para roles de alta seguridad, podríamos requerir verificaciones adicionales
  if (SECURITY_POLICIES.highSecurityRoles.includes(user.role)) {
    // Aquí podrían agregarse más verificaciones para usuarios admin
    // Por ejemplo: verificar ubicación, horario de acceso, etc.
  }

  return { passed: true };
}

/**
 * Evalúa si el usuario tiene el rol necesario para acceder al recurso
 * @param {object} user - Datos del usuario
 * @param {string} requiredRole - Rol requerido
 * @returns {object} Resultado de la evaluación
 */
function evaluateAuthorization(user, requiredRole) {
  if (requiredRole && user.role !== requiredRole) {
    // En un sistema más complejo, aquí verificaríamos permisos granulares
    if (requiredRole === 'admin' && user.role === 'user') {
      return {
        passed: false,
        reason: `Insufficient privileges. Required: ${requiredRole}, Current: ${user.role}`
      };
    }
  }

  return { passed: true };
}

/**
 * FUNCIÓN PRINCIPAL DEL TRUST ENGINE
 * Evalúa todos los factores y toma una decisión centralizada
 * 
 * @param {object} request - Objeto de la petición HTTP de Express
 * @param {string} requiredRole - Rol requerido para el recurso (opcional)
 * @returns {object} Decisión de acceso: { decision: 'allow'|'deny'|'step-up', reason: string }
 */
export function evaluate(request, requiredRole = null) {
  try {
    // 1. Extraer el usuario autenticado (provisto por el middleware de auth)
    const user = request.user;
    if (!user) {
      return {
        decision: 'deny',
        reason: 'No authenticated user found'
      };
    }

    // 2. Extraer telemetría del dispositivo desde los headers
    const telemetry = {
      os: request.headers['x-device-os'] || 'unknown',
      healthScore: request.headers['x-device-health-score'] || '0'
    };

    console.log(`[Trust Engine] Evaluating access for ${user.email} (${user.role})`);
    console.log(`[Trust Engine] Device: ${telemetry.os}, Health: ${telemetry.healthScore}`);

    // 3. Evaluar telemetría del dispositivo
    const deviceEval = evaluateDeviceTelemetry(telemetry);
    if (!deviceEval.passed) {
      return {
        decision: 'deny',
        reason: deviceEval.reason,
        detail: 'Device telemetry check failed'
      };
    }

    // 4. Evaluar contexto del usuario (MFA, etc.)
    const userEval = evaluateUserContext(user);
    if (!userEval.passed) {
      return {
        decision: userEval.requiresStepUp ? 'step-up' : 'deny',
        reason: userEval.reason,
        detail: 'User context check failed'
      };
    }

    // 5. Evaluar autorización por rol
    if (requiredRole) {
      const authzEval = evaluateAuthorization(user, requiredRole);
      if (!authzEval.passed) {
        return {
          decision: 'deny',
          reason: authzEval.reason,
          detail: 'Authorization check failed'
        };
      }
    }

    // 6. Todas las verificaciones pasaron - PERMITIR ACCESO
    console.log(`[Trust Engine] ✓ Access ALLOWED for ${user.email}`);
    return {
      decision: 'allow',
      reason: 'All security checks passed',
      user: {
        email: user.email,
        role: user.role
      }
    };

  } catch (error) {
    console.error('[Trust Engine] Error during evaluation:', error);
    return {
      decision: 'deny',
      reason: 'Internal evaluation error',
      detail: error.message
    };
  }
}

/**
 * Middleware para aplicar el Trust Engine a endpoints protegidos
 * @param {string} requiredRole - Rol requerido (opcional)
 */
export function trustMiddleware(requiredRole = null) {
  return (req, res, next) => {
    const evaluation = evaluate(req, requiredRole);

    if (evaluation.decision === 'allow') {
      // Adjuntar el resultado de la evaluación a la request
      req.trustEvaluation = evaluation;
      next();
    } else if (evaluation.decision === 'step-up') {
      res.status(401).json({
        decision: 'step-up',
        reason: evaluation.reason,
        message: 'Additional authentication required',
        detail: evaluation.detail
      });
    } else {
      // deny
      res.status(403).json({
        decision: 'deny',
        reason: evaluation.reason,
        message: 'Access denied',
        detail: evaluation.detail
      });
    }
  };
}

/**
 * Exporta las políticas de seguridad para consulta
 */
export function getPolicies() {
  return { ...SECURITY_POLICIES };
}
