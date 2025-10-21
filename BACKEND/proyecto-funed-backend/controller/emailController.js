'use strict';

const EmailService = require('../services/emailService');

class EmailController {
  // Endpoint desacoplado: recibe email y número de identificación desde el front
  static async sendWelcome(req, res) {
    try {
      // Acepta alias comunes para mayor robustez
      const email = req.body?.email ?? req.body?.correo ?? req.body?.usuario;
      const numero_identificacion = req.body?.numero_identificacion ?? req.body?.cedula;
      const nombre = req.body?.nombre ?? req.body?.name ?? '';

      if (!email || !numero_identificacion) {
        return res.status(400).json({ message: 'email y numero_identificacion son requeridos' });
      }

      // Dispara el envío en background para no bloquear el request del front
      EmailService.sendWelcomeOnRegistration({
        to: email,
        nombre,
        email,
        numero_identificacion,
      })
        .then((result) => {
          if (result?.sent) {
            console.log('[Email] Bienvenida enviada', { messageId: result.messageId, to: email });
          } else {
            console.warn('[Email] Bienvenida no enviada', { reason: result?.reason, to: email });
          }
        })
        .catch((err) => {
          console.error('[Email] Error al enviar bienvenida', err?.message || err);
        });

      // Responde inmediatamente para evitar timeouts en el cliente
      return res.json({ message: 'Solicitud de envío de bienvenida recibida' });
    } catch (error) {
      res.status(500).json({ message: 'Error al enviar correo de bienvenida', error: error.message });
    }
  }

  // Enviar correo cuando el pago del curso ha sido aprobado
  static async sendPaymentApproved(req, res) {
    try {
      const { email, nombre, curso } = req.body;
      if (!email || !curso) {
        return res.status(400).json({ message: 'email y curso son requeridos' });
      }

      const result = await EmailService.sendPaymentApproved({
        to: email,
        nombre,
        curso,
      });

      if (result.sent) {
        return res.json({ message: 'Correo de aprobación enviado', messageId: result.messageId });
      }
      return res.status(500).json({ message: 'No se pudo enviar el correo de aprobación', reason: result.reason });
    } catch (error) {
      res.status(500).json({ message: 'Error al enviar correo de aprobación', error: error.message });
    }
  }
}

module.exports = EmailController;