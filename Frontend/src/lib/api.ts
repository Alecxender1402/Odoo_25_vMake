const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const apiClient = {
  // Auth endpoints
  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { username: string; email: string; password: string }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Stack endpoints
  getStacks: (params?: { sort?: string; tags?: string; unanswered?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.tags) queryParams.append('tags', params.tags);
    if (params?.unanswered) queryParams.append('unanswered', 'true');
    
    const query = queryParams.toString();
    return apiCall(`/stacks${query ? `?${query}` : ''}`);
  },

  getStack: (id: string) => apiCall(`/stacks/${id}`),

  // Fix: Ensure we send the correct data format to backend
  createStack: (stackData: { title: string; description: string; tags: string[] }) => {
    // Transform the data to match what backend expects
    const backendData = {
      title: stackData.title.trim(),
      description: stackData.description.trim(),
      tags: stackData.tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    
    console.log('Sending to backend:', backendData);
    
    return apiCall('/stacks', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  },

  voteOnStack: (id: string, type: 'up' | 'down') =>
    apiCall(`/stacks/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  // Comment endpoints
  getComments: (stackId: string) => apiCall(`/stacks/${stackId}/comments`),

  createComment: (stackId: string, text: string) =>
    apiCall(`/stacks/${stackId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  voteOnComment: (stackId: string, commentId: string, type: 'up' | 'down') =>
    apiCall(`/stacks/${stackId}/comments/${commentId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  // Tag endpoints
  getTags: () => apiCall('/stacks/tags'),
};