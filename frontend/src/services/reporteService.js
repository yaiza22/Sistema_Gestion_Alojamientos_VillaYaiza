import api from './api';

const reporteService = {
    ingresos: (params) => api.get('/reportes/ingresos/', { params }),
    ocupacion: (params) => api.get('/reportes/ocupacion/', { params }),
    inventario: (params) => api.get('/reportes/inventario/', { params }),
};

export default reporteService;