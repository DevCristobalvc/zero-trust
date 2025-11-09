import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  logout, 
  getAdminResource,
  getPolicies,
  getCurrentTelemetry 
} from './api';

export default function Admin({ onLogout }) {
  const [user] = useState(getCurrentUser());
  const [adminData, setAdminData] = useState(null);
  const [policies, setPolicies] = useState(null);
  const [telemetry] = useState(getCurrentTelemetry());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const loadPolicies = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data.policies);
    } catch (err) {
      console.error('Error loading policies:', err);
    }
  };

  const loadAdminResource = async () => {
    setLoading(true);
    setError(null);
    setAdminData(null);

    try {
      const data = await getAdminResource();
      setAdminData(data);
    } catch (err) {
      if (err.decision === 'deny') {
        setError(`❌ Access Denied: ${err.reason}`);
      } else if (err.decision === 'step-up') {
        setError(`🔐 Step-up Required: ${err.reason}`);
      } else {
        setError(`❌ Error: ${err.reason || err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👨‍💼 Panel de Administración</h1>
          <p style={styles.subtitle}>Usuario: {user.email} | Rol: {user.role}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Cerrar Sesión
        </button>
      </div>

      <div style={styles.grid}>
        {/* Información del Administrador */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 Información del Admin</h2>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{user.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Rol:</span>
              <span style={{...styles.value, color: '#ef4444'}}>{user.role}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Dispositivo:</span>
              <span style={styles.value}>{telemetry.os}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Health Score:</span>
              <span style={{
                ...styles.value,
                color: telemetry.healthScore >= 70 ? '#22c55e' : 
                       telemetry.healthScore >= 50 ? '#f59e0b' : '#ef4444'
              }}>
                {telemetry.healthScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Políticas de Seguridad */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🛡️ Políticas de Seguridad Activas</h2>
          {policies ? (
            <div style={styles.policiesGrid}>
              <div style={styles.policyItem}>
                <div style={styles.policyLabel}>Sistemas Operativos Permitidos</div>
                <div style={styles.policyValue}>
                  {policies.allowedOS.join(', ')}
                </div>
              </div>
              <div style={styles.policyItem}>
                <div style={styles.policyLabel}>Health Score Mínimo</div>
                <div style={styles.policyValue}>
                  {policies.minHealthScore}/100
                </div>
              </div>
              <div style={styles.policyItem}>
                <div style={styles.policyLabel}>MFA Requerido</div>
                <div style={styles.policyValue}>
                  {policies.requireMFA ? '✅ Sí' : '❌ No'}
                </div>
              </div>
              <div style={styles.policyItem}>
                <div style={styles.policyLabel}>Roles de Alta Seguridad</div>
                <div style={styles.policyValue}>
                  {policies.highSecurityRoles.join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <p>Cargando políticas...</p>
          )}
        </div>
      </div>

      {/* Acceso a Recursos Admin */}
      <div style={styles.fullWidthCard}>
        <h2 style={styles.cardTitle}>🔐 Recursos Administrativos</h2>
        <p style={styles.cardDescription}>
          Solo usuarios con rol admin pueden acceder a estos recursos después de pasar por el Trust Engine
        </p>

        <button 
          onClick={loadAdminResource}
          style={styles.primaryButton}
          disabled={loading}
        >
          {loading ? '⏳ Evaluando acceso...' : '🚀 Acceder a Recursos Admin'}
        </button>

        {error && (
          <div style={styles.errorBox}>
            {error}
            <p style={styles.errorDetail}>
              Verifica que tengas el rol correcto y que tu dispositivo cumpla con las políticas de seguridad
            </p>
          </div>
        )}

        {adminData && (
          <div style={styles.successBox}>
            <h3 style={styles.successTitle}>✅ Acceso Administrativo Permitido</h3>
            <p style={styles.successSubtitle}>{adminData.message}</p>
            
            {adminData.data.adminFeatures && (
              <div style={styles.featuresGrid}>
                {adminData.data.adminFeatures.map((feature, index) => (
                  <div key={index} style={styles.featureCard}>
                    🔧 {feature}
                  </div>
                ))}
              </div>
            )}

            <details style={styles.details}>
              <summary style={styles.summary}>Ver respuesta completa del servidor</summary>
              <pre style={styles.jsonData}>
                {JSON.stringify(adminData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Información sobre Zero Trust para Admins */}
      <div style={styles.fullWidthCard}>
        <h3 style={styles.cardTitle}>ℹ️ Zero Trust para Administradores</h3>
        <div style={styles.adminInfoGrid}>
          <div style={styles.adminInfoCard}>
            <div style={styles.adminInfoIcon}>🎯</div>
            <h4 style={styles.adminInfoTitle}>Acceso de Menor Privilegio</h4>
            <p style={styles.adminInfoText}>
              Incluso los administradores son evaluados en cada acceso. No hay confianza implícita basada en el rol.
            </p>
          </div>
          <div style={styles.adminInfoCard}>
            <div style={styles.adminInfoIcon}>🔄</div>
            <h4 style={styles.adminInfoTitle}>Evaluación Continua</h4>
            <p style={styles.adminInfoText}>
              El Trust Engine verifica autenticación, autorización, telemetría del dispositivo y contexto en tiempo real.
            </p>
          </div>
          <div style={styles.adminInfoCard}>
            <div style={styles.adminInfoIcon}>📋</div>
            <h4 style={styles.adminInfoTitle}>Políticas Centralizadas</h4>
            <p style={styles.adminInfoText}>
              Las políticas de seguridad se aplican de manera consistente, sin excepciones basadas solo en el rol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  logoutButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  fullWidthCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  policiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  policyItem: {
    padding: '15px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
  },
  policyLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '8px',
  },
  policyValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  errorBox: {
    padding: '16px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    color: '#c00',
  },
  errorDetail: {
    fontSize: '12px',
    marginTop: '8px',
    opacity: 0.8,
  },
  successBox: {
    padding: '20px',
    backgroundColor: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#065f46',
    margin: '0 0 5px 0',
  },
  successSubtitle: {
    fontSize: '14px',
    color: '#047857',
    marginBottom: '16px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  featureCard: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#065f46',
  },
  details: {
    marginTop: '16px',
  },
  summary: {
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#047857',
    marginBottom: '8px',
  },
  jsonData: {
    fontSize: '12px',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: '300px',
  },
  adminInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  adminInfoCard: {
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    textAlign: 'center',
  },
  adminInfoIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  adminInfoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  adminInfoText: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
  }
};
