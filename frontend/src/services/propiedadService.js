import api from './api';

const propiedadService = {
  listar: (busqueda = '') =>
    api.get(`/propiedades/${busqueda ? `?search=${busqueda}` : ''}`),
  obtener: (id) => api.get(`/propiedades/${id}/`),
  crear: (data) => api.post('/propiedades/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  actualizar: (id, data) => api.put(`/propiedades/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  eliminar: (id) => api.delete(`/propiedades/${id}/`),
};

export default propiedadService;