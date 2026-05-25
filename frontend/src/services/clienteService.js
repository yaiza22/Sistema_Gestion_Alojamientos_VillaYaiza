import api from './api';

const clienteService = {
  listar: (busqueda = '') =>
    api.get(`/reservas/clientes/${busqueda ? `?search=${busqueda}` : ''}`),
  obtener: (id) => api.get(`/reservas/clientes/${id}/`),
  crear: (data) => api.post('/reservas/clientes/', data),
  actualizar: (id, data) => api.put(`/reservas/clientes/${id}/`, data),
  eliminar: (id) => api.delete(`/reservas/clientes/${id}/`),
  // Para módulo de reservas
  buscar: (termino) => api.get(`/reservas/clientes/?search=${termino}`),
};

export default clienteService;