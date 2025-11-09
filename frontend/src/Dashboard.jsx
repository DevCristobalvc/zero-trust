import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  logout, 
  getSecureResource, 
  getSensitiveResource,
  getCurrentTelemetry,
  setDeviceHealthScore
} from './api';

export default function Dashboard({ onLogout }) {
  const [user] = useState(getCurrentUser());
  const [telemetry, setTelemetry] = useState(getCurrentTelemetry());
  const [resource, setResource] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Actualizar telemetría cada vez que cambie
    setTelemetry(getCurrentTelemetry());
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const fetchResource = async (resourceFn, resourceName) => {
    setLoading(true);
    setError(null);
    setResource(null);

    try {
      const data = await resourceFn();
      setResource({ name: resourceName, data });
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

  const changeHealthScore = (score) => {
    setDeviceHealthScore(score);
    setTelemetry(getCurrentTelemetry());
    setResource(null);
    setError(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛡️ Zero Trust Dashboard</h1>
          <p style={styles.subtitle}>Usuario: {user.email} | Rol: {user.role}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Cerrar Sesión
        </button>
      </div>

      <div style={styles.grid}>
        {/* Telemetría del Dispositivo */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Telemetría del Dispositivo</h2>
          <div style={styles.telemetryInfo}>
            <div style={styles.telemetryItem}>
              <span style={styles.label}>Sistema Operativo:</span>
              <span style={styles.value}>{telemetry.os}</span>
            </div>
            <div style={styles.telemetryItem}>
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

          <div style={styles.healthControls}>
            <p style={styles.controlLabel}>Simular Health Score:</p>
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => changeHealthScore(90)} 
                style={{...styles.smallButton, backgroundColor: '#22c55e'}}
              >
                Alto (90)
              </button>
              <button 
                onClick={() => changeHealthScore(60)} 
                style={{...styles.smallButton, backgroundColor: '#f59e0b'}}
              >
                Medio (60)
              </button>
              <button 
                onClick={() => changeHealthScore(30)} 
                style={{...styles.smallButton, backgroundColor: '#ef4444'}}
              >
                Bajo (30)
              </button>
            </div>
            <p style={styles.hint}>
              💡 Cambiar el health score para ver diferentes respuestas del Trust Engine
            </p>
          </div>
        </div>

        {/* Acceso a Recursos */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔐 Acceder a Recursos Protegidos</h2>
          <p style={styles.cardDescription}>
            Cada petición es evaluada por el Trust Engine en tiempo real
          </p>

          <div style={styles.resourceButtons}>
            <button 
              onClick={() => fetchResource(getSecureResource, 'Secure Resource')}
              style={styles.resourceButton}
              disabled={loading}
            >
              📦 Recurso Seguro
            </button>
            <button 
              onClick={() => fetchResource(getSensitiveResource, 'Sensitive Resource')}
              style={styles.resourceButton}
              disabled={loading}
            >
              🔒 Recurso Sensible
            </button>
          </div>

          {loading && (
            <div style={styles.loading}>⏳ Evaluando acceso...</div>
          )}

          {error && (
            <div style={styles.errorBox}>
              {error}
              <p style={styles.errorDetail}>
                El Trust Engine evaluó tu contexto y denegó el acceso
              </p>
            </div>
          )}

          {resource && (
            <div style={styles.successBox}>
              <h3 style={styles.successTitle}>✅ Acceso Permitido</h3>
              <p style={styles.successSubtitle}>{resource.name}</p>
              <pre style={styles.resourceData}>
                {JSON.stringify(resource.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>ℹ️ ¿Cómo funciona Zero Trust?</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}>🔍</div>
            <div>
              <h4 style={styles.infoItemTitle}>Verificación Continua</h4>
              <p style={styles.infoItemText}>
                Cada petición es evaluada independientemente, sin importar autenticaciones previas
              </p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}>📱</div>
            <div>
              <h4 style={styles.infoItemTitle}>Telemetría</h4>
              <p style={styles.infoItemText}>
                Se evalúa el estado del dispositivo, OS y contexto en tiempo real
              </p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoIcon}>⚖️</div>
            <div>
              <h4 style={styles.infoItemTitle}>Decisiones Centralizadas</h4>
              <p style={styles.infoItemText}>
                El Trust Engine aplica políticas consistentes en todos los accesos
              </p>
            </div>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
  telemetryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  telemetryItem: {
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
  healthControls: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  controlLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  smallButton: {
    flex: 1,
    padding: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  resourceButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  resourceButton: {
    padding: '14px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loading: {
    padding: '16px',
    textAlign: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: '8px',
    color: '#4f46e5',
    fontWeight: '600',
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
    padding: '16px',
    backgroundColor: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
  },
  successTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#065f46',
    margin: '0 0 5px 0',
  },
  successSubtitle: {
    fontSize: '14px',
    color: '#047857',
    margin: '0 0 12px 0',
  },
  resourceData: {
    fontSize: '12px',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: '300px',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    gap: '15px',
  },
  infoIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  infoItemTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  infoItemText: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    margin: 0,
  }
};
