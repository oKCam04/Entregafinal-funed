const express = require('express');
const router = express.Router();
const ModuloDocenteController = require('../controller/moduloDocenteController');

// Listar todas las asignaciones módulo-docente
router.get('/modulo-docente', ModuloDocenteController.listar);

// Obtener asignaciones módulo-docente por oferta de curso
router.get('/modulo-docente/oferta/:id_oferta_curso', ModuloDocenteController.obtenerPorOfertaCurso);

// Crear asignación módulo-docente
router.post('/modulo-docente', ModuloDocenteController.crearAsignacion);

// Obtener asignación por ID
router.get('/modulo-docente/:id', ModuloDocenteController.obtenerPorId);

// Actualizar asignación
router.patch('/modulo-docente/:id', ModuloDocenteController.actualizar);

// Eliminar asignación
router.delete('/modulo-docente/:id', ModuloDocenteController.eliminar);

module.exports = router;