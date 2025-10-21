import axiosClient from '../axiosClient';

const documentoService = {
  // Lista todos los documentos
  list: async (params) => {
    const { data } = await axiosClient.get('/api/documento', { params });
    return data;
  },

  // Crea un documento
  create: async (payload) => {
    // payload esperada incluye al menos: { id_persona, ...campos }
    const { data } = await axiosClient.post('/api/documento', payload);
    return data;
  },

  // Obtiene un documento por ID
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/documento/${id}`);
    return data;
  },

  // Actualiza un documento por ID
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/documento/${id}`, payload);
    return data;
  },

  // Elimina un documento por ID
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/documento/${id}`);
    return data;
  },
};

export default documentoService;