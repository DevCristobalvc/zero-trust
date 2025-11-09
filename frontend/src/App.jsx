import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Admin from './Admin';
import { isAuthenticated, getCurrentUser } from './api';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si hay sesión activa al cargar
    if (isAuthenticated()) {
      setAuthenticated(true);
      setUser(getCurrentUser());
    }
  }, []);

  const handleLoginSuccess = (result) => {
    setAuthenticated(true);
    setUser(result.user);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUser(null);
  };

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Mostrar panel correspondiente según el rol
  if (user?.role === 'admin') {
    return <Admin onLogout={handleLogout} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
