import axiosClient from '../axiosClient';

const pagoService = {
  list: async (params) => {
    const { data } = await axiosClient.get('/api/pago', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/pago/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/pago', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/pago/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/pago/${id}`);
    return data;
  },
};

export default pagoService;
