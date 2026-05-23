import api from './api';

const clienteService = {
  listar: () => api.get('/clientes/'),
  obtener: (id) => api.get(`/clientes/${id}/`),
  crear: (data) => api.post('/clientes/', data),
  actualizar: (id, data) => api.put(`/clientes/${id}/`, data),
  eliminar: (id) => api.delete(`/clientes/${id}/`),
};

export default clienteService;