import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { Link } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTask(id);
      setTask(data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error loading task:', error);
      setError(error.response?.data?.message || 'Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(id);
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.response?.data?.message || 'Error al eliminar la tarea');
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = async () => {
    try {
      await taskService.downloadAttachment(id);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setError(error.response?.data?.message || 'Error al descargar el archivo');
    }
  };

  const statusConfig = {
    pendiente: {
      className: 'pendiente',
      icon: '⏳',
      label: 'Pendiente'
    },
    'en progreso': {
      className: 'en-progreso',
      icon: '🚧',
      label: 'En Progreso'
    },
    completada: {
      className: 'completada',
      icon: '✅',
      label: 'Completada'
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    
    // Set both dates to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    return due < today;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Cargando tarea...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-content">
          <div className="not-found-container">
            <h2>Tarea no encontrada</h2>
            <p style={{ marginBottom: '2rem', color: '#718096' }}>
              La tarea que buscas no existe o ha sido eliminada.
            </p>
            <Link to="/tasks">
              Volver a la lista de tareas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[task.status] || statusConfig['pendiente'];

  return (
    <div className="task-detail-container">
      <div className="task-detail-content">
        <Link to="/tasks" className="task-detail-back">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a tareas
        </Link>

        {error && (
          <div className="error-banner">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="task-detail-header">
          <div className="task-detail-title-row">
            <h1 className="task-detail-title">{task.title}</h1>
            <div className="task-detail-actions">
              <Link
                to={`/tasks/edit/${task.id}`}
                className="task-detail-action-btn task-detail-edit"
              >
                ✏️ Editar
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="task-detail-action-btn task-detail-delete"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>

          <div className={`task-detail-status ${statusInfo.className}`}>
            <span>{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </div>

          {task.dueDate && (
            <div className={`task-detail-due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                Vence el {formatDate(task.dueDate)}
                {isOverdue(task.dueDate) && (
                  <strong style={{ color: '#e53e3e', marginLeft: '0.5rem' }}>
                    (Atrasada)
                  </strong>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="task-detail-description">
          <h2>Descripción</h2>
          <div className="task-detail-description-content">
            {task.description || 'Esta tarea no tiene descripción.'}
          </div>
        </div>

        {task.attachment && (
          <div className="task-detail-attachment">
            <h2>Archivo Adjunto</h2>
            <div className="attachment-card">
              <div className="attachment-info">
                <div className="attachment-icon">
                  📄
                </div>
                <div className="attachment-details">
                  <h3>{task.attachment.originalName}</h3>
                  <p>{formatFileSize(task.attachment.size)}</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="download-btn"
              >
                📥 Descargar
              </button>
            </div>
          </div>
        )}

        <div className="comments-section">
          <CommentSection 
            taskId={id} 
            comments={task.comments || []} 
            onCommentsUpdate={loadTask}
          />
        </div>

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Confirmar eliminación</h3>
              <p className="modal-text">
                ¿Estás seguro de que quieres eliminar la tarea "<strong>{task.title}</strong>"? 
                Esta acción no se puede deshacer y se perderán todos los datos asociados.
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="modal-btn modal-btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="modal-btn modal-btn-confirm"
                >
                  Eliminar tarea
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;