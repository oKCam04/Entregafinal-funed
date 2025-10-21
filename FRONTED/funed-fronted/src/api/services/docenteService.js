import axiosClient from '../axiosClient'

const docenteService = {
  // Listar todos los docentes
  list: async (params) => {
    const { data } = await axiosClient.get('/api/docente', { params })
    return data
  },

  // Obtener un docente por ID
  getById: async (id) => {
    const { data } = await axiosClient.get(`/api/docente/${id}`)
    return data
  },

  // Crear un nuevo docente
  create: async (payload) => {
    const { data } = await axiosClient.post('/api/docente', payload)
    return data
  },

  // Actualizar un docente existente
  update: async (id, payload) => {
    const { data } = await axiosClient.patch(`/api/docente/${id}`, payload)
    return data
  },

  // Eliminar un docente
  remove: async (id) => {
    const { data } = await axiosClient.delete(`/api/docente/${id}`)
    return data
  },
}

export default docenteService
