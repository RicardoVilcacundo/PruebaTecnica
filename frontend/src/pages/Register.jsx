import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Register = ({ onAuthChange }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) errors.push('Mínimo 6 caracteres');
    if (!/(?=.*[a-z])/.test(password)) errors.push('Al menos una minúscula');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Al menos una mayúscula');
    if (!/(?=.*\d)/.test(password)) errors.push('Al menos un número');
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar contraseña en tiempo real
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar fortaleza de la contraseña
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Notificar al componente App que la autenticación cambió
      if (onAuthChange) {
        onAuthChange();
      }
      
      navigate('/tasks');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isPasswordDirty = formData.password.length > 0;

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Únete a nuestra comunidad de productividad</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="form-input"
              placeholder="Tu nombre de usuario"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="form-input"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="form-input"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
            />
            {isPasswordDirty && passwordErrors.length > 0 && (
              <div className="password-validation">
                <p className="text-xs text-gray-600 mt-1">La contraseña debe tener:</p>
                <ul className="text-xs text-red-500 ml-4 list-disc">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {isPasswordDirty && passwordErrors.length === 0 && (
              <p className="text-xs text-green-600 mt-1">✓ Contraseña segura</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className={`form-input ${formData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`}
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
            />
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            )}
            {formData.confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-600 mt-1">✓ Las contraseñas coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordErrors.length > 0 || !passwordsMatch}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="btn-loading">
                <svg className="loading-spinner -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando cuenta...
              </span>
            ) : 'Crear cuenta'}
          </button>

          <div className="auth-link">
            <p className="auth-link-text">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="auth-link-anchor">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;