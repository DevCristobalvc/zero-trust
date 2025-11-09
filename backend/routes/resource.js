/**
 * Rutas de Recursos Protegidos
 * Endpoints que demuestran diferentes niveles de control de acceso
 */

import express from 'express';
import { authenticateToken } from '../auth.js';
import { trustMiddleware } from '../trustEngine.js';

const router = express.Router();

/**
 * @swagger
 * /resource/public:
 *   get:
 *     summary: Recurso público sin autenticación
 *     description: Este endpoint es accesible para cualquier persona sin necesidad de autenticación.
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Recurso público obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is a public resource
 *                 data:
 *                   type: object
 *                   properties:
 *                     info:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
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
 * @swagger
 * /resource/secure:
 *   get:
 *     summary: Recurso seguro con evaluación del Trust Engine
 *     description: |
 *       Requiere autenticación JWT y pasa por evaluación completa del Trust Engine.
 *       El Trust Engine verifica:
 *       - Token JWT válido
 *       - Sistema operativo permitido
 *       - Health score >= 50
 *       - MFA verificado
 *       - Autorización por rol
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/deviceOS'
 *       - $ref: '#/components/parameters/deviceHealthScore'
 *     responses:
 *       200:
 *         description: Acceso permitido al recurso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
 * @swagger
 * /resource/admin:
 *   get:
 *     summary: Recurso administrativo (solo para administradores)
 *     description: |
 *       Requiere autenticación JWT con rol de administrador.
 *       Solo usuarios con role='admin' pueden acceder.
 *       También pasa por evaluación completa del Trust Engine.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/deviceOS'
 *       - $ref: '#/components/parameters/deviceHealthScore'
 *     responses:
 *       200:
 *         description: Acceso administrativo permitido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     info:
 *                       type: string
 *                     adminUser:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     adminFeatures:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Acceso denegado - requiere rol de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DenyResponse'
 *             example:
 *               decision: deny
 *               reason: "Insufficient privileges. Required: admin, Current: user"
 *               message: Access denied
 *               detail: Authorization check failed
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
 * @swagger
 * /resource/sensitive:
 *   get:
 *     summary: Recurso altamente sensible (máximo nivel de seguridad)
 *     description: |
 *       Recurso con los requisitos de seguridad más estrictos.
 *       Requiere:
 *       - Autenticación JWT válida
 *       - Health score >= 80 (más alto que otros recursos)
 *       - Sistema operativo permitido
 *       - MFA verificado
 *       
 *       Contiene datos muy sensibles como tarjetas de crédito y SSN.
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/deviceOS'
 *       - name: x-device-health-score
 *         in: header
 *         description: Health score del dispositivo (mínimo 80 para este recurso)
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 80
 *           maximum: 100
 *           example: 90
 *     responses:
 *       200:
 *         description: Acceso permitido a datos sensibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     info:
 *                       type: string
 *                     sensitiveData:
 *                       type: object
 *                       properties:
 *                         creditCards:
 *                           type: string
 *                           example: "****-****-****-1234"
 *                         ssn:
 *                           type: string
 *                           example: "***-**-4567"
 *                         accessLevel:
 *                           type: string
 *                           example: RESTRICTED
 *                     accessedBy:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Acceso denegado - health score insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DenyResponse'
 *             example:
 *               decision: deny
 *               reason: "Sensitive data requires health score >= 80"
 *               currentScore: 70
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
