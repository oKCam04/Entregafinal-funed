import axiosClient from '../axiosClient';

const ofertaCursoService = {
  list: async (params) => {
    const { data } = await axiosClient.get('/api/ofertaCursos', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/ofertaCursos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/ofertaCursos', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/ofertaCursos/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/ofertaCursos/${id}`);
    return data;
  },
  // Listar ofertas relacionadas a un docente resolviendo por id_persona
  listByDocentePersona: async (id_persona) => {
    const { data } = await axiosClient.get(`/api/ofertaCursos/docente/${id_persona}`);
    return Array.isArray(data) ? data : [];
  },
};

export default ofertaCursoService;
