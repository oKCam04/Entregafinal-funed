import axiosClient from '../axiosClient';

// Servicio de asistencias
// Endpoint: GET /api/asistencia/persona/:id_persona/curso/:id_curso_matriculado
// Devuelve { mensaje, asistencias: [...] } o un arreglo directo
const asistenciaService = {
  getByPersonaCurso: async (id_persona, id_curso_matriculado) => {
    const { data } = await axiosClient.get(`/api/asistencia/persona/${id_persona}/curso/${id_curso_matriculado}`);
    const list = Array.isArray(data) ? data : data?.asistencias;
    return Array.isArray(list) ? list : [];
  },

  // Crear registro de asistencia
  // payload: { id_curso_matriculado, asistio: 'Si'|'No', fecha, id_persona? }
  create: async (payload) => {
    const body = {
      ...payload,
      id_curso_matriculado: Number(payload?.id_curso_matriculado),
      id_persona: Number(payload?.id_persona),
    };
    const { data } = await axiosClient.post('/api/asistencia', body);
    return data;
  },

  // Actualizar registro de asistencia por ID
  update: async (id, cambios) => {
    const body = {
      ...cambios,
      id_persona: typeof cambios?.id_persona !== 'undefined' ? Number(cambios.id_persona) : cambios?.id_persona,
    };
    const { data } = await axiosClient.patch(`/api/asistencia/${id}`, body);
    return data;
  },
};

export default asistenciaService;