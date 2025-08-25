import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import TaskList from '../components/TaskList';
import './AdminPanel.css';

const AdminPanel = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0
  });
  const [filters, setFilters] = useState({
    userId: '',
    status: '',
    dateFilter: 'all', // 'all', 'today', 'week', 'overdue', 'specific'
    specificDate: ''
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let tasksData;
      const filterParams = buildFilterParams();
      
      if (isAdmin) {
        // Admin puede ver todas las tareas o filtrar por usuario
        tasksData = await taskService.getAllTasks(filterParams);
        
        // Cargar usuarios solo si es admin y aún no los tiene
        if (users.length === 0) {
          const usersData = await taskService.getUsers();
          setUsers(usersData);
        }
      } else {
        // Usuario normal solo ve sus propias tareas
        tasksData = await taskService.getUserTasks(currentUser.id, filterParams);
      }
      
      setTasks(tasksData);
      calculateStats(tasksData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const buildFilterParams = () => {
    const params = {};
    
    // Filtro por usuario (solo para admin)
    if (isAdmin && filters.userId) {
      params.userId = filters.userId;
    }
    
    // Filtro por estado
    if (filters.status) {
      params.status = filters.status;
    }
    
    // Filtros de fecha
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filters.dateFilter) {
      case 'today':
        params.dueDate = todayStr;
        break;
        
      case 'week':
        { const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        params.dueDateStart = todayStr;
        params.dueDateEnd = weekFromNow.toISOString().split('T')[0];
        break; }
        
      case 'overdue':
        { const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        params.dueDateBefore = yesterday.toISOString().split('T')[0];
        params.statusNot = 'completada'; // No incluir completadas
        break; }
        
      case 'specific':
        if (filters.specificDate) {
          params.dueDate = filters.specificDate;
        }
        break;
        
      default:
        // 'all' - no agregar filtros de fecha
        break;
    }
    
    return params;
  };

  const calculateStats = (tasksData) => {
    const totalTasks = tasksData.length;
    const pendingTasks = tasksData.filter(task => task.status === 'pendiente').length;
    const completedTasks = tasksData.filter(task => task.status === 'completada').length;
    const inProgressTasks = tasksData.filter(task => task.status === 'en progreso').length;
    
    setStats({
      totalTasks,
      pendingTasks,
      completedTasks,
      inProgressTasks
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      dateFilter: value,
      specificDate: value === 'specific' ? prev.specificDate : ''
    }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      status: '',
      dateFilter: 'all',
      specificDate: ''
    });
  };

  const getFilteredTasksMessage = () => {
    const activeFilters = [];
    
    if (filters.userId && isAdmin) {
      const user = users.find(u => u.id.toString() === filters.userId);
      activeFilters.push(`Usuario: ${user?.username || 'Desconocido'}`);
    }
    
    if (filters.status) {
      const statusNames = {
        'pendiente': 'Pendiente',
        'en progreso': 'En Progreso',
        'completada': 'Completada'
      };
      activeFilters.push(`Estado: ${statusNames[filters.status]}`);
    }
    
    if (filters.dateFilter !== 'all') {
      const dateFilterNames = {
        'today': 'Vence hoy',
        'week': 'Próximos 7 días',
        'overdue': 'Vencidas',
        'specific': `Fecha: ${filters.specificDate}`
      };
      activeFilters.push(dateFilterNames[filters.dateFilter]);
    }
    
    return activeFilters.length > 0 ? activeFilters.join(' • ') : null;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando {isAdmin ? 'panel de administración' : 'tus tareas'}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-content">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">
            {isAdmin ? 'Panel de Administración' : 'Mis Tareas'}
          </h1>
          <button
            onClick={loadData}
            className="btn-primary"
          >
            Actualizar
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-error">
            <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Total de Tareas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingTasks}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.inProgressTasks}</div>
            <div className="stat-label">En Progreso</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Completadas</div>
          </div>
          {isAdmin && (
            <div className="stat-card">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Usuarios</div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <h3 className="admin-filters-title">Filtrar Tareas</h3>
          
          <div className="admin-filters-grid">
            {/* User Filter - Solo para Admin */}
            {isAdmin && (
              <div className="admin-filter-group">
                <label className="admin-filter-label">Usuario:</label>
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  className="admin-filter-select"
                >
                  <option value="">Todos los usuarios</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} {user.role === 'admin' ? '(Admin)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="admin-filter-group">
              <label className="admin-filter-label">Estado:</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="admin-filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="admin-filter-group">
              <label className="admin-filter-label">Filtro de fecha:</label>
              <select
                name="dateFilter"
                value={filters.dateFilter}
                onChange={handleDateFilterChange}
                className="admin-filter-select"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Vence hoy</option>
                <option value="week">Próximos 7 días</option>
                <option value="overdue">Vencidas</option>
                <option value="specific">Fecha específica</option>
              </select>
            </div>

            {/* Specific Date Input */}
            {filters.dateFilter === 'specific' && (
              <div className="admin-filter-group">
                <label className="admin-filter-label">Fecha específica:</label>
                <input
                  type="date"
                  name="specificDate"
                  value={filters.specificDate}
                  onChange={handleFilterChange}
                  className="admin-filter-input"
                />
              </div>
            )}

            {/* Clear Filters Button */}
            <div className="admin-filter-group">
              <label className="admin-filter-label" style={{ opacity: 0 }}>Limpiar</label>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {getFilteredTasksMessage() && (
            <div className="active-filters">
              <span className="active-filters-label">Filtros activos:</span>
              <span className="active-filters-text">{getFilteredTasksMessage()}</span>
            </div>
          )}
        </div>

        {/* Tasks Display */}
        {tasks.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📋</div>
            <h3 className="admin-empty-title">No hay tareas</h3>
            <p className="admin-empty-description">
              {getFilteredTasksMessage() 
                ? "No hay tareas que coincidan con los filtros aplicados" 
                : isAdmin 
                  ? "No hay tareas en el sistema"
                  : "No tienes tareas asignadas"
              }
            </p>
          </div>
        ) : (
          <div className="tasks-section">
            {/* User Info Display - Solo cuando admin filtra por usuario específico */}
            {isAdmin && filters.userId && (
              <div className="selected-user-info">
                <h3 className="selected-user-title">
                  📋 Tareas de: {users.find(u => u.id.toString() === filters.userId)?.username}
                  <span className="task-count">({tasks.length} tarea{tasks.length !== 1 ? 's' : ''})</span>
                </h3>
              </div>
            )}
            
            <TaskList
              tasks={tasks}
              showUser={isAdmin && !filters.userId} // Mostrar usuario solo si es admin y no hay filtro de usuario específico
              onTaskUpdated={loadData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;