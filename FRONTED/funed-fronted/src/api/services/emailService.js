import axiosClient from '../axiosClient';

const emailService = {
  // Envía correo de bienvenida con las credenciales
  sendWelcome: async ({ email, numero_identificacion, nombre }) => {
    const payload = { email, numero_identificacion, nombre };
    const { data } = await axiosClient.post('/api/email/send-welcome', payload);
    return data; // { message, messageId } o error con { reason }
  },

  // Envía correo de aprobación de pago del curso
  sendPaymentApproved: async ({ email, nombre, curso }) => {
    const payload = { email, nombre, curso };
    const { data } = await axiosClient.post('/api/email/send-payment-approved', payload);
    return data; // { message, messageId }
  },
};

export default emailService;