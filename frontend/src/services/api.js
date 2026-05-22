import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// Interceptor request para agregar JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let renovando = false;

// Interceptor response para manejar token expirado (evitar multiples intentos de refresh simultáneamente)
api.interceptors.response.use(
  response => response,
  async error => {
    const solicitudOriginal = error.config;

    if (error.response?.status === 401 && !solicitudOriginal._yaReintentado && !solicitudOriginal.url.includes('/token/refresh')) {
      solicitudOriginal._yaReintentado = true;
      if(renovando) {
        return Promise.reject(error);
      }

      renovando = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if(!refreshToken) {
          throw new Error('No hay refresh token');
        }

        // Llamada al endpoint de Django para obtener un nuevo access token
        const { data } = await axios.post('/api/token/refresh/', {
          refresh: refreshToken,
        });

        // Se guarda el nuevo access token en el mismo storage donde estaba
        if (localStorage.getItem('refreshToken')) {
          localStorage.setItem('accessToken', data.access);
        } else {
          sessionStorage.setItem('accessToken', data.access);
        }

        // Se actualiza el header y reintenta la petición original
        solicitudOriginal.headers.Authorization = `Bearer ${data.access}`;
        return api(solicitudOriginal);

      } catch {
         // Si el refresh falló (expiró o es inválido), limpia todo y manda al login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(error);

      } finally {
        renovando = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;