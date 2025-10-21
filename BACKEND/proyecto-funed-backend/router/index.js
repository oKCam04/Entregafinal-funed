const express = require('express');
const router = express.Router();

const personasRouter = require('./personasRouter');
const cursosRouter = require('./cursosRouter');
const docentesRouter = require('./docenteRouter');
const ofertaCursosRouter = require('./ofertaCursosRouter');
const pagoRouter = require('./pagoRouter');
const certificadoRouter = require('./certificadoRouter');
const cursosMatriculadosRouter = require('./matricularCursosRouter');
const documentoRouter = require('./documentoRouter');
const asistenciaRouter=require('./asistenciaRouter');
const moduloRouter = require('./moduloRouter');
const calificacionesRouter = require('./calificacionesRouter');
const contenidoApoyoRouter = require('./contenidoApoyoRouter');
const emailRouter = require('./emailRouter');
const moduloDocenteRouter = require('./moduloDocenteRouter');

router.use(personasRouter);
router.use(cursosRouter);
router.use(docentesRouter);
router.use(ofertaCursosRouter);
router.use(pagoRouter);
router.use(certificadoRouter);
router.use(cursosMatriculadosRouter);
router.use(documentoRouter);
router.use(asistenciaRouter);
router.use(moduloRouter);
router.use(calificacionesRouter);
router.use(contenidoApoyoRouter);
router.use(emailRouter);
router.use(moduloDocenteRouter);

module.exports = router;