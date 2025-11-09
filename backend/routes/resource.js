/**
 * Rutas de Recursos Protegidos
 * Endpoints que demuestran diferentes niveles de control de acceso
 */

import express from 'express';
import { authenticateToken } from '../auth.js';
import { trustMiddleware } from '../trustEngine.js';

const router = express.Router();

/**
 * Endpoint público - No requiere autenticación
 */
router.get('/public', (req, res) => {
  res.json({
    message: 'This is a public resource',
    data: {
      info: 'Anyone can access this endpoint without authentication',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * Endpoint seguro - Requiere autenticación y evaluación de Trust Engine
 * Accesible para usuarios autenticados con dispositivos confiables
 */
router.get('/secure', authenticateToken, trustMiddleware(), (req, res) => {
  res.json({
    message: 'Access granted to secure resource',
    data: {
      info: 'This resource requires authentication and passes all security checks',
      accessedBy: req.user.email,
      role: req.user.role,
      timestamp: new Date().toISOString(),
      securityData: {
        deviceTelemetry: {
          os: req.headers['x-device-os'],
          healthScore: req.headers['x-device-health-score']
        },
        evaluation: req.trustEvaluation
      }
    }
  });
});

/**
 * Endpoint administrativo - Requiere rol de admin
 * Solo accesible para usuarios con rol 'admin'
 */
router.get('/admin', authenticateToken, trustMiddleware('admin'), (req, res) => {
  res.json({
    message: 'Access granted to admin resource',
    data: {
      info: 'This is a restricted administrative resource',
      adminUser: req.user.email,
      timestamp: new Date().toISOString(),
      adminFeatures: [
        'User management',
        'Security policy configuration',
        'Audit logs',
        'System settings'
      ]
    }
  });
});

/**
 * Endpoint para datos sensibles - Máximo nivel de seguridad
 * Requiere autenticación, MFA verificado, y dispositivo con alta puntuación
 */
router.get('/sensitive', authenticateToken, trustMiddleware(), (req, res) => {
  const healthScore = parseInt(req.headers['x-device-health-score'] || '0');
  
  // Para datos muy sensibles, podríamos requerir un health score más alto
  if (healthScore < 80) {
    return res.status(403).json({
      decision: 'deny',
      reason: 'Sensitive data requires health score >= 80',
      currentScore: healthScore
    });
  }

  res.json({
    message: 'Access granted to sensitive resource',
    data: {
      info: 'This resource contains highly sensitive information',
      sensitiveData: {
        creditCards: '****-****-****-1234',
        ssn: '***-**-4567',
        accessLevel: 'RESTRICTED'
      },
      accessedBy: req.user.email,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
