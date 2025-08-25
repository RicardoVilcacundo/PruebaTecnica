import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ 
    status: '',
    dueDate: ''
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks(filters);
      setTasks(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      setShowForm(false);
      loadTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear tarea');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await taskService.updateTask(id, taskData);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar tarea');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(id);
        loadTasks();
      } catch (error) {
        setError(error.response?.data?.message || 'Error al eliminar tarea');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({ status: '', dueDate: '' });
  };

  if (loading) return (
    <div className="tasks-container">
      <div className="tasks-content">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>Cargando tareas...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tasks-container">
      <div className="tasks-content">
        <div className="tasks-header">
          <h1 className="tasks-title">Mis Tareas</h1>
          <div className="tasks-actions">
            <button
              onClick={() => setShowForm(true)}
              className="new-task-btn"
            >
              Nueva Tarea
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        <div className="filters-container">
          <h3 className="filters-title">Filtrar Tareas</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Estado:</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Fecha de vencimiento:</label>
              <input
                type="date"
                name="dueDate"
                value={filters.dueDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label opacity-0">Limpiar</label>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
            onCancel={() => setEditingTask(null)}
          />
        )}

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No hay tareas</h3>
            <p className="empty-description">
              {filters.status || filters.dueDate 
                ? "No hay tareas que coincidan con los filtros aplicados" 
                : "Comienza creando tu primera tarea"
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="new-task-btn"
            >
              Crear Primera Tarea
            </button>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleUpdateTask}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks;