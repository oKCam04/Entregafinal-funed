import axiosClient from '../axiosClient';

const personasService = {
  list: async (params) => {
    const { data } = await axiosClient.get('/api/personas', { params });
    return data;
  },
  create: async (payload) => {
    // payload: { nombre, apellido, tipoIdentificacion, numeroIdentificacion, fechaNacimiento, correo, telefono }
    const { data } = await axiosClient.post('/api/personas', payload);
    return data; // puede ser { id } o el objeto completo
  },
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/personas/${id}`);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/personas/${id}`, payload);
    return data;
  },

  // Listar personas activas matriculadas por oferta de curso
  // Endpoint backend: GET /api/personas/oferta/:id_oferta_curso/activos
  listActivosByOferta: async (id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/personas/oferta/${id_oferta_curso}/activos`);
    // El backend puede responder arreglo directo o { personas: [...] }
    const list = Array.isArray(data) ? data : data?.personas;
    return Array.isArray(list) ? list : [];
  },
};

export default personasService;
