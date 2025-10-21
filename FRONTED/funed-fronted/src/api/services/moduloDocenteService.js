import axiosClient from '../axiosClient'

const moduloDocenteService = {
  // Listar todas las asignaciones módulo–docente
  list: async (params) => {
    const { data } = await axiosClient.get('/api/modulo-docente', { params })
    // El backend devuelve un arreglo directo
    return Array.isArray(data) ? data : (data?.asignaciones || [])
  },

  // Obtener una asignación por ID
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/modulo-docente/${id}`)
    return data
  },

  // Obtener asignaciones módulo–docente por oferta de curso
  getByOferta: async (id_oferta_curso) => {
    const { data } = await axiosClient.get(`/api/modulo-docente/oferta/${id_oferta_curso}`)
    const list = Array.isArray(data) ? data : data?.asignaciones
    return Array.isArray(list) ? list : []
  },

  // Crear asignación módulo–docente
  create: async ({ id_modulo, id_docente, id_oferta_curso }) => {
    const payload = { id_modulo, id_docente, id_oferta_curso }
    const { data } = await axiosClient.post('/api/modulo-docente', payload)
    return data
  },

  // Actualizar una asignación módulo–docente
  update: async (id, changes) => {
    const { data } = await axiosClient.patch(`/api/modulo-docente/${id}`, changes)
    return data // { mensaje, asignacion }
  },

  // Eliminar una asignación módulo–docente
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/modulo-docente/${id}`)
    return data // { mensaje }
  },
}

export default moduloDocenteService