import React, { useState } from 'react';
import HeaderBand from './HeaderBand';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="login-container" aria-label="Formulario de inicio de sesión">
      <HeaderBand />
      <form onSubmit={handleSubmit} className="card form-container">
        <h2>Iniciar Sesión</h2>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <div className="input-icon">
            <i className="fas fa-envelope"></i>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="password">Contraseña</label>
          <div className="input-icon">
            <i className="fas fa-lock"></i>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="button button-primary">Ingresar</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
