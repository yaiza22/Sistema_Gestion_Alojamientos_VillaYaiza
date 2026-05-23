import api from './api';

const propiedadService = {
  listar: () => api.get('/propiedades/'),
  obtener: (id) => api.get(`/propiedades/${id}/`),
  crear: (data) => api.post('/propiedades/', data),
  actualizar: (id, data) => api.put(`/propiedades/${id}/`, data),
  eliminar: (id) => api.delete(`/propiedades/${id}/`),
};

export default propiedadService;