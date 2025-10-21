import axiosClient from '../axiosClient';

const usuarioService = {
  // Actualiza datos del usuario por ID
  // payload esperado: { id_persona, email, password }
  update: async (id, payload) => {
    // Backend monta usuarioRouter bajo /auth, no /api
    const { data } = await axiosClient.patch(`/auth/user/${id}`, payload);
    return data;
  },
};

export default usuarioService;