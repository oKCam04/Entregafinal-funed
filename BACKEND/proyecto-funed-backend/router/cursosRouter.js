const express = require('express');
const router = express.Router();
const cursosController = require('../controller/cursosController');
const aunthmiddleware = require('../middlewares/auth.middleware');

router.get("/cursos", cursosController.listarCursos);

router.post("/cursos", aunthmiddleware, cursosController.crearCurso);

router.get("/cursos/:id", aunthmiddleware, cursosController.buscarCursoPorId);

router.patch("/cursos/:id", cursosController.actualizarCurso);

router.delete("/cursos/:id", cursosController.eliminarCurso);

module.exports = router;
