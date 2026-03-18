// API Configuration for LawConnect Frontend
// This file handles all API calls to the backend

const API_BASE_URL = 'https://demo-lawconnect.onrender.com/api';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('lawconnect_token');
}

// Helper function to handle API responses
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

// API Methods
const API = {
  // Authentication endpoints
  auth: {
    register: async (lawyerData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lawyerData)
      });
      return handleResponse(response);
    },

    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(response);
    },

    getMe: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    updatePassword: async (currentPassword, newPassword) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/auth/updatepassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      return handleResponse(response);
    },

    logout: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.removeItem('lawconnect_token');
      localStorage.removeItem('lawconnect_user');
      localStorage.removeItem('lawconnect_role');
      localStorage.removeItem('lawconnect_loggedIn');
      return handleResponse(response);
    }
  },

  // Lawyer endpoints
  lawyers: {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${API_BASE_URL}/lawyers?${queryParams}` : `${API_BASE_URL}/lawyers`;
      
      const response = await fetch(url);
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/lawyers/${id}`);
      return handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lawyers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      return handleResponse(response);
    },

    getDashboardStats: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lawyers/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    updateSettings: async (settings) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/lawyers/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      return handleResponse(response);
    },

    search: async (query) => {
      const response = await fetch(`${API_BASE_URL}/lawyers/search?q=${encodeURIComponent(query)}`);
      return handleResponse(response);
    }
  },

  // Appointments endpoints
  appointments: {
    getAll: async (filters = {}) => {
      const token = getAuthToken();
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${API_BASE_URL}/appointments?${queryParams}` : `${API_BASE_URL}/appointments`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    confirm: async (id) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    cancel: async (id, cancelReason) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cancelReason })
      });
      return handleResponse(response);
    },

    getToday: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/appointments/today`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    getUpcoming: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/appointments/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    }
  },

  // Reviews endpoints
  reviews: {
    getMyReviews: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    getLawyerReviews: async (lawyerId) => {
      const response = await fetch(`${API_BASE_URL}/reviews/lawyer/${lawyerId}`);
      return handleResponse(response);
    },

    respond: async (reviewId, responseText) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response: responseText })
      });
      return handleResponse(response);
    }
  },

  // Chat endpoints
  chat: {
    getAll: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
    },

    getById: async (chatId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
    },

    sendMessage: async (chatId, message) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      return handleResponse(response);
    },

    markAsRead: async (chatId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
    },

    getUnreadCount: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/unread/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
    },

    close: async (chatId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
    }
  },

  // Availability endpoints
  availability: {
    get: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },

    update: async (availabilityData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(availabilityData)
      });
      return handleResponse(response);
    },

    getSlots: async (lawyerId, date) => {
      const response = await fetch(`${API_BASE_URL}/availability/slots/${lawyerId}?date=${date}`);
      return handleResponse(response);
    }
  }
};

// Export for use in other files
window.API = API;
window.API_BASE_URL = API_BASE_URL;
