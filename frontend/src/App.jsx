import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Efecto para verificar autenticación al cargar y cuando cambia
  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated());
    setAuthChecked(true);
  }, []);

  // Función para actualizar el estado de autenticación (que pasaremos al Login/Register)
  const handleAuthChange = () => {
    setIsUserAuthenticated(isAuthenticated());
  };

  // Evitar renderizar hasta que verifiquemos la autenticación
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Navbar solo visible cuando está autenticado */}
        {isUserAuthenticated && <Navbar />}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              !isUserAuthenticated ? 
              <Login onAuthChange={handleAuthChange} /> : 
              <Navigate to="/tasks" replace />
            } 
          />
          <Route 
            path="/register" 
            element={
              !isUserAuthenticated ? 
              <Register onAuthChange={handleAuthChange} /> : 
              <Navigate to="/tasks" replace />
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks/:id" 
            element={
              <PrivateRoute>
                <TaskDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute adminOnly={true}>
                <AdminPanel />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/tasks" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;