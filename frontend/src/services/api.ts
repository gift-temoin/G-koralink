import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('g_koralink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standardize error messages in Kinyarwanda
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMsg = 'Habaye ikibazo. Ongera ugerageze nyuma gato.';

    if (!error.response) {
      customMsg = 'Ntabwo twabashije guhuza na seriveri. Reba internet yawe wongere ugerageze.';
    } else if (error.response.data && error.response.data.detail) {
      if (typeof error.response.data.detail === 'string') {
        customMsg = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        // Pydantic validation errors array
        const firstErr = error.response.data.detail[0];
        customMsg = firstErr.msg || 'Nyamuneka reba ko amakuru yose wavuze ari yo.';
      }
    } else if (error.response.status === 401) {
      customMsg = 'Ntabwo wemerewe gukora iki gikorwa. Banza winjire muri konti yawe.';
    } else if (error.response.status === 403) {
      customMsg = 'Iki gice kigenewe ubuyobozi gusa.';
    }

    return Promise.reject(new Error(customMsg));
  }
);

export default api;
