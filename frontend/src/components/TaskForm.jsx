import React, { useState } from 'react';
import { taskService } from '../services/taskService';
import './TaskForm.css'; // Importar el archivo CSS

const TaskForm = ({ onSubmit, onCancel, task, isModal = true }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pendiente',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  });
  
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let taskData = { ...formData };
      
      // Si hay un archivo para subir y es una tarea nueva
      if (attachment && !task?.id) {
        setUploading(true);
        // Primero creamos la tarea
        const newTask = await onSubmit(taskData);
        // Luego subimos el archivo
        await taskService.uploadAttachment(newTask.id, attachment);
        setUploading(false);
      } else {
        await onSubmit(taskData);
        
        // Si estamos editando y hay un archivo nuevo, subirlo
        if (attachment && task?.id) {
          setUploading(true);
          await taskService.uploadAttachment(task.id, attachment);
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  // Contenido del formulario
  const formContent = (
    <div className="task-form-card">
      <h2 className="task-form-title">
        {task ? 'Editar Tarea' : 'Nueva Tarea'}
      </h2>
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label className="form-label">
            Título *
          </label>
          <input
            type="text"
            name="title"
            required
            className="form-input"
            placeholder="Título de la tarea"
            value={formData.title}
            onChange={handleChange}
            disabled={loading || uploading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Descripción
          </label>
          <textarea
            name="description"
            rows={4}
            className="form-textarea"
            placeholder="Descripción de la tarea"
            value={formData.description}
            onChange={handleChange}
            disabled={loading || uploading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Estado
          </label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            disabled={loading || uploading}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En Progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            name="dueDate"
            className="form-input"
            value={formData.dueDate}
            onChange={handleChange}
            disabled={loading || uploading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Archivo adjunto
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="form-file"
            disabled={loading || uploading}
          />
          {attachment && (
            <p className="file-status success">
              ✓ Archivo seleccionado: {attachment.name}
            </p>
          )}
          {task?.attachment && !attachment && (
            <p className="file-status info">
              📎 Archivo actual: {task.attachment.filename}
            </p>
          )}
        </div>

        <div className="form-buttons">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading || uploading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn btn-primary"
          >
            {uploading ? 'Subiendo archivo...' : 
             loading ? 'Guardando...' : 
             (task ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );

  // Si es modal, envolver en overlay
  if (isModal) {
    return (
      <div className="task-form-overlay">
        <div className="task-form-modal">
          {formContent}
        </div>
      </div>
    );
  }

  // Si no es modal, retornar solo el contenido
  return (
    <div className="task-form-container">
      {formContent}
    </div>
  );
};

export default TaskForm;