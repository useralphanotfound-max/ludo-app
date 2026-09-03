const API_BASE_URL = '/api';

export const apiFetch = async (endpoint, methodOrOptions = 'GET', bodyData = null, token = null) => {
  let method = 'GET';
  let body = null;
  let customHeaders = {};

  if (typeof methodOrOptions === 'object' && methodOrOptions !== null) {
    method = methodOrOptions.method || 'GET';
    if (methodOrOptions.body) {
      try {
        body = typeof methodOrOptions.body === 'string' ? JSON.parse(methodOrOptions.body) : methodOrOptions.body;
      } catch (e) {
        body = methodOrOptions.body;
      }
    }
    if (methodOrOptions.headers) {
      customHeaders = methodOrOptions.headers;
    }
  } else {
    method = methodOrOptions;
    body = bodyData;
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...customHeaders
  };

  const storedToken = token || (typeof window !== 'undefined' ? (localStorage.getItem('royal_admin_token') || localStorage.getItem('token')) : null);
  if (storedToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const fetchOptions = {
    method: method.toUpperCase(),
    headers
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method)) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
  const targetUrl = `${API_BASE_URL}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;

  try {
    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `API error ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[API Error ${fetchOptions.method} ${targetUrl}]`, error);
    throw error;
  }
};
