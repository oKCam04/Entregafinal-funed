const CalificacionesService = require('../services/calificacionesService');

class CalificacionesController {
  static async obtenerNotasPorEstudianteOferta(req, res) {
    const { id_persona, id_oferta_curso } = req.params;
    try {
      const notas = await CalificacionesService.listarNotasModuloPorEstudianteOferta(id_persona, id_oferta_curso);
      res.status(200).json({ mensaje: 'Notas por módulo obtenidas correctamente', notas });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener notas por estudiante y oferta de curso', error: error.message });
    }
  }

  static async upsertNotaModulo(req, res) {
    const b = req.body || {};
    const id_curso_matriculado = b.id_curso_matriculado ?? b.idCursoMatriculado;
    const id_persona = b.id_persona ?? b.idPersona;
    const id_oferta_curso = b.id_oferta_curso ?? b.idOfertaCurso ?? b.id_curso_oferta;
    const id_modulo = b.id_modulo ?? b.idModulo;
    const estado = b.estado;
    try {
      // Preferir forma del modelo (id_curso_matriculado + id_modulo)
      let nota;
      if (id_curso_matriculado && id_modulo) {
        nota = await CalificacionesService.upsertNotaModulo({
          id_curso_matriculado: Number(id_curso_matriculado),
          id_modulo: Number(id_modulo),
          estado,
        });
      } else {
        // Fallback: forma por persona y oferta
        if (!id_persona || !id_oferta_curso || !id_modulo) {
          return res.status(400).json({ mensaje: 'Faltan campos obligatorios: id_curso_matriculado,id_modulo ó id_persona,id_oferta_curso,id_modulo' });
        }
        nota = await CalificacionesService.upsertNotaModulo({
          id_persona: Number(id_persona),
          id_oferta_curso: Number(id_oferta_curso),
          id_modulo: Number(id_modulo),
          estado,
        });
      }
      res.status(200).json({ mensaje: 'Nota registrada/actualizada correctamente', nota });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al registrar/actualizar la nota', error: error.message });
    }
  }

  static async actualizarNota(req, res) {
    const b = req.body || {};
    const id = req.params?.id ?? b.id;
    const id_curso_matriculado = b.id_curso_matriculado ?? b.idCursoMatriculado;
    const id_modulo = b.id_modulo ?? b.idModulo;
    const { estado } = req.body || {};
    try {
      let nota;
      if (id) {
        nota = await CalificacionesService.actualizarNota(Number(id), estado);
      } else if (id_curso_matriculado && id_modulo) {
        nota = await CalificacionesService.actualizarNotaByMatriculaModulo(Number(id_curso_matriculado), Number(id_modulo), estado);
      } else {
        return res.status(400).json({ mensaje: 'Debe enviar id ó (id_curso_matriculado e id_modulo) para actualizar' });
      }
      res.status(200).json({ mensaje: 'Nota actualizada correctamente', nota });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al actualizar la nota', error: error.message });
    }
  }

  static async eliminarNota(req, res) {
    const { id } = req.params;
    try {
      if (!id) return res.status(400).json({ mensaje: 'ID de nota es obligatorio' });
      const r = await CalificacionesService.eliminarNota(id);
      res.status(200).json(r);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al eliminar la nota', error: error.message });
    }
  }

  static async listarNotasPorModuloOferta(req, res) {
    const { id_modulo, id_oferta_curso } = req.params;
    try {
      const notas = await CalificacionesService.listarNotasPorModuloOferta(Number(id_modulo), Number(id_oferta_curso));
      res.status(200).json({ mensaje: 'Notas listadas correctamente', notas });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar notas por módulo y oferta', error: error.message });
    }
  }

  static async obtenerNotaPorId(req, res) {
    const { id } = req.params;
    try {
      const nota = await CalificacionesService.obtenerNotaPorId(id);
      res.status(200).json({ mensaje: 'Nota obtenida correctamente', nota });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener la nota', error: error.message });
    }
  }

  static async listarTodas(req, res) {
    try {
      const notas = await CalificacionesService.listarTodasNotas(req.query || {});
      res.status(200).json({ mensaje: 'Notas listadas correctamente', notas });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al listar todas las notas', error: error.message });
    }
  }
}

module.exports = CalificacionesController;