const express = require('express');
const router = express.Router();
const CalificacionesController = require('../controller/calificacionesController');

// CRUD y consultas de notas
router.post('/notas-modulo', CalificacionesController.upsertNotaModulo);
// Actualizar por ID
router.patch('/notas-modulo/:id', CalificacionesController.actualizarNota);
// Actualizar por cuerpo (matrícula+módulo)
router.patch('/notas-modulo', CalificacionesController.actualizarNota);
router.delete('/notas-modulo/:id', CalificacionesController.eliminarNota);

// Listar notas por módulo y oferta
router.get('/notas-modulo/modulo/:id_modulo/oferta/:id_oferta_curso', CalificacionesController.listarNotasPorModuloOferta);

// Listar notas por estudiante y oferta (evitar conflicto con /:id)
router.get('/notas-modulo/persona/:id_persona/oferta/:id_oferta_curso', CalificacionesController.obtenerNotasPorEstudianteOferta);

// Obtener nota por id
router.get('/notas-modulo/:id', CalificacionesController.obtenerNotaPorId);

// Listado general
router.get('/notas-modulo', CalificacionesController.listarTodas);

module.exports = router;