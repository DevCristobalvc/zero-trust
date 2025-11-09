/**
 * Zero Trust Backend - Servidor Principal
 * 
 * Este servidor implementa los principios de Zero Trust:
 * - Autenticación continua
 * - Evaluación de contexto en cada petición
 * - Decisiones centralizadas de acceso
 * - Telemetría de dispositivos
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { 
  validateCredentials, 
  validateMFA, 
  generateToken,
  verifyToken 
} from './auth.js';
import { getPolicies } from './trustEngine.js';
import resourceRoutes from './routes/resource.js';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Zero Trust API Docs'
}));

// Logger de peticiones
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', {
    authorization: req.headers['authorization'] ? 'Bearer ***' : 'none',
    'x-device-os': req.headers['x-device-os'],
    'x-device-health-score': req.headers['x-device-health-score']
  });
  next();
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticación de usuario con MFA
 *     description: |
 *       Autentica un usuario con email, password y Multi-Factor Authentication (MFA).
 *       Si las credenciales son válidas y el MFA es correcto, retorna un token JWT.
 *       El token expira en 5 minutos y debe ser usado en el header Authorization de peticiones subsiguientes.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             usuario_regular:
 *               summary: Usuario regular con MFA
 *               value:
 *                 email: user@example.com
 *                 password: password
 *                 mfa: true
 *             administrador:
 *               summary: Administrador con MFA
 *               value:
 *                 email: admin@example.com
 *                 password: admin123
 *                 mfa: true
 *             sin_mfa:
 *               summary: Usuario sin completar MFA
 *               value:
 *                 email: user@example.com
 *                 password: password
 *                 mfa: false
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSuccessResponse'
 *       401:
 *         description: Credenciales inválidas o MFA requerido
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DenyResponse'
 *                 - $ref: '#/components/schemas/StepUpResponse'
 *             examples:
 *               credenciales_invalidas:
 *                 summary: Credenciales incorrectas
 *                 value:
 *                   decision: deny
 *                   reason: Invalid email or password
 *                   message: Authentication failed
 *               mfa_requerido:
 *                 summary: MFA no proporcionado
 *                 value:
 *                   decision: step-up
 *                   reason: Multi-factor authentication required
 *                   message: Please complete MFA to continue
 *                   mfaRequired: true
 */
app.post('/auth/login', (req, res) => {
  const { email, password, mfa } = req.body;

  console.log(`[Login] Attempt for: ${email}`);

  // Validar credenciales
  const user = validateCredentials(email, password);
  if (!user) {
    console.log('[Login] ✗ Invalid credentials');
    return res.status(401).json({
      decision: 'deny',
      reason: 'Invalid email or password',
      message: 'Authentication failed'
    });
  }

  console.log(`[Login] ✓ Credentials valid for ${user.email} (${user.role})`);

  // Validar MFA
  const mfaValid = validateMFA(user, mfa);
  if (!mfaValid) {
    console.log('[Login] ✗ MFA required but not provided');
    return res.status(401).json({
      decision: 'step-up',
      reason: 'Multi-factor authentication required',
      message: 'Please complete MFA to continue',
      mfaRequired: true
    });
  }

  console.log('[Login] ✓ MFA verified');

  // Generar token JWT
  const token = generateToken(user);
  console.log(`[Login] ✓ Token generated for ${user.email}`);

  res.json({
    decision: 'allow',
    message: 'Authentication successful',
    token,
    user: {
      email: user.email,
      role: user.role
    },
    expiresIn: '5m'
  });
});

/**
 * @swagger
 * /auth/validate:
 *   post:
 *     summary: Validar un token JWT existente
 *     description: Verifica si un token JWT es válido y no ha expirado, retornando información del usuario si es válido.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT a validar
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     mfaVerified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Token no proporcionado
 *       401:
 *         description: Token inválido o expirado
 */
app.post('/auth/validate', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      valid: false,
      reason: 'No token provided'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      valid: false,
      reason: 'Invalid or expired token'
    });
  }

  res.json({
    valid: true,
    user: {
      email: decoded.email,
      role: decoded.role,
      mfaVerified: decoded.mfaVerified
    }
  });
});

/**
 * @swagger
 * /auth/policies:
 *   get:
 *     summary: Obtener políticas de seguridad activas
 *     description: |
 *       Retorna las políticas de seguridad que el Trust Engine usa para evaluar el acceso.
 *       Incluye sistemas operativos permitidos, health score mínimo, requisitos de MFA, etc.
 *     tags: [Security]
 *     responses:
 *       200:
 *         description: Políticas de seguridad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SecurityPolicies'
 */
app.get('/auth/policies', (req, res) => {
  res.json({
    policies: getPolicies(),
    description: 'Current security policies for Zero Trust evaluation'
  });
});

// ==========================================
// RUTAS DE RECURSOS
// ==========================================

app.use('/resource', resourceRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información general de la API
 *     description: Retorna información sobre la API, endpoints disponibles y headers requeridos.
 *     tags: [Security]
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 version:
 *                   type: string
 *                 description:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                   example: http://localhost:4000/api-docs
 *                 endpoints:
 *                   type: object
 *                 requiredHeaders:
 *                   type: object
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Zero Trust Demo API',
    version: '1.0.0',
    description: 'Demostración práctica del modelo Zero Trust',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      authentication: [
        'POST /auth/login - Authenticate with credentials and MFA',
        'POST /auth/validate - Validate existing token',
        'GET /auth/policies - Get current security policies'
      ],
      resources: [
        'GET /resource/public - Public resource (no auth)',
        'GET /resource/secure - Secure resource (auth + trust evaluation)',
        'GET /resource/admin - Admin resource (requires admin role)',
        'GET /resource/sensitive - Highly sensitive resource (high security requirements)'
      ]
    },
    requiredHeaders: {
      'Authorization': 'Bearer <token>',
      'x-device-os': 'Operating system (linux, mac, windows, ios, android)',
      'x-device-health-score': 'Device health score (0-100)'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    message: 'The requested resource does not exist'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     Zero Trust Demo Backend Started        ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log('\n📚 Available endpoints:');
  console.log('   POST   /auth/login');
  console.log('   POST   /auth/validate');
  console.log('   GET    /auth/policies');
  console.log('   GET    /resource/public');
  console.log('   GET    /resource/secure');
  console.log('   GET    /resource/admin');
  console.log('   GET    /resource/sensitive');
  console.log('\n👥 Test users:');
  console.log('   user@example.com / password (role: user)');
  console.log('   admin@example.com / admin123 (role: admin)');
  console.log('\n⚡ Ready to accept requests!\n');
});
