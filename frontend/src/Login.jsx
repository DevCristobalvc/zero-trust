import React, { useState } from 'react';
import { login } from './api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfa, setMfa] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password, mfa);
      
      if (result.decision === 'allow') {
        onLoginSuccess(result);
      } else if (result.decision === 'step-up') {
        setError(`🔐 ${result.message}: ${result.reason}`);
      } else {
        setError(`❌ ${result.message}: ${result.reason}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err.reason || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fillUserCredentials = () => {
    setEmail('user@example.com');
    setPassword('password');
  };

  const fillAdminCredentials = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔒 Zero Trust Authentication</h1>
        <p style={styles.subtitle}>
          Demostración del modelo Zero Trust - Nunca confíes, siempre verifica
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="usuario@example.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              placeholder="••••••••"
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={mfa}
                onChange={(e) => setMfa(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Completar MFA (Multi-Factor Authentication)</span>
            </label>
            <p style={styles.hint}>
              💡 Desmarcar para ver respuesta de step-up
            </p>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? '⏳ Autenticando...' : '🚀 Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.quickFill}>
          <p style={styles.quickFillTitle}>Credenciales de prueba:</p>
          <div style={styles.quickFillButtons}>
            <button 
              type="button" 
              onClick={fillUserCredentials}
              style={styles.quickFillButton}
            >
              👤 Usuario
            </button>
            <button 
              type="button" 
              onClick={fillAdminCredentials}
              style={styles.quickFillButton}
            >
              👨‍💼 Admin
            </button>
          </div>
        </div>

        <div style={styles.info}>
          <h3 style={styles.infoTitle}>ℹ️ Cómo funciona</h3>
          <ul style={styles.infoList}>
            <li>El sistema valida credenciales y MFA</li>
            <li>Evalúa la telemetría del dispositivo (OS, health score)</li>
            <li>Toma decisiones en tiempo real: allow, deny o step-up</li>
            <li>Cada acceso es evaluado, nada se confía por defecto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  hint: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    color: '#c00',
    fontSize: '14px',
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  quickFill: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  quickFillTitle: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '10px',
    fontWeight: '600',
  },
  quickFillButtons: {
    display: 'flex',
    gap: '10px',
  },
  quickFillButton: {
    flex: 1,
    padding: '8px',
    fontSize: '13px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  info: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  infoList: {
    fontSize: '13px',
    color: '#555',
    lineHeight: '1.8',
    paddingLeft: '20px',
    margin: 0,
  }
};
