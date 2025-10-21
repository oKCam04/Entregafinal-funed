import axiosClient from '../axiosClient';

const authService = {
  login: async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    return data; // { token, user: { persona } }
  },

  register: async ({ id_persona, email, password }) => {
    const { data } = await axiosClient.post('/auth/register', {
      id_persona,
      email,
      password,
    });
    return data; // estructura que devuelva tu backend
  },

  // Recuperación de contraseña: envía contraseña temporal al correo
  forgotPassword: async (email) => {
    const { data } = await axiosClient.post('/auth/forgot-password', { email });
    return data; // { message: '...' }
  },
};

export default authService;
