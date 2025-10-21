import axiosClient from '../axiosClient';

const cursoMatriculadoService = {
  list: async () => {
    const { data } = await axiosClient.get('/api/matriculas');
    return data;
  },
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/matriculas', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/matriculas/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/matriculas/${id}`);
    return data;
  },
  getForPerson: async (id) => {
    const { data } = await axiosClient.get(`/api/cursosPersonas/${id}`);
    return data;
  }
};

export default cursoMatriculadoService;
