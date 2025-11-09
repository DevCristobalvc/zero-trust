/**
 * Módulo de Autenticación
 * Simula la autenticación de usuarios con MFA y genera JWT
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Secret para firmar JWT (en producción esto estaría en variables de entorno)
const JWT_SECRET = 'zero-trust-demo-secret-key';
const JWT_EXPIRATION = '5m'; // Token expira en 5 minutos

/**
 * Carga los usuarios desde el archivo JSON
 */
function loadUsers() {
  const usersPath = join(__dirname, 'data', 'users.json');
  const usersData = fs.readFileSync(usersPath, 'utf-8');
  return JSON.parse(usersData);
}

/**
 * Valida las credenciales del usuario
 * @param {string} email 
 * @param {string} password 
 * @returns {object|null} Usuario si es válido, null si no
 */
export function validateCredentials(email, password) {
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
}

/**
 * Simula la validación de MFA
 * En un sistema real, esto verificaría un código TOTP o SMS
 * @param {object} user 
 * @param {boolean} mfaProvided 
 * @returns {boolean}
 */
export function validateMFA(user, mfaProvided) {
  // Si el usuario tiene MFA habilitado, verificamos que se proporcionó
  if (user.mfaEnabled && !mfaProvided) {
    return false;
  }
  // En esta demo, asumimos que si se proporciona MFA, es válido
  return true;
}

/**
 * Genera un JWT para el usuario autenticado
 * @param {object} user 
 * @returns {string} JWT token
 */
export function generateToken(user) {
  const payload = {
    email: user.email,
    role: user.role,
    mfaVerified: true,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verifica y decodifica un JWT
 * @param {string} token 
 * @returns {object|null} Payload del token si es válido, null si no
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Middleware para verificar el token JWT en las peticiones
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      decision: 'deny', 
      reason: 'No authentication token provided' 
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      decision: 'deny', 
      reason: 'Invalid or expired token' 
    });
  }

  req.user = decoded;
  next();
}
