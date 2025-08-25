import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, isAdmin, logout } from '../utils/auth';
import NotificationBell from './NotificationBell';
import './Navbar.css'; // Importar el archivo CSS

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-left">
            <Link to="/tasks" className="navbar-brand">
              <span className="brand-icon">📋</span>
              <span className="brand-text">TaskManager</span>
            </Link>
            
            {isAuthenticated() && (
              <div className="navbar-links">
                <Link
                  to="/tasks"
                  className="nav-link"
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-text">Mis Tareas</span>
                </Link>
                
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="nav-link"
                  >
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-text">Admin</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {isAuthenticated() && (
            <div className="navbar-right">
              <NotificationBell />
              
              <div className="user-info">
                <div className="user-avatar">
                  <span className="user-initial">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="user-greeting">
                  Hola, {user?.username}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                <span className="logout-icon">🚪</span>
                <span className="logout-text">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;