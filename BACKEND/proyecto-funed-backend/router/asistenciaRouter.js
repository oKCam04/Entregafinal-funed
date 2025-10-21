const express = require('express');
const router = express.Router();
const AsistenciaController = require('../controller/asistenciaController');
const aunthmiddleware = require('../middlewares/auth.middleware');

// Obtener todas las asistencias
router.get("/asistencia", AsistenciaController.GetAll);

// Crear una nueva asistencia
router.post("/asistencia", AsistenciaController.Create);

// Obtener una asistencia por ID
router.get("/asistencia/:id", AsistenciaController.GetForId);

// Obtener asistencias de una persona por curso matriculado
router.get("/asistencia/persona/:id_persona/curso/:id_curso_matriculado", AsistenciaController.GetForPersonaCurso);

// Actualizar una asistencia
router.patch("/asistencia/:id", AsistenciaController.Update);

// Eliminar una asistencia
router.delete("/asistencia/:id", AsistenciaController.Delete);

module.exports = router;
