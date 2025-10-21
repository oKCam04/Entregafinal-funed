'use strict';

const express = require('express');
const router = express.Router();
const EmailController = require('../controller/emailController');

// Endpoint dedicado para enviar correo de bienvenida
router.post('/email/send-welcome', EmailController.sendWelcome);

// Endpoint para enviar correo de aprobación de pago del curso
router.post('/email/send-payment-approved', EmailController.sendPaymentApproved);

module.exports = router;