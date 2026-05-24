import api from './api';

const inventarioService = {
    listar: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/inventario/${query ? `?${query}` : ''}`);
    },
    obtener: (id) => api.get(`/inventario/${id}/`),
    crear: (data) => api.post('/inventario/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    actualizar: (id, data) => api.put(`/inventario/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    eliminar: (id) => api.delete(`/inventario/${id}/`),
};

export default inventarioService;