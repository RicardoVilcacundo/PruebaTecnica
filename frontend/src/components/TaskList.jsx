import React from 'react';
import { Link } from 'react-router-dom';
import './TaskList.css'; // Importar el archivo CSS

const TaskList = ({ tasks, onEdit, onDelete, onStatusChange, showUser = false }) => {
  const statusColors = {
    pendiente: 'status-pending',
    'en progreso': 'status-progress',
    completada: 'status-completed',
  };

  const statusIcons = {
    pendiente: '⏳',
    'en progreso': '🚧',
    completada: '✅',
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await onStatusChange(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).setHours(0, 0, 0, 0) !== new Date().setHours(0, 0, 0, 0);
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="empty-title">No hay tareas</h3>
        <p className="empty-description">Comienza creando tu primera tarea</p>
      </div>
    );
  }

  return (
    <div className="tasks-grid">
      {tasks.map((task) => (
        <div key={task.id} className="task-card">
          {showUser && task.user && (
            <div className="task-user">
              <div className="user-avatar">
                <span className="user-initial">
                  {task.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="user-name">{task.user.username}</span>
            </div>
          )}
          
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            <span className={`task-status ${statusColors[task.status]}`}>
              <span className="status-icon">{statusIcons[task.status]}</span>
              <span className="status-text">{task.status}</span>
            </span>
          </div>

          <p className="task-description">
            {task.description || 'Sin descripción'}
          </p>

          <div className="task-info">
            {task.dueDate && (
              <div className={`info-item ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                <span className="info-icon">📅</span>
                <span className="info-text">
                  Vence: {formatDate(task.dueDate)}
                  {isOverdue(task.dueDate) && (
                    <span className="overdue-badge">Atrasada</span>
                  )}
                </span>
              </div>
            )}
            
            {task.comments && task.comments.length > 0 && (
              <div className="info-item">
                <span className="info-icon">💬</span>
                <span className="info-text">
                  {task.comments.length} comentario{task.comments.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {task.attachment && (
              <div className="info-item attachment">
                <span className="info-icon">📎</span>
                <span className="info-text">Archivo adjunto</span>
              </div>
            )}
          </div>

          <div className="task-actions">
            <div className="status-buttons">
              <button
                onClick={() => handleStatusChange(task.id, 'pendiente')}
                disabled={task.status === 'pendiente'}
                className={`status-btn ${task.status === 'pendiente' ? 'disabled' : ''}`}
              >
                <span className="btn-icon">⏳</span>
                <span className="btn-text">Pendiente</span>
              </button>
              <button
                onClick={() => handleStatusChange(task.id, 'en progreso')}
                disabled={task.status === 'en progreso'}
                className={`status-btn ${task.status === 'en progreso' ? 'disabled' : ''}`}
              >
                <span className="btn-icon">🚧</span>
                <span className="btn-text">En progreso</span>
              </button>
              <button
                onClick={() => handleStatusChange(task.id, 'completada')}
                disabled={task.status === 'completada'}
                className={`status-btn ${task.status === 'completada' ? 'disabled' : ''}`}
              >
                <span className="btn-icon">✅</span>
                <span className="btn-text">Completada</span>
              </button>
            </div>
            
            <div className="action-buttons">
              <Link
                to={`/tasks/${task.id}`}
                className="action-btn view-btn"
              >
                Ver
              </Link>
              <button
                onClick={() => onEdit(task)}
                className="action-btn edit-btn"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="action-btn delete-btn"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;