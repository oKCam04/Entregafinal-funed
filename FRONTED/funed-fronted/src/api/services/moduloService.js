import axiosClient from '../axiosClient'

const moduloService = {
  // Listar todos los módulos
  list: async (params) => {
    const { data } = await axiosClient.get('/api/modulos', { params })
    return data
  },

  // Obtener un módulo por ID
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/modulos/${id}`)
    return data
  },

  // Crear un nuevo módulo
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/modulos', payload)
    return data
  },

  // Actualizar un módulo existente
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/modulos/${id}`, payload)
    return data
  },

  // Eliminar un módulo
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/modulos/${id}`)
    return data
  },

  // Listar módulos por oferta de curso
  listByOfertaCurso: async (id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/modulos/oferta/${id_oferta_curso}`)
    // El backend responde { mensaje, modulos }
    return data?.modulos ?? data
  },

  // Listar módulos asignados a un docente (id_persona) para una oferta específica
  listByDocenteOferta: async (id_persona, id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/modulos/docente/${id_persona}/oferta/${id_oferta_curso}`)
    // El backend responde { mensaje, modulos }
    return Array.isArray(data?.modulos) ? data.modulos : Array.isArray(data) ? data : []
  },
}

export default moduloService