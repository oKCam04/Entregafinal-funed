import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const axiosClient = axios.create({
  baseURL: API_URL,
  // Aumenta el timeout global para evitar cortes en Render (cold starts / email providers)
  timeout: 60000,
});

// Request: adjunta token si existe
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // o desde AuthContext si lo prefieres
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Extiende el timeout en endpoints potencialmente lentos (envío de correo, notificaciones, exportaciones)
  try {
    const url = String(config?.url || '');
    const slowPaths = [
      '/api/email',
      '/api/correo',
      '/api/notificacion',
      '/api/auth/recuperar',
      '/api/usuarios/invitar',
      '/api/reportes/exportar',
    ];
    if (slowPaths.some(p => url.startsWith(p))) {
      // 90s para operaciones con proveedores externos y Render cold-start
      config.timeout = Math.max(config.timeout || 0, 90000);
    }
  } catch {}
  // Debug de asistencia: loguea payloads enviados
  try {
    const url = String(config?.url || '');
    if (url.startsWith('/api/asistencia')) {
      const method = String(config?.method || 'GET').toUpperCase();
      // Evita imprimir archivos grandes; aquí solo JSON
      console.log('[Asistencia] Request', method, url, { data: config?.data });
    }
    // Debug de personas: seguimiento de actualizaciones
    if (url.startsWith('/api/personas')) {
      const method = String(config?.method || 'GET').toUpperCase();
      if (method === 'PATCH' || method === 'POST') {
        console.log('[Personas] Request', method, url, { data: config?.data });
      }
    }
  } catch {}
  return config;
});

// Response: manejo básico de errores y 401
axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;

    // ejemplo: si llega 401 podrías desloguear o intentar refresh
    if (status === 401) {
      // opcional: disparar logout global, limpiar storage, navegar a login, etc.
      // window.dispatchEvent(new Event('auth-changed'));
    }

    // Propaga el error para que el caller lo maneje
    return Promise.reject(error);
  }
);

export default axiosClient;
