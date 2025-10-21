const express = require('express');
const router = express.Router();
const DocenteController = require('../controller/docenteController');

router.get("/docente", DocenteController.listarDocentes);

router.get("/docente/:id", DocenteController.obtenerDocentePorId);

// Buscar docente por id_persona (retorna datos completos de persona)
router.get("/docente/persona/:id_persona", DocenteController.obtenerDocentePorIdPersona);

router.post("/docente", DocenteController.crearDocente);

router.patch("/docente/:id", DocenteController.actualizarDocente);

router.delete("/docente/:id", DocenteController.eliminarDocente);

module.exports = router;
