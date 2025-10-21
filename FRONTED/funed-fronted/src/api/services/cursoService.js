import axiosClient from '../axiosClient';

const cursosService = {
  list: async (params) => {
    const { data } = await axiosClient.get('/api/cursos', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/cursos/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/cursos', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/cursos/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/cursos/${id}`);
    return data;
  },
};

export default cursosService;
