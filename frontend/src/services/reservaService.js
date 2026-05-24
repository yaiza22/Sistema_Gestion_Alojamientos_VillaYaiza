import api from './api';

const reservaService = {
    // Reservas
    listar: () => api.get('/reservas/'),
    obtener: (id) => api.get(`/reservas/${id}/`),
    crear: (data) => api.post('/reservas/', data),
    actualizar: (id, data) => api.put(`/reservas/${id}/`, data),
    eliminar: (id) => api.delete(`/reservas/${id}/`),
    cancelar: (id, data) => api.post(`/reservas/${id}/cancelar/`, data),

    // Disponibilidad
    verificarDisponibilidad: (params) =>
        api.get('/reservas/disponibilidad/', { params }),

    // Pagos
    agregarPago: (id, data) => api.post(`/reservas/${id}/pagos/`, data),
    eliminarPago: (id, pagoId) => api.delete(`/reservas/${id}/pagos/${pagoId}/`),

    // Check-in / Check-out
    iniciarCheckin: (id, data) => api.post(`/reservas/${id}/checkin/`, data),
    actualizarChecklist: (id, itemId, data) =>
        api.put(`/reservas/${id}/checklist/${itemId}/`, data),
    iniciarCheckout: (id, data) => api.post(`/reservas/${id}/checkout/`, data),
    actualizarCostoDanio: (id, data) => api.put(`/reservas/${id}/costo-danio/`, data),
    confirmarCompletada: (id) => api.post(`/reservas/${id}/completar/`),
};

export default reservaService;