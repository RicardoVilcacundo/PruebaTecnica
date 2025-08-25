import api from './api';

// Función auxiliar para obtener el token
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Función auxiliar para construir parámetros de query
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  // Solo incluir parámetros que sabemos que el backend puede procesar
  const allowedParams = ['status', 'userId', 'page', 'limit'];
  
  Object.keys(params).forEach(key => {
    if (allowedParams.includes(key) && params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  
  return searchParams.toString();
};

// Aplicar todos los filtros en el lado del cliente de manera eficiente
const applyClientSideFilters = (tasks, filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return tasks;
  }

  console.log('Filtros aplicados:', filters);
  console.log('Tareas antes de filtrar:', tasks.length);

  const filteredTasks = tasks.filter(task => {
    // Filtro por estado
    if (filters.status && filters.status !== 'Todos los estados' && task.status !== filters.status) {
      return false;
    }
    
    // Filtros de fecha
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const taskDateString = taskDate.toLocaleDateString('en-CA'); 
      
      // Fecha exacta
      if (filters.dueDate) {
        if (taskDateString !== filters.dueDate) {
          return false;
        }
      }
      
      // Rango de fechas
      if (filters.dueDateStart && taskDateString < filters.dueDateStart) {
        return false;
      }
      
      if (filters.dueDateEnd && taskDateString > filters.dueDateEnd) {
        return false;
      }
      
      // Tareas que vencen EN O ANTES de una fecha específica
      if (filters.dueDateBefore) {
        const isOnOrBefore = taskDateString <= filters.dueDateBefore;
        if (!isOnOrBefore) {
          return false;
        }
        
        if (filters.statusNot && task.status === filters.statusNot) {
          return false;
        }
      }
      
      // Tareas vencidas (estrictamente ANTES de una fecha)
      if (filters.dueDateStrictlyBefore) {
        const isStrictlyBefore = taskDateString < filters.dueDateStrictlyBefore;
        if (!isStrictlyBefore) {
          return false;
        }
        
        if (filters.statusNot && task.status === filters.statusNot) {
          return false;
        }
      }
    } else if (filters.dueDate || filters.dueDateStart || filters.dueDateEnd || filters.dueDateBefore || filters.dueDateStrictlyBefore) {
      return false;
    }
    
    // Filtro por usuario
    if (filters.userId && task.userId !== filters.userId && task.user?.id !== filters.userId) {
      return false;
    }
    
    return true;
  });

  console.log('Tareas después de filtrar:', filteredTasks.length);
  return filteredTasks;
};

export const taskService = {
  // Método principal para obtener tareas con filtros
  getTasks: async (filters = {}) => {
    try {
      const queryString = buildQueryParams(filters);
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      
      const response = await api.get(url, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      let tasks = response.data;
      
      // Si la respuesta tiene estructura de paginación, extraer las tareas
      if (tasks && typeof tasks === 'object' && !Array.isArray(tasks)) {
        if (tasks.data && Array.isArray(tasks.data)) {
          tasks = tasks.data;
        } else if (tasks.rows && Array.isArray(tasks.rows)) {
          tasks = tasks.rows;
        }
      }
      
      // Asegurar que tasks sea un array
      if (!Array.isArray(tasks)) {
        console.warn('getTasks: respuesta no es un array:', tasks);
        tasks = [];
      }
      
      // Aplicar filtros del lado cliente
      tasks = applyClientSideFilters(tasks, filters);
      
      return tasks;
      
    } catch (error) {
      console.error('Error getTasks:', error);
      throw error;
    }
  },

  // Método para obtener todas las tareas
  getAllTasks: async (filters = {}) => {
    return await taskService.getTasks(filters);
  },

  // Método para obtener tareas de un usuario específico
  getUserTasks: async (userId, filters = {}) => {
    try {
      const filtersWithUser = { ...filters, userId };
      return await taskService.getTasks(filtersWithUser);
    } catch (error) {
      console.error('Error getUserTasks:', error);
      throw error;
    }
  },

  // Método para obtener usuarios únicos
  getUsers: async () => {
    try {
      try {
        const response = await api.get('/users', {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Si no existe endpoint de usuarios, extraer de las tareas
        const response = await api.get('/tasks', {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        let tasks = response.data;
        
        // Manejar estructura de respuesta
        if (tasks && typeof tasks === 'object' && !Array.isArray(tasks)) {
          if (tasks.data && Array.isArray(tasks.data)) {
            tasks = tasks.data;
          } else if (tasks.rows && Array.isArray(tasks.rows)) {
            tasks = tasks.rows;
          }
        }
        
        if (!Array.isArray(tasks)) {
          return [];
        }
        
        // Extraer usuarios únicos
        const usersMap = new Map();
        tasks.forEach(task => {
          if (task.user) {
            usersMap.set(task.user.id, task.user);
          } else if (task.userId) {
            usersMap.set(task.userId, {
              id: task.userId,
              username: `Usuario ${task.userId}`,
              role: 'USER'
            });
          }
        });
        
        return Array.from(usersMap.values());
      }
    } catch (error) {
      console.error('Error getUsers:', error);
      return [];
    }
  },

  // Obtener una tarea específica
  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      let task = response.data;
      
      // Manejar estructura de respuesta
      if (task && typeof task === 'object' && task.data) {
        task = task.data;
      }
      
      return task;
    } catch (error) {
      console.error('Error getTask:', error);
      throw error;
    }
  },

  // Crear nueva tarea simple (sin archivo)
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      let task = response.data;
      
      // Manejar estructura de respuesta
      if (task && typeof task === 'object' && task.data) {
        task = task.data;
      }
      
      return task;
    } catch (error) {
      console.error('Error createTask:', error);
      throw error;
    }
  },

  // Crear tarea con archivo adjunto
  createTaskWithAttachment: async (taskData, file) => {
    try {
      const formData = new FormData();
      
      // Agregar datos de la tarea
      Object.keys(taskData).forEach(key => {
        if (taskData[key] !== null && taskData[key] !== undefined && taskData[key] !== '') {
          formData.append(key, taskData[key]);
        }
      });
      
      // Agregar archivo si existe
      if (file) {
        formData.append('attachment', file);
      }

      const response = await api.post('/tasks/with-attachment', formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      let task = response.data;
      
      // Manejar estructura de respuesta
      if (task && typeof task === 'object' && task.data) {
        task = task.data;
      }
      
      return task;
    } catch (error) {
      console.error('Error createTaskWithAttachment:', error);
      throw error;
    }
  },

  // Actualizar tarea existente
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      let task = response.data;
      
      // Manejar estructura de respuesta
      if (task && typeof task === 'object' && task.data) {
        task = task.data;
      }
      
      return task;
    } catch (error) {
      console.error('Error updateTask:', error);
      throw error;
    }
  },

  // Eliminar tarea
  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleteTask:', error);
      throw error;
    }
  },

  // Subir archivo a tarea existente
  uploadAttachment: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      
      const response = await api.post(`/tasks/${id}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      let result = response.data;
      
      // Manejar estructura de respuesta
      if (result && typeof result === 'object' && result.data) {
        result = result.data;
      }
      
      return result;
    } catch (error) {
      console.error('Error uploadAttachment:', error);
      throw error;
    }
  },

  // Obtener URL para ver archivo
  getFileUrl: (filename) => {
    // Asumiendo que tu API base está en una variable o puedes obtenerla
    const apiBase = api.defaults?.baseURL || import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    return `${apiBase}/uploads/${filename}`;
  },

  // Obtener URL para descargar archivo
  getDownloadUrl: (filename) => {
    const apiBase = api.defaults?.baseURL || import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    return `${apiBase}/downloads/${filename}`;
  },

  // Descargar archivo
  downloadFile: async (filename) => {
    try {
      const url = taskService.getDownloadUrl(filename);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
};  