const express = require('express');
const router = express.Router();
const moduloController = require('../controller/moduloController');

router.get("/modulos", moduloController.listarModulos);

router.post("/modulos", moduloController.crearModulo);

router.get("/modulos/:id", moduloController.buscarModuloPorId);

router.patch("/modulos/:id", moduloController.actualizarModulo);

router.delete("/modulos/:id", moduloController.eliminarModulo);

// Obtener módulos asociados a una oferta de curso específica
router.get("/modulos/oferta/:id_oferta_curso", moduloController.obtenerModulosPorOfertaCurso);

// Obtener módulos por curso/oferta para un docente (enviando id_persona)
router.get("/modulos/docente/:id_persona", moduloController.obtenerModulosPorDocentePersona);

// Obtener módulos de una oferta específica asignados a un docente (id_persona)
router.get("/modulos/docente/:id_persona/oferta/:id_oferta_curso", moduloController.obtenerModulosPorDocenteOferta);

module.exports = router;