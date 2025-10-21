import axiosClient from '../axiosClient';

// Servicio de notas por módulo (por estudiante y oferta de curso)
// Endpoint: GET /api/notas-modulo/:id_persona/:id_oferta_curso
// Devuelve { notas: [...] } o arreglo directo
const calificacionesService = {
  getNotasModuloByPersonaOferta: async (id_persona, id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/notas-modulo/${id_persona}/${id_oferta_curso}`);
    const list = Array.isArray(data) ? data : data?.notas;
    return Array.isArray(list) ? list : [];
  },

  // Crear/actualizar nota de módulo (upsert)
  upsertNotaModulo: async ({ id_persona, id_oferta_curso, id_modulo, estado }) => {
    const { data } = await axiosClient.post(`/api/notas-modulo`, { id_persona, id_oferta_curso, id_modulo, estado });
    return Array.isArray(data) ? data : data?.nota || data;
  },

  // Actualizar nota por ID
  updateNota: async (id, estado) => {
    const { data } = await axiosClient.patch(`/api/notas-modulo/${id}`, { estado });
    return data?.nota || data;
  },

  // Eliminar nota por ID
  removeNota: async (id) => {
    const { data } = await axiosClient.delete(`/api/notas-modulo/${id}`);
    return data;
  },

  // Listar notas por módulo y oferta
  listByModuloOferta: async (id_modulo, id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/notas-modulo/modulo/${id_modulo}/oferta/${id_oferta_curso}`);
    const list = Array.isArray(data) ? data : data?.notas;
    return Array.isArray(list) ? list : [];
  },

  // Obtener nota de módulo por ID
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/notas-modulo/${id}`);
    // Backend responde { mensaje, nota } o el objeto directo
    return data?.nota ?? data;
  },

  // Listado general de notas de módulo
  listAll: async (params) => {
    const { data } = await axiosClient.get(`/api/notas-modulo`, { params });
    // Backend responde { mensaje, notas: [...] } o arreglo directo
    const list = Array.isArray(data) ? data : data?.notas;
    return Array.isArray(list) ? list : [];
  },
};

export default calificacionesService;