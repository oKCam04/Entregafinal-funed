'use strict';

const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || 'no-reply@funed.local';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'FUNED';
const APP_URL = process.env.APP_URL || '';

function assertSendgridConfig() {
  if (!SENDGRID_API_KEY) {
    throw new Error('Falta SENDGRID_API_KEY en variables de entorno');
  }
}

// Inicializa SendGrid una sola vez
assertSendgridConfig();
sgMail.setApiKey(SENDGRID_API_KEY);

async function sendWelcomeOnRegistration({ to, nombre, email, numero_identificacion }) {
  const subject = 'Bienvenido a FUNED - Acceso y credenciales';
  const safeEmail = String(email || '');
  const safeCedula = String(numero_identificacion || '');
  const accesoTexto = APP_URL ? `Ingresa al aplicativo: ${APP_URL}` : 'Ingresa al aplicativo para acceder.';
  const accesoLink = APP_URL
    ? `<p><a href="${APP_URL}" style="display:inline-block;padding:10px 16px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px">Ingresar al aplicativo</a></p>`
    : '';
  const text = `Hola ${nombre || ''},\n\nTe damos la bienvenida.\n\nTus credenciales de acceso:\n- Usuario (correo): ${safeEmail}\n- Contraseña: ${safeCedula}\n\n${accesoTexto}\n\nPor seguridad, cambia tu contraseña tras el primer ingreso.\n\nEquipo FUNED`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto; line-height:1.6"> 
      <h2>Bienvenido a FUNED</h2>
      <p>Hola <strong>${nombre || ''}</strong>,</p>
      <p>Tu registro fue exitoso. Estas son tus credenciales:</p>
      <ul>
        <li><strong>Usuario (correo):</strong> ${safeEmail || '<em>No disponible</em>'}</li>
        <li><strong>Contraseña:</strong> ${safeCedula || '<em>No disponible</em>'}</li>
      </ul>
      ${accesoLink}
      <p><em>Recomendación:</em> cambia tu contraseña tras el primer ingreso.</p>
      <p>Saludos,<br/>Equipo FUNED</p>
    </div>
  `;

  const msg = {
    to,
    from: { email: MAIL_FROM, name: MAIL_FROM_NAME },
    subject,
    text,
    html,
  };

  const [response] = await sgMail.send(msg);
  const messageId = response?.headers?.['x-message-id'] || response?.headers?.['X-Message-Id'] || null;
  return { sent: true, messageId };
}

async function sendPaymentApproved({ to, nombre, curso }) {
  const subject = 'Pago aprobado - Acceso al curso';
  const accesoTexto = APP_URL ? `Ingresa al aplicativo: ${APP_URL}` : 'Ingresa al aplicativo para acceder a tu curso.';
  const text = `Hola ${nombre || ''},\n\nTu pago para el curso "${curso}" ha sido aprobado.\n\n${accesoTexto}\n\nÉxitos en tu proceso de formación.\n\nEquipo FUNED`;
  const accesoLink = APP_URL
    ? `<p><a href="${APP_URL}" style="display:inline-block;padding:10px 16px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px">Ingresar al aplicativo</a></p>`
    : '<p>Ingresa al aplicativo para acceder a tu curso.</p>';
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto; line-height:1.6"> 
      <h2>Pago aprobado</h2>
      <p>Hola <strong>${nombre || ''}</strong>,</p>
      <p>Tu pago para el curso <strong>${curso}</strong> ha sido aprobado.</p>
      ${accesoLink}
      <p>Éxitos en tu proceso de formación.<br/>Equipo FUNED</p>
    </div>
  `;

  const msg = {
    to,
    from: { email: MAIL_FROM, name: MAIL_FROM_NAME },
    subject,
    text,
    html,
  };

  const [response] = await sgMail.send(msg);
  const messageId = response?.headers?.['x-message-id'] || response?.headers?.['X-Message-Id'] || null;
  return { sent: true, messageId };
}

module.exports = { sendWelcomeOnRegistration, sendPaymentApproved };