import axiosClient from '../axiosClient';

const contenidoApoyoService = {
  // Lista general
  list: async (params) => {
    const { data } = await axiosClient.get('/api/contenidoApoyo', { params });
    // El backend devuelve un arreglo directo
    return Array.isArray(data) ? data : [];
  },

  // Obtener por ID
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/contenidoApoyo/${id}`);
    return data;
  },

  // Crear
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/contenidoApoyo', payload);
    return data;
  },

  // Actualizar
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/contenidoApoyo/${id}`, payload);
    return data;
  },

  // Eliminar
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/contenidoApoyo/${id}`);
    return data;
  },

  // Listar por oferta de curso
  getByOferta: async (id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/contenidoApoyo/oferta/${id_oferta_curso}`);
    // El backend responde { mensaje, contenidos: [...] }
    const list = Array.isArray(data) ? data : data?.contenidos;
    return Array.isArray(list) ? list : [];
  },
};

export default contenidoApoyoService;