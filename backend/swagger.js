/**
 * Configuración de Swagger/OpenAPI para documentación de la API Zero Trust
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zero Trust Architecture API',
      version: '1.0.0',
      description: `
API de demostración del modelo Zero Trust que implementa los siguientes principios:

- **Nunca confíes, siempre verifica**: Cada petición es evaluada independientemente
- **Autenticación continua**: JWT con MFA y verificación en cada acceso
- **Evaluación de telemetría**: Análisis del dispositivo (OS, health score)
- **Control de acceso basado en roles**: Usuario regular vs Administrador
- **Decisiones centralizadas**: Trust Engine como punto único de evaluación
- **Menor privilegio**: Solo el acceso mínimo necesario

## 🔑 Autenticación

La mayoría de los endpoints requieren un token JWT en el header \`Authorization\`:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Para obtener un token, usa el endpoint \`POST /auth/login\` con credenciales válidas.

## 📱 Telemetría del Dispositivo

Los endpoints protegidos requieren headers adicionales para evaluación de seguridad:

- \`x-device-os\`: Sistema operativo (linux, mac, windows, ios, android)
- \`x-device-health-score\`: Puntuación de salud del dispositivo (0-100)

## 🎯 Decisiones del Trust Engine

El Trust Engine puede retornar tres tipos de decisiones:

- **allow**: Acceso permitido - todas las verificaciones pasaron
- **deny**: Acceso denegado - una o más verificaciones fallaron
- **step-up**: Autenticación adicional requerida (ej: MFA)

## 👥 Usuarios de Prueba

**Usuario Regular:**
- Email: user@example.com
- Password: password
- Rol: user

**Administrador:**
- Email: admin@example.com
- Password: admin123
- Rol: admin
      `,
      contact: {
        name: 'Zero Trust Demo',
        url: 'https://github.com/DevCristobalvc/zero-trust'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y gestión de tokens'
      },
      {
        name: 'Resources',
        description: 'Recursos protegidos con diferentes niveles de acceso'
      },
      {
        name: 'Security',
        description: 'Políticas y configuración de seguridad'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /auth/login'
        }
      },
      parameters: {
        deviceOS: {
          name: 'x-device-os',
          in: 'header',
          description: 'Sistema operativo del dispositivo',
          required: true,
          schema: {
            type: 'string',
            enum: ['linux', 'mac', 'windows', 'ios', 'android'],
            example: 'linux'
          }
        },
        deviceHealthScore: {
          name: 'x-device-health-score',
          in: 'header',
          description: 'Puntuación de salud del dispositivo (0-100)',
          required: true,
          schema: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 90
          }
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password', 'mfa'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password',
              description: 'Contraseña del usuario'
            },
            mfa: {
              type: 'boolean',
              example: true,
              description: 'Indica si el usuario completó la autenticación multifactor'
            }
          }
        },
        LoginSuccessResponse: {
          type: 'object',
          properties: {
            decision: {
              type: 'string',
              example: 'allow',
              description: 'Decisión del sistema de autenticación'
            },
            message: {
              type: 'string',
              example: 'Authentication successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'Token JWT para usar en peticiones subsiguientes'
            },
            user: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  example: 'user@example.com'
                },
                role: {
                  type: 'string',
                  enum: ['user', 'admin'],
                  example: 'user'
                }
              }
            },
            expiresIn: {
              type: 'string',
              example: '5m',
              description: 'Tiempo de expiración del token'
            }
          }
        },
        StepUpResponse: {
          type: 'object',
          properties: {
            decision: {
              type: 'string',
              example: 'step-up'
            },
            reason: {
              type: 'string',
              example: 'Multi-factor authentication required'
            },
            message: {
              type: 'string',
              example: 'Please complete MFA to continue'
            },
            mfaRequired: {
              type: 'boolean',
              example: true
            }
          }
        },
        DenyResponse: {
          type: 'object',
          properties: {
            decision: {
              type: 'string',
              example: 'deny'
            },
            reason: {
              type: 'string',
              example: 'Device health score too low: 30. Minimum required: 50'
            },
            message: {
              type: 'string',
              example: 'Access denied'
            },
            detail: {
              type: 'string',
              example: 'Device telemetry check failed'
            }
          }
        },
        SecurityPolicies: {
          type: 'object',
          properties: {
            policies: {
              type: 'object',
              properties: {
                allowedOS: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['linux', 'mac', 'windows', 'ios', 'android']
                },
                minHealthScore: {
                  type: 'integer',
                  example: 50
                },
                requireMFA: {
                  type: 'boolean',
                  example: true
                },
                highSecurityRoles: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['admin']
                }
              }
            },
            description: {
              type: 'string',
              example: 'Current security policies for Zero Trust evaluation'
            }
          }
        },
        ResourceResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Access granted to secure resource'
            },
            data: {
              type: 'object',
              properties: {
                info: {
                  type: 'string'
                },
                accessedBy: {
                  type: 'string'
                },
                role: {
                  type: 'string'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                securityData: {
                  type: 'object'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error description'
            },
            message: {
              type: 'string',
              example: 'Detailed error message'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de autenticación faltante o inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DenyResponse'
              },
              example: {
                decision: 'deny',
                reason: 'Invalid or expired token',
                message: 'Authentication required'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - no cumple con políticas de seguridad',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DenyResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./index.js', './routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
