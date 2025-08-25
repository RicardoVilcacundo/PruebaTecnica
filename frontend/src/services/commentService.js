import api from './api';

export const commentService = {
  getComments: async (taskId) => {
    const response = await api.get(`/comments/${taskId}/comments`);
    return response.data;
  },

  createComment: async (taskId, content) => {
    const response = await api.post(`/comments/${taskId}/comments`, { content });
    return response.data;
  },
};