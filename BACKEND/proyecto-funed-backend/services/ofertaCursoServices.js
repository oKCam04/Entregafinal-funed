const { ofertacurso, docente, curso, persona, modulodocente } = require('../models');
const { Op } = require('sequelize');

class OfertaCursoService {
    static async listarOfertasCursos() {
        try {
            return await ofertacurso.findAll({
                include:[ 
                {model: curso, as: 'curso', attributes: ['id', 'nombre_curso']}]
            });
        } catch (error) {
            console.log(error.message);
            throw new Error("Error al listar ofertas de cursos: " + error.message);
        }
    }

    static async crearOfertaCurso(codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto ) {
        try {
            return await ofertacurso.create({ codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto  });
        } catch (error) {
            throw new Error("Error al crear oferta de curso: " + error.message);
        }
    }

    static async actualizarOfertaCurso(id ,codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto ) {
        try {
            const oferta = await ofertacurso.findByPk(id);
            if (!oferta) throw new Error("Oferta de curso no encontrada");
            return await oferta.update({ codigo_curso, id_curso, fecha_inicio_curso, fecha_fin_curso, horario, cupos, idDocente,precio,foto  });
        } catch (error) {
            throw new Error("Error al actualizar oferta de curso: " + error.message);
        }
    }

    static async eliminarOfertaCurso(id) {
        try {
            const oferta = await ofertacurso.findByPk(id);
            if (!oferta) throw new Error("Oferta de curso no encontrada");
            return await oferta.destroy();
        } catch (error) {
            throw new Error("Error al eliminar oferta de curso: " + error.message);
        }
    }

  static async obtenerOfertaCursoPorId(id) {
        try {
            const oferta = await ofertacurso.findByPk(id, {
                include: [
                { model: curso, as: 'curso', attributes: ['id', 'nombre_curso','duracion','temario','tipo_curso'] }
                ]
            });
            if (!oferta) throw new Error("Oferta de curso no encontrada");
            return oferta;
        } catch (error) {
            console.log(error.message);
            throw new Error("Error al obtener oferta de curso: " + error.message);
        }
  }

  static async listarOfertasPorDocente(id_docente) {
    try {
      // Buscar asignaciones en modulo_docente para este docente
      const asignaciones = await modulodocente.findAll({
        where: { id_docente },
        attributes: ['id_oferta_curso'],
        raw: true,
      });

      const ofertaIds = Array.from(
        new Set((asignaciones || []).map((a) => a.id_oferta_curso).filter(Boolean))
      );

      if (ofertaIds.length === 0) return [];

      // Traer las ofertas correspondientes, incluyendo datos del curso
      const ofertas = await ofertacurso.findAll({
        where: { id: { [Op.in]: ofertaIds } },
        include: [{ model: curso, as: 'curso', attributes: ['id', 'nombre_curso'] }],
      });
      return ofertas;
    } catch (error) {
      throw new Error('Error al listar ofertas por docente: ' + error.message);
    }
  }

}

module.exports = OfertaCursoService;