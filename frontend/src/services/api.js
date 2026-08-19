import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const meetingService = {
  uploadMeeting: (file, title, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    return api.post('/meetings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  getMeetings: (search = '', sortBy = 'createdAt', sortDir = 'desc') => {
    return api.get('/meetings', {
      params: { search, sortBy, sortDir },
    });
  },

  getMeeting: (id) => {
    return api.get(`/meetings/${id}`);
  },

  deleteMeeting: (id) => {
    return api.delete(`/meetings/${id}`);
  },

  getTranscript: (id) => {
    return api.get(`/meetings/${id}/transcript`);
  },

  getSummary: (id) => {
    return api.get(`/meetings/${id}/summary`);
  },

  getActionItems: (id) => {
    return api.get(`/meetings/${id}/action-items`);
  },
};

export const actionItemService = {
  updateActionItem: (meetingId, actionItemId, updates) => {
    return api.patch(`/action-items/${meetingId}/${actionItemId}`, updates);
  },
  
  deleteActionItem: (meetingId, actionItemId) => {
    return api.delete(`/action-items/${meetingId}/${actionItemId}`);
  }
};

export const systemService = {
  getSettings: () => {
    return api.get('/system/settings');
  },
  saveSettings: (settings) => {
    return api.post('/system/settings', settings);
  }
};

export default api;
