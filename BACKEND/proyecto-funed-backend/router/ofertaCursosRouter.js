const express = require('express');
const router = express.Router();
const ofertaCursosController = require('../controller/ofertaCursosController');

router.get("/ofertaCursos", ofertaCursosController.listarOfertasCursos);

router.post("/ofertaCursos", ofertaCursosController.crearOfertaCurso);

router.get("/ofertaCursos/:id", ofertaCursosController.obtenerOfertaCursoPorId);

// Listar ofertas de curso donde esté asignado un docente (por id_docente)
router.get("/ofertaCursos/docente/:id_persona", ofertaCursosController.obtenerOfertasPorDocente);

router.patch("/ofertaCursos/:id", ofertaCursosController.actualizarOfertaCurso);

router.delete("/ofertaCursos/:id", ofertaCursosController.eliminarOfertaCurso);

module.exports = router;
