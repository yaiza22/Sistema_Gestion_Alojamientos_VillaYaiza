import api from './api';

const contratoService = {
  generar:  (reservaId, data = {}) =>
    api.post(`/contratos/reserva/${reservaId}/generar/`, data),
  obtener:  (reservaId) =>
    api.get(`/contratos/reserva/${reservaId}/`),
  descargarPdf: (reservaId) =>
    api.get(`/contratos/reserva/${reservaId}/pdf/`, { responseType: 'blob' }),
};

export default contratoService;