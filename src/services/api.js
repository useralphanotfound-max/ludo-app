const API_BASE_URL = '/api';

export const apiFetch = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  const storedToken = token || localStorage.getItem('royal_admin_token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok && data.message) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`[API Error ${method} ${endpoint}]`, error);
    throw error;
  }
};
