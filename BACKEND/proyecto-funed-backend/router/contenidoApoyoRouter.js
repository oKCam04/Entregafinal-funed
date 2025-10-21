const express = require('express');
const router = express.Router();
const ContenidoApoyoController = require('../controller/contenidoApoyoController');

router.get('/contenidoApoyo', ContenidoApoyoController.listarContenidoApoyo);

router.post('/contenidoApoyo', ContenidoApoyoController.crearContenidoApoyo);

router.get('/contenidoApoyo/:id', ContenidoApoyoController.obtenerContenidoApoyoPorId);

router.patch('/contenidoApoyo/:id', ContenidoApoyoController.actualizarContenidoApoyo);

router.delete('/contenidoApoyo/:id', ContenidoApoyoController.eliminarContenidoApoyo);

// Obtener contenido de apoyo por oferta de curso
router.get('/contenidoApoyo/oferta/:id_oferta_curso', ContenidoApoyoController.obtenerPorOferta);

module.exports = router;